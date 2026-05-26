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

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { message: "Upload limit reached, try again later" },
  keyGenerator: (req) => req.session?.user?.id?.toString() || req.ip,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
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
      where: { username: sessionUser.username }
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

app.get("/dashboard", async (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).redirect("/");

  try {
    const user = await User.findOne({ where: { username: sessionUser.username } });
    if (!user) return res.status(403).redirect("/");
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/");
  }
});

app.get("/user", userMil, async (req, res) => {
  try {
    let user = await User.findOne({
      where: { username: req.user.username },
      attributes: { exclude: ["password"] }
    });

    let data = {
      ...user.toJSON(),
      files: await user.getFiles({ raw: true })
    };

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: e.message, location: "/" });
  }
});

app.post("/signup", authLimiter, async (req, res) => {
  const {firstname, lastname, username, password} = req.body;

  try {
    let user = await User.findOne({ where: { username }, paranoid: false });

    if (user && user.isSoftDeleted()) {
      await user.restore();
      await user.update({ firstname, lastname, password });
      req.session.user = user;
      return res.status(200).json({ ok: true, location: "/dashboard" });
    } else if (user) {
      return res.status(409).json({ ok: false, message: "Username already taken" });
    }

    let c = await User.create({ firstname, lastname, username, password });
    if (c) {
      req.session.user = c;
      return res.status(200).json({ ok: true, location: "/dashboard" });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message, location: "/" });
  }
});

app.post("/login", authLimiter, async (req, res) => {
  const {username, password} = req.body;

  try {
    let user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found", location: "/" });
    }

    if (user.isSoftDeleted()) {
      return res.status(403).json({ ok: false, message: "User is deleted", location: "/" });
    }

    if (!user.isValidPassword(password)) {
      return res.status(401).json({ ok: false, message: "Incorrect username or password", location: "/" });
    }

    req.session.user = user;
    return res.status(200).json({ ok: true, location: "/dashboard" });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ ok: false, message: e.message, location: "/" });
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
      files: savedFiles.map(f => ({ id: f.id, name: f.name, uuid: f.uuid, visibility: f.visibility })),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, message: "Failed to upload files" });
  }
});

app.get("/files", userMil, async (req, res) => {
  const {user} = req;
  if (!user || user.deletedAt) {
    return res.status(403).json({ ok: false, message: "User does not exist or is deleted" });
  }

  let files = await user.getFiles({
    attributes: ["id", "name", "file", "visibility", "createdAt", "deletedAt"],
    paranoid: false,
    raw: true,
  });

  return res.status(200).json({ ok: true, files });
});

app.post("/action/:type/:id", userMil, async (req, res) => {
  const {type, id} = req.params;
  const {visibility = null, name = null} = req.body;
  const {user} = req;

  try {
    let files = await user.getFiles({ where: {id}, paranoid: false, limit: 1 });
    if (!files || files.length === 0) {
      return res.status(404).json({ ok: false, message: "File does not exist" });
    }
    let file = files[0];

    switch (type) {
      case "visibility":
        if (visibility === null || !(visibility === "1" || visibility === "0")) {
          return res.status(400).json({ ok: false, message: "Invalid param visibility" });
        }
        await file.update({ visibility: visibility === "1" });
        return res.status(200).json({ ok: true, message: "File visibility updated" });

      case "name":
        if (!name) return res.status(400).json({ ok: false, message: "Invalid name" });
        await file.update({ name });
        return res.status(200).json({ ok: true, message: "File updated" });

      case "delete":
        if (file.isSoftDeleted()) return res.status(400).json({ ok: false, message: "File already deleted" });
        await file.destroy();
        return res.status(200).json({ ok: true, message: "File deleted" });

      case "recover":
        if (!file.isSoftDeleted()) return res.status(400).json({ ok: false, message: "File is not deleted" });
        await file.restore();
        return res.status(200).json({ ok: true, message: "File restored" });

      default:
        return res.status(400).json({ ok: false, message: "Invalid action" });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
});

app.put("/change", userMil, async (req, res) => {
  const {user} = req;
  let {username = null, firstname = null, lastname = null} = req.body;

  try {
    if (username === null)  username  = user.username;
    if (firstname === null) firstname = user.firstname;
    if (lastname === null)  lastname  = user.lastname;

    Object.assign(user, { username, firstname, lastname });
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
    return res.status(500).json({ ok: false, message: e.message });
  }
});

/**
 * GET /uploads/:name
 *
 * Public files: served to anyone, scoped to public+non-deleted records first.
 * Private files: require authenticated session owner.
 *
 * Scoping prevents nondeterministic results when multiple users share a filename.
 */
app.get("/uploads/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // 1. Try a public, non-deleted file first
    const publicFile = await File.findOne({ where: { name, visibility: true } });
    if (publicFile && !publicFile.deletedAt) {
      res.setHeader('Content-Type', mime.lookup(publicFile.name) || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Content-Disposition', `inline; filename="${publicFile.name}"`);
      return res.send(publicFile.file);
    }

    // 2. Private file — require authenticated session; use session.user.id (not session.userId)
    const sessionUserId = req.session?.user?.id;
    if (!sessionUserId) {
      return res.status(403).json({ ok: false, message: "This file is private" });
    }

    const privateFile = await File.findOne({
      where: { name, visibility: false, userId: sessionUserId }
    });

    if (!privateFile || privateFile.deletedAt) {
      return res.status(404).json({ ok: false, message: "File not found" });
    }

    res.setHeader('Content-Type', mime.lookup(privateFile.name) || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, no-cache');
    res.setHeader('Content-Disposition', `inline; filename="${privateFile.name}"`);
    return res.send(privateFile.file);
  } catch (err) {
    console.error("Error serving file:", err);
    return res.status(500).json({ ok: false, message: "Failed to retrieve file" });
  }
});

// Health checks
app.get('/health/live', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/health/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

app.get('/health/version', (req, res) => {
  res.json({ version: process.env.npm_package_version || '1.0.0', node: process.version, env: process.env.NODE_ENV || 'development' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, './short/build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, './short/build', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
