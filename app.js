const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const session = require("express-session");
const path = require("path");
const mime = require('mime-types');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Validate required environment variables
const REQUIRED_ENV = ['SESSION', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values');
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

require('ts-node').register({
  project: path.join(__dirname, "tsconfig.json")
});

const {sequelize, User, File} = require("./database/associations");

const PORT = process.env.PORT || 3000;

const app = express();
const upload = multer();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "https:"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { message: "Upload limit reached, try again later" },
  keyGenerator: (req) => req.session?.userId?.toString() || req.ip,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { message: "Rate limit exceeded" },
});

app.use('/api/', apiLimiter);

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

app.post("/signup", authLimiter, async (req, res) => {
  const {firstname, lastname, username, password} = req.body;

  try {
    let user = await User.findOne({where: {username: username}});

    if (user && user.isSoftDeleted()) {
      await user.restore();
      await user.update({ firstname, lastname, password });
      req.session.user = user;
      return res.status(200).json({
        ok: true,
        location: "/dashboard",
      });
    } else if (user) {
      return res.status(409).json({ message: "Username already taken" });
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

app.post("/login", authLimiter, async (req, res) => {
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

app.post("/upload", uploadLimiter, userMil, upload.array("files"), async (req, res) => {
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

    const updates = { username, firstname, lastname };
    Object.assign(user, updates);
    await user.save();

    return res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (e) {
    return res.status(500).json({ok: false, message: e.message})
  }
})

app.get("/uploads/:name", async (req, res) => {
  try {
    const file = await File.findOne({ where: { name: req.params.name } });
    if (!file || file.deletedAt) {
      return res.status(404).json({ message: "File not found" });
    }

    // Private files require authenticated owner
    if (!file.visibility) {
      if (!req.session || !req.session.userId) {
        return res.status(403).json({ message: "This file is private" });
      }
      if (file.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    res.send(file.file);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve file" });
  }
});

// Health checks
app.get('/health/live', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

app.get('/health/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    env: process.env.NODE_ENV || 'development',
  });
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
