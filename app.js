require('dotenv').config();
const express  = require("express");
const multer   = require("multer");
const morgan   = require("morgan");
const session  = require("express-session");
const passport = require("passport");
const path     = require("path");
const mime     = require("mime-types");

require('ts-node').register({
  project: path.join(__dirname, "tsconfig.json")
});

const { sequelize, User, File } = require("./database/associations");
const configurePassport = require('./utils/passport');
const { serveFile }     = require('./routes/v1/files');
const v1Router          = require('./routes/v1');
const v2Router          = require('./routes/v2');

// ── Validate critical env vars ─────────────────────────────────────────────
if (!process.env.SESSION) {
  const msg = 'FATAL: SESSION environment variable is not set';
  if (process.env.NODE_ENV === 'production') { console.error(msg); process.exit(1); }
  else console.warn(msg);
}

const PORT = parseInt(process.env.PORT || '3000', 10);

// ── Sequelize sync ─────────────────────────────────────────────────────────
(async () => {
  await sequelize.sync({ force: false });
})();

// ── App setup ──────────────────────────────────────────────────────────────
const app    = express();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// ── Logging (Morgan) ───────────────────────────────────────────────────────
// Concise in dev, combined (Apache-style) in prod
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Session ────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── Passport ───────────────────────────────────────────────────────────────
configurePassport(passport, User);
app.use(passport.initialize());
app.use(passport.session());

// ── Health endpoints ───────────────────────────────────────────────────────
app.get('/health/live',    (req, res) => res.json({ status: 'ok' }));
app.get('/health/ready',   async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});
app.get('/health/version', (req, res) => {
  const pkg = require('./package.json');
  res.json({ name: pkg.name, version: pkg.version, node: process.version });
});

// ── Versioned API routes ───────────────────────────────────────────────────
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// ── Legacy compatibility routes (kept for old frontend code) ───────────────

/**
 * GET /user — delegates to GET /api/v1/user
 * Kept so existing account.jsx still works without a frontend change.
 */
app.get('/user', (req, res, next) => {
  req.url = '/';
  v1Router.handle(Object.assign(req, { url: '/user/' }), res, next);
});

/**
 * POST /login — delegates to /api/v1/auth/login (Passport)
 */
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ ok: false, message: info?.message || 'Invalid credentials', location: '/' });
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ ok: true, location: '/dashboard' });
    });
  })(req, res, next);
});

/**
 * POST /signup — delegates to /api/v1/auth/signup
 */
app.post('/signup', async (req, res, next) => {
  const { firstname, lastname, username, password } = req.body;
  if (!username || !password || !firstname || !lastname) {
    return res.status(400).json({ ok: false, message: 'All fields are required' });
  }
  try {
    const existing = await User.findOne({ where: { username }, paranoid: false });
    if (existing && existing.isSoftDeleted && existing.isSoftDeleted()) {
      return res.status(409).json({ ok: false, message: 'That username is no longer available', location: '/' });
    }
    if (existing) {
      return res.status(409).json({ ok: false, message: 'Username is already taken', location: '/' });
    }
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, parseInt(process.env.SALT || '10'));
    const user = await User.create({ firstname, lastname, username, password: hash });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ ok: true, location: '/dashboard' });
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /logout — destroy Passport session
 */
app.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true, message: 'Logged out' });
    });
  });
});

/**
 * GET /files — legacy; delegates to /api/v1/files
 */
app.get('/files', (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ ok: false, message: 'Not authenticated' });
  req.url = '/';
  v1Router.handle(Object.assign(req, { url: '/files/' }), res, next);
});

/**
 * POST /upload — legacy multipart upload
 */
app.post('/upload', upload.array('files'), async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ ok: false, message: 'Not authenticated' });
  if (!req.files || req.files.length === 0) return res.status(400).json({ ok: false, message: 'No files uploaded' });
  try {
    const saved = [];
    for (const f of req.files) {
      const record = await File.create({
        name: f.originalname, file: f.buffer, type: f.mimetype,
        visibility: true, userId: req.user.id,
      });
      saved.push({ id: record.id, name: record.name, uuid: record.uuid, visibility: record.visibility });
    }
    res.status(200).json({ ok: true, message: 'Files uploaded', files: saved });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * POST /action/:type/:id — legacy file action
 */
app.post('/action/:type/:id', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ ok: false, message: 'Not authenticated' });
  const { type, id } = req.params;
  const { visibility = null, name = null } = req.body;
  try {
    const files = await req.user.getFiles({ where: { id }, paranoid: false, limit: 1 });
    if (!files || !files.length) return res.status(404).json({ ok: false, message: 'File not found' });
    const file = files[0];
    switch (type) {
      case 'visibility':
        if (visibility === null) return res.status(400).json({ ok: false, message: 'visibility required' });
        await file.update({ visibility: visibility === '1' });
        return res.json({ ok: true, message: 'Visibility updated' });
      case 'name':
        if (!name) return res.status(400).json({ ok: false, message: 'name required' });
        await file.update({ name });
        return res.json({ ok: true, message: 'File renamed' });
      case 'delete':
        await file.destroy();
        return res.json({ ok: true, message: 'File deleted' });
      case 'recover':
        await file.restore();
        return res.json({ ok: true, message: 'File restored' });
      default:
        return res.status(400).json({ ok: false, message: 'Unknown action' });
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * PUT /change — legacy profile update
 */
app.put('/change', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ ok: false, message: 'Not authenticated' });
  const { username, firstname, lastname } = req.body;
  try {
    const updates = {};
    if (username !== undefined)  updates.username  = username;
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname !== undefined)  updates.lastname  = lastname;
    await req.user.update(updates);
    const refreshed = await User.findOne({ where: { id: req.user.id }, attributes: { exclude: ['password'] } });
    const files = await refreshed.getFiles({ raw: true });
    res.json({ ok: true, message: 'User updated', user: { ...refreshed.toJSON(), files } });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * GET /uploads/:name — serve file buffer (public or authenticated private)
 */
app.get('/uploads/:name', serveFile);

/**
 * GET /dashboard — SPA entry (auth guard on frontend)
 */
app.get('/dashboard', (req, res, next) => next());

// ── Static files (React build) ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, './short/build')));

// ── SPA catch-all ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, './short/build', 'index.html'));
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    ok: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// ── Server start (skip in serverless/Vercel) ───────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Snip running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
