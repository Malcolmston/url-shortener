/**
 * POST   /api/v1/auth/login      — Passport local login
 * POST   /api/v1/auth/signup     — Register new account
 * POST   /api/v1/auth/logout     — Destroy session
 * GET    /api/v1/auth/me         — Return authenticated user
 */
const { Router } = require('express');
const passport   = require('passport');
const bcrypt     = require('bcrypt');

const router = Router();

// ── Middleware ─────────────────────────────────────────────────────────────

/** Require an authenticated Passport session. */
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ ok: false, message: 'Not authenticated' });
}

// ── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Body: { username, password }
 * Authenticates with passport-local; on success stores user in session.
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: info?.message || 'Invalid credentials',
      });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({
        ok: true,
        message: 'Logged in successfully',
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
        },
        location: '/dashboard',
      });
    });
  })(req, res, next);
});

/**
 * POST /api/v1/auth/signup
 * Body: { firstname, lastname, username, password }
 */
router.post('/signup', async (req, res, next) => {
  const { firstname, lastname, username, password } = req.body;

  if (!username || !password || !firstname || !lastname) {
    return res.status(400).json({ ok: false, message: 'All fields are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters' });
  }

  try {
    // Dynamically require User so this router works even if loaded before DB sync
    const { User } = require('../../database/associations');

    const existing = await User.findOne({ where: { username }, paranoid: false });
    if (existing && existing.isSoftDeleted && existing.isSoftDeleted()) {
      return res.status(409).json({ ok: false, message: 'That username is no longer available' });
    }
    if (existing) {
      return res.status(409).json({ ok: false, message: 'Username is already taken' });
    }

    const saltRounds = parseInt(process.env.SALT || '10');
    const hash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ firstname, lastname, username, password: hash });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({
        ok: true,
        message: 'Account created',
        user: { id: user.id, username: user.username },
        location: '/dashboard',
      });
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', requireAuth, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true, message: 'Logged out' });
    });
  });
});

/**
 * GET /api/v1/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { User } = require('../../database/associations');
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

    const files = await user.getFiles({ raw: true });
    return res.json({ ok: true, user: { ...user.toJSON(), files } });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * GET /api/v1/auth/check-username/:username
 * Returns { available: true|false }
 */
router.get('/check-username/:username', async (req, res) => {
  try {
    const { User } = require('../../database/associations');
    const existing = await User.findOne({ where: { username: req.params.username } });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
