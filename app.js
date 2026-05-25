const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const session = require("express-session");
const path = require("path");
const mime = require('mime-types');
require("dotenv").config();

require('ts-node').register({
  project: path.join(__dirname, "tsconfig.json")
});

const {sequelize, User, File, Link} = require("./database/associations");
const { generateSlug, validateSlug, validateUrl } = require('./utils/slugify');
const bcrypt = require('bcrypt');

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
    next();
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error", location: "/" });
  }
};

// ============================================================
// LINK / URL SHORTENER ROUTES
// ============================================================

// Check slug availability
app.get('/api/links/slug-check/:slug', async (req, res) => {
  const { slug } = req.params;
  const validation = validateSlug(slug);
  if (!validation.valid) {
    return res.json({ available: false, reason: validation.reason });
  }
  try {
    const existing = await Link.findOne({ where: { slug } });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ available: false, reason: 'Server error' });
  }
});

// Create a short link
app.post('/api/links', userMil, async (req, res) => {
  const {
    url, customSlug, expiresAt, password,
    redirectType = '302', hasPreview = false
  } = req.body;

  if (!validateUrl(url)) {
    return res.status(400).json({ message: 'Invalid URL — must start with http:// or https://' });
  }

  let slug = customSlug;
  if (slug) {
    const validation = validateSlug(slug);
    if (!validation.valid) return res.status(400).json({ message: validation.reason });
    const exists = await Link.findOne({ where: { slug } });
    if (exists) return res.status(409).json({ message: 'Slug already taken' });
  } else {
    // Auto-generate unique slug
    let attempts = 0;
    do {
      slug = generateSlug(6 + Math.floor(attempts / 5));
      attempts++;
    } while (await Link.findOne({ where: { slug } }) && attempts < 20);
  }

  const linkData = {
    slug,
    originalUrl: url,
    userId: req.session.userId,
    redirectType: ['301','302','307'].includes(redirectType) ? redirectType : '302',
    hasPreview: !!hasPreview,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isPasswordProtected: !!password,
  };

  if (password) {
    const saltRounds = parseInt(process.env.SALT || '10');
    linkData.passwordHash = await bcrypt.hash(password, saltRounds);
  }

  try {
    const link = await Link.create(linkData);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      ok: true,
      link: {
        id: link.id,
        slug: link.slug,
        shortUrl: `${baseUrl}/${link.slug}`,
        originalUrl: link.originalUrl,
        redirectType: link.redirectType,
        hasPreview: link.hasPreview,
        isPasswordProtected: link.isPasswordProtected,
        expiresAt: link.expiresAt,
        clicks: link.clicks,
        createdAt: link.createdAt,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create link' });
  }
});

// List user's links
app.get('/api/links', userMil, async (req, res) => {
  try {
    const links = await Link.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']],
      paranoid: false, // include soft-deleted
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      links: links.map(l => ({
        id: l.id,
        slug: l.slug,
        shortUrl: `${baseUrl}/${l.slug}`,
        originalUrl: l.originalUrl,
        redirectType: l.redirectType,
        hasPreview: l.hasPreview,
        isPasswordProtected: l.isPasswordProtected,
        expiresAt: l.expiresAt,
        isActive: l.isActive,
        clicks: l.clicks,
        createdAt: l.createdAt,
        deletedAt: l.deletedAt,
        isExpired: l.isExpired(),
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch links' });
  }
});

// Update a link
app.put('/api/links/:id', userMil, async (req, res) => {
  try {
    const link = await Link.findOne({
      where: { id: req.params.id, userId: req.session.userId }
    });
    if (!link) return res.status(404).json({ message: 'Link not found' });

    const { url, expiresAt, redirectType, hasPreview, isActive } = req.body;
    if (url) {
      if (!validateUrl(url)) return res.status(400).json({ message: 'Invalid URL' });
      link.originalUrl = url;
    }
    if (expiresAt !== undefined) link.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (redirectType && ['301','302','307'].includes(redirectType)) link.redirectType = redirectType;
    if (hasPreview !== undefined) link.hasPreview = !!hasPreview;
    if (isActive !== undefined) link.isActive = !!isActive;

    await link.save();
    res.json({ ok: true, link });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update link' });
  }
});

// Soft-delete a link
app.delete('/api/links/:id', userMil, async (req, res) => {
  try {
    const link = await Link.findOne({
      where: { id: req.params.id, userId: req.session.userId }
    });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    await link.destroy(); // paranoid soft delete
    res.json({ ok: true, message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete link' });
  }
});

// Restore a soft-deleted link
app.post('/api/links/:id/restore', userMil, async (req, res) => {
  try {
    const link = await Link.findOne({
      where: { id: req.params.id, userId: req.session.userId },
      paranoid: false,
    });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    await link.restore();
    res.json({ ok: true, message: 'Link restored' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore link' });
  }
});

// THE REDIRECT ROUTE — must be placed LAST among link routes but BEFORE static routes
app.get('/:slug([a-zA-Z0-9_-]{3,50})', async (req, res) => {
  const { slug } = req.params;

  try {
    const link = await Link.findOne({ where: { slug, isActive: true } });

    if (!link) return res.status(404).sendFile(path.join(__dirname, 'short/build', 'index.html'));

    // Expired link
    if (link.isExpired()) {
      return res.status(410).json({ message: 'This link has expired' });
    }

    // Password-protected link — redirect to unlock page
    if (link.isPasswordProtected) {
      return res.redirect(`/l/${slug}`);
    }

    // Preview interstitial
    if (link.hasPreview) {
      return res.redirect(`/p/${slug}`);
    }

    // Increment click count (non-blocking)
    Link.increment('clicks', { where: { id: link.id } }).catch(() => {});

    // Redirect
    const statusCode = parseInt(link.redirectType) || 302;
    return res.redirect(statusCode, link.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Redirect failed' });
  }
});

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
