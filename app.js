const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const session = require("express-session");
const path = require("path");
const mime = require('mime-types');
const bcrypt = require("bcrypt");
require("dotenv").config();

require('ts-node').register({
  project: path.join(__dirname, "tsconfig.json")
});

const {sequelize, User, File, PasswordResetToken, ApiKey, UserSession} = require("./database/associations");
const { v4: uuidv4 } = require('uuid');
const { generateApiKey, hashApiKey } = require('./utils/apiKey');

const PORT = process.env.PORT || 3000;

const app = express();
const upload = multer();

// Database sync
(async () => {
  await sequelize.sync({ force: false });
})();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"))
app.use(session({
  secret: process.env.SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false, httpOnly: true, sameSite: "strict"},
}))

// Track session activity
app.use(async (req, res, next) => {
  if (req.session && req.session.userId && req.sessionID) {
    // Non-blocking session tracking
    UserSession.upsert({
      userId:         req.session.userId,
      sessionId:      req.sessionID,
      ipAddress:      req.ip,
      userAgent:      req.headers['user-agent']?.substring(0, 500),
      lastActivityAt: new Date(),
    }).catch(() => {}); // never block request on this
  }
  next();
});

const userMil = async (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ ok: false, message: "Not authenticated", location: "/" });
  }

  try {
    const user = await User.findOne({
      where: {
        username: sessionUser.username
      }
    });

    if (!user) {
      return res.status(403).json({ ok: false, message: "User not found or deleted", location: "/" });
    }

    req.user = user;
    // Ensure session.userId is always populated for shared auth logic
    req.session.userId = user.id;
    next();
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error", location: "/" });
  }
};

// API Key authentication middleware
const apiKeyAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'API key required. Use: Authorization: Bearer sk_snp_...' });
  }
  const rawKey = authHeader.slice(7);
  const keyHash = hashApiKey(rawKey);
  const apiKey = await ApiKey.findOne({
    where: { keyHash, isActive: true },
    include: [{ model: User, as: 'user' }]
  });
  if (!apiKey || apiKey.isExpired()) {
    return res.status(401).json({ message: 'Invalid or expired API key' });
  }
  // Update last used (non-blocking)
  ApiKey.update({ lastUsedAt: new Date() }, { where: { id: apiKey.id } }).catch(() => {});
  req.apiKey = apiKey;
  req.apiUser = apiKey.user;
  req.session = req.session || {};
  req.session.userId = apiKey.userId; // allow shared auth logic
  next();
};

app.get("/dashboard",async (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).redirect("/")
  }

  try {
    const user = await User.findOne({
      where: {
        username: sessionUser.username
      }
    });

    if (!user) {
      return res.status(403).redirect("/")
    }

    if (!user) return res.redirect("/");

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/")
  }
})

app.get("/user", userMil, async (req, res) => {
  try {

    let user = await User.findOne({
      where: {
        username: req.user.username
      },
      attributes: {
        exclude: ["password"]
      }
    })

    let data = {
      ...user.toJSON(),
      files: await user.getFiles({
        raw: true,
      })
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: e.message, location: "/" });
  }
})

app.post("/signup", async (req, res) => {
  const {firstname, lastname, username, password} = req.body;

  try {
    let user = await User.findOne({where: {username: username}});

    if( user) {
      return res.status(402).json({
        ok: false,
        message: "User already exists",
        location: "/"
      })
    } else if( user.isSoftDeleted() ) {
      return res.status(403).json({
        ok: false,
        message: "User is deleted",
        location: "/"
      })
    }

    let c = await User.create({
      firstname,
      lastname,
      username,
      password,
    })

    if( c ) {
      req.session.user = c;
      return res.status(200).json({
        ok: true,
        location: "/dashboard",
      })
    }
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: e.message,
      location: "/"
    })
  }
});

app.post("/login", async (req, res) => {
  const {username, password} = req.body;

  try {
    let user = await User.findOne({
      where: {username: username}
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "User not found",
        location: "/"
      });
    }

    if (user.isSoftDeleted()) {
      return res.status(403).json({
        ok: false,
        message: "User is deleted",
        location: "/"
      })
    }

    if (!user.isValidPassword(password)) {
      return res.status(401).json({
        ok: false,
        message: "Incorrect username or password",
        location: "/"
      });
    }

    req.session.user = user;

    return res.status(200).json({
      ok: true,
      location: "/dashboard",
    })
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({
      ok: false,
      message: e.message,
      location: "/"
    });
  }
});

app.post("/upload",userMil, upload.array("files"), async (req, res) => {
  const {user} = req;
  if (!user || user.deletedAt) {
    return res.status(403).json({ ok: false, message: "User does not exist or is deleted" });
  }

  try {
    const savedFiles = [];

    for (const file of req.files) {
      const newFile = await File.create({
        name: file.originalname,
        file: file.buffer,
        type: file.mimetype,
        visibility: true,
        userId: user.id,
      });
      savedFiles.push(newFile);
    }

    await user.addFiles(savedFiles);

    return res.status(200).json({
      ok: true,
      message: "Files uploaded successfully",
      files: savedFiles.map(f => ({
        id: f.id,
        name: f.name,
        uuid: f.uuid,
        visibility: f.visibility,
      })),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, message: "Failed to upload files" });
  }
});

app.get("/files",userMil, async (req, res) => {
  const {user} = req;

  if (!user || user.deletedAt) {
    return res.status(403).json({ ok: false, message: "User does not exist or is deleted" });
  }

  let files = await user.getFiles({
    attributes: ["id","name", "file", "visibility", "createdAt", "deletedAt"],
    paranoid: false,
    raw: true,
  });

  return res.status(200).json({
    ok: true,
    files
  })
})

app.post("/action/:type/:id", userMil, async (req, res) => {
  const {type, id} = req.params;
  const {visibility = null, name = null} = req.body;
  const {user} = req;

  try {
    let files = await user.getFiles({
      where: {id},
      paranoid: false,
      limit: 1
    });

    // Fix: getFiles returns an array, so check if array is empty or get first item
    if (!files || files.length === 0) {
      return res.status(403).json({ ok: false, message: "file does not exist or is deleted" });
    }

    let file = files[0]; // Get the first (and only) file from the array

    switch (type) {
      case "visibility":
        if (visibility === null || !(visibility === "1" || visibility === "0")) {
          return res.status(403).json({ok: false, message: "Invalid param visibility"});
        }

        await file.update({ visibility: visibility === "1" });
        return res.status(200).json({ok: true, message: "File visibility updated successfully"});

      case "name":
        if (name === null) {
          return res.status(403).json({ok: false, message: "Invalid name"});
        }

        await file.update({ name: name });
        return res.status(200).json({ok: true, message: "File updated successfully"});

      case "delete":
        if (file.isSoftDeleted()) {
          return res.status(403).json({ok: false, message: "File was deleted"});
        }

        await file.destroy();
        return res.status(200).json({ok: true, message: "File was deleted"});

      case "recover":
        if (!file.isSoftDeleted()) {
          return res.status(403).json({ok: false, message: "File was not deleted"});
        }

        await file.restore();
        return res.status(200).json({ok: true, message: "File was restored"});

      default:
        return res.status(500).json({ok: false, message: "invalid parameter"});
    }

  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: e.message,
    });
  }
});

app.put("/change", userMil, async (req, res) => {
  const {user} = req;
  let {username = null, firstname = null, lastname = null} = req.body;

  try {
    if( username === null) username = user.username;
    if( firstname === null ) firstname = user.firstname;
    if( lastname === null ) lastname = user.lastname;

    const updatedUser = await User.findOne({
      where: { id: user.id },
      attributes: { exclude: ["password"] }
    });

    const userData = {
      ...updatedUser.toJSON(),
      files: await updatedUser.getFiles({ raw: true })
    };

    return res.status(200).json({
      ok: true,
      message: "User changed successfully",
      user: userData  // Return updated user data
    });
  } catch (e) {
    return res.status(500).json({ok: false, message: e.message})
  }
})

app.get("/uploads/:name", async (req, res) => {
  const {name} = req.params;

  console.log(name);

  try {
    let user = await User.findOne({
      where: {
        username: req.session.user.username
      }
    });

    if (!user) {
      return res.status(404).json({ok: false, message: "User not found"});
    }

    let files = await user.getFiles({
      where: {
        name: name
      },
      paranoid: false,
      limit: 1
    });

    if (!files || files.length === 0) {
      return res.status(404).json({ok: false, message: "File not found"});
    }

    let file = files[0];

    // Check if file is deleted
    if (file.deletedAt) {
      return res.status(410).json({ok: false, message: "File has been deleted"});
    }

    // Check visibility and authentication
    if (!file.visibility) {
      // Private file - check if user is authenticated and owns the file
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ok: false, message: "Authentication required for private files"});
      }

      // Add your authentication logic here
      // For example, if using JWT:
      try {
        const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.username !== username) {
          return res.status(403).json({ok: false, message: "Access denied"});
        }
      } catch (authError) {
        return res.status(401).json({ok: false, message: "Invalid authentication"});
      }
    }

    // Set appropriate headers
    res.set({
      'Content-Type': mime.lookup(file.name) || 'application/octet-stream',
      'Content-Length': file.file ? file.file.length : 0,
      'Cache-Control': file.visibility ? 'public, max-age=31536000' : 'private, no-cache',
      'Content-Disposition': `inline; filename="${file.name}"`
    });

    // Send the file buffer
    if (file.file) {
      res.send(file.file);
    } else {
      res.status(404).json({ok: false, message: "File data not found"});
    }

  } catch (e) {
    console.error("Error serving file:", e);
    return res.status(500).json({ok: false, message: "Internal server error"});
  }
});

// ============================================================
// AUTH IMPROVEMENT ROUTES
// ============================================================

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true, message: 'Logged out' });
  });
});

// Forgot password — sends reset token (email sending is a stub)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    const user = await User.findOne({ where: { username } });
    // Always return 200 to prevent username enumeration
    if (!user) return res.json({ ok: true, message: 'If that account exists, a reset email has been sent.' });

    // Invalidate existing tokens
    await PasswordResetToken.destroy({ where: { userId: user.id, usedAt: null } });

    // Create new token
    const token = await PasswordResetToken.create({
      userId: user.id,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // TODO: Send email with reset link
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token.token}`;
    console.log(`[DEBUG] Password reset link for ${username}: ${resetUrl}`);

    res.json({ ok: true, message: 'If that account exists, a reset email has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      include: [{ model: User, as: 'user' }]
    });

    if (!resetToken)                return res.status(400).json({ message: 'Invalid reset token' });
    if (resetToken.isExpired())     return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    if (resetToken.isUsed())        return res.status(400).json({ message: 'Reset token has already been used.' });

    const saltRounds = parseInt(process.env.SALT || '10');
    const newHash    = await bcrypt.hash(password, saltRounds);

    await resetToken.user.update({ password: newHash });
    await resetToken.update({ usedAt: new Date() });

    res.json({ ok: true, message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// ── API KEY MANAGEMENT ──

// List API keys (session auth)
app.get('/api/api-keys', userMil, async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { userId: req.session.userId },
      attributes: ['id', 'keyPrefix', 'label', 'scopes', 'lastUsedAt', 'expiresAt', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ keys });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch API keys' });
  }
});

// Create API key
app.post('/api/api-keys', userMil, async (req, res) => {
  try {
    const { label, scopes = ['*'], expiresAt } = req.body;
    if (!label || label.trim().length < 1) return res.status(400).json({ message: 'Label is required' });

    // Max 20 active keys per user
    const count = await ApiKey.count({ where: { userId: req.session.userId, isActive: true } });
    if (count >= 20) return res.status(429).json({ message: 'Maximum 20 API keys allowed. Delete some to create new ones.' });

    const { rawKey, keyHash, keyPrefix } = generateApiKey();
    const key = await ApiKey.create({
      userId:    req.session.userId,
      keyHash,
      keyPrefix,
      label:     label.trim(),
      scopes:    JSON.stringify(Array.isArray(scopes) ? scopes : ['*']),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.status(201).json({
      ok: true,
      key: {
        id:        key.id,
        rawKey,           // ONLY returned on creation — never stored in plaintext
        keyPrefix,
        label:     key.label,
        scopes:    key.getScopesArray(),
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      },
      warning: 'Copy this key now — it will NOT be shown again.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create API key' });
  }
});

// Revoke / delete API key
app.delete('/api/api-keys/:id', userMil, async (req, res) => {
  try {
    const key = await ApiKey.findOne({ where: { id: req.params.id, userId: req.session.userId } });
    if (!key) return res.status(404).json({ message: 'API key not found' });
    await key.update({ isActive: false });
    await key.destroy();
    res.json({ ok: true, message: 'API key revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke API key' });
  }
});

// ── SESSION MANAGEMENT ──

// List active sessions (stub — requires UserSession tracking middleware)
app.get('/api/sessions', userMil, async (req, res) => {
  try {
    const sessions = await UserSession.findAll({
      where: { userId: req.session.userId },
      order: [['lastActivityAt', 'DESC']],
      limit: 20,
    });
    res.json({
      sessions: sessions.map(s => ({
        id: s.id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        lastActivityAt: s.lastActivityAt,
        createdAt: s.createdAt,
        isCurrent: s.sessionId === req.sessionID,
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// Revoke a specific session
app.delete('/api/sessions/:id', userMil, async (req, res) => {
  try {
    const session = await UserSession.findOne({
      where: { id: req.params.id, userId: req.session.userId }
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.sessionId === req.sessionID) {
      return res.status(400).json({ message: 'Cannot revoke your current session. Use POST /logout instead.' });
    }
    await session.destroy();
    res.json({ ok: true, message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke session' });
  }
});

// Revoke all other sessions
app.post('/api/sessions/revoke-others', userMil, async (req, res) => {
  try {
    await UserSession.destroy({
      where: {
        userId:    req.session.userId,
        sessionId: { [require('sequelize').Op.ne]: req.sessionID }
      }
    });
    res.json({ ok: true, message: 'All other sessions have been revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke sessions' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, './short/build')));

app.use((req, res) => {
  console.log('Catch-all middleware hit, serving:', path.join(__dirname, './short/build', 'index.html'));
  res.sendFile(path.join(__dirname, './short/build', 'index.html'));
});


// Global error handler must come after all routes and middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
