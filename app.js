const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const mime = require('mime-types');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
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

const {sequelize, User, File, Link, PasswordResetToken, ApiKey, UserSession} = require("./database/associations");
const { generateSlug, validateSlug, validateUrl } = require('./utils/slugify');
const { v4: uuidv4 } = require('uuid');
const { generateApiKey, hashApiKey } = require('./utils/apiKey');
const configurePassport = require('./utils/passport');

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
  keyGenerator: (req) => req.session?.user?.id?.toString() || req.ip,
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

// Passport.js authentication
configurePassport(passport, User);
app.use(passport.initialize());
app.use(passport.session());

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
      where: { username: sessionUser.username }
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
    userId: req.user.id,  // use req.user.id set by userMil — req.session.userId is not set
    redirectType: ['301','302','307'].includes(redirectType) ? redirectType : '302',
    hasPreview: !!hasPreview,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isPasswordProtected: !!password,
  };

  if (password) {
    const saltRounds = parseInt(process.env.SALT || '10');
    linkData.passwordHash = await bcrypt.hash(password, saltRounds);
=======
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
      where: { userId: req.user.id },  // use req.user.id — req.session.userId is not set
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
      where: { id: req.params.id, userId: req.user.id }  // use req.user.id
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
      where: { id: req.params.id, userId: req.user.id }  // use req.user.id
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
      where: { id: req.params.id, userId: req.user.id },  // use req.user.id
      paranoid: false,
    });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    await link.restore();
    res.json({ ok: true, message: 'Link restored' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore link' });
  }
});

// ============================================================
// STANDARD APP ROUTES
// Note: /:slug redirect is placed AFTER these specific routes so that
// /dashboard, /user, /signup etc. are never intercepted by the slug handler.
// ============================================================

app.get("/dashboard",async (req, res, next) => {
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

// ── Slug redirect — MUST come after all specific named routes ──────────────
//
// This route matches any single-segment path that looks like a slug.
// It is intentionally placed AFTER /dashboard, /user, /login, etc. to
// prevent those routes from being shadowed by the slug handler.
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
//
// IMPORTANT: Do NOT pre-hash the password before user.update().
// User.ts has a beforeUpdate hook that re-hashes any changed password
// field automatically.  Pre-hashing here would store bcrypt(bcrypt(pw)),
// making the new password unusable at login.
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

    // Pass raw password — User.ts beforeUpdate hook (hashSync) will hash it.
    await resetToken.user.update({ password });
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

// List active sessions
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
// Deletes from both the UserSession tracking table AND the session store so
// the target device's cookie is immediately invalidated.
app.delete('/api/sessions/:id', userMil, async (req, res) => {
  try {
    const session = await UserSession.findOne({
      where: { id: req.params.id, userId: req.session.userId }
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.sessionId === req.sessionID) {
      return res.status(400).json({ message: 'Cannot revoke your current session. Use POST /logout instead.' });
    }

    const sessionIdToRevoke = session.sessionId;
    await session.destroy(); // Remove tracking row

    // Also remove from the session store so the cookie becomes invalid immediately.
    // req.sessionStore is always present when express-session is configured.
    if (req.sessionStore && sessionIdToRevoke) {
      req.sessionStore.destroy(sessionIdToRevoke, (err) => {
        if (err) console.error('Failed to destroy session from store:', err);
      });
    }

    res.json({ ok: true, message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke session' });
  }
});

// Revoke all other sessions
app.post('/api/sessions/revoke-others', userMil, async (req, res) => {
  try {
    const { Op } = require('sequelize');

    // Collect session IDs to revoke before deleting tracking rows
    const sessionsToRevoke = await UserSession.findAll({
      where: {
        userId:    req.session.userId,
        sessionId: { [Op.ne]: req.sessionID },
      },
      attributes: ['id', 'sessionId'],
    });

    const sessionIds = sessionsToRevoke.map(s => s.sessionId).filter(Boolean);

    // Delete tracking rows
    await UserSession.destroy({
      where: {
        userId:    req.session.userId,
        sessionId: { [Op.ne]: req.sessionID },
      },
    });

    // Destroy each session in the store (non-blocking)
    if (req.sessionStore) {
      sessionIds.forEach(sid => {
        req.sessionStore.destroy(sid, (err) => {
          if (err) console.error(`Failed to destroy session ${sid} from store:`, err);
        });
      });
    }

    res.json({ ok: true, message: 'All other sessions have been revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to revoke sessions' });
  }
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


// Export for Vercel serverless
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Snip server running on port ${PORT}`);
  });
}

module.exports = app;
