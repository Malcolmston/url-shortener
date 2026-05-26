/**
 * GET  /api/v1/user          — current user profile + stats
 * PUT  /api/v1/user          — update profile (firstname, lastname, username)
 */
const { Router } = require('express');
const { requireAuth } = require('./auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { User } = require('../../database/associations');
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

    const files = await user.getFiles({ raw: true });
    res.json({ ...user.toJSON(), files });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

router.put('/', requireAuth, async (req, res) => {
  const { username, firstname, lastname } = req.body;

  try {
    const { User } = require('../../database/associations');
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

    // Check username uniqueness if changing it
    if (username && username !== user.username) {
      const conflict = await User.findOne({ where: { username } });
      if (conflict) return res.status(409).json({ ok: false, message: 'Username is already taken' });
    }

    const updates = {};
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname  !== undefined) updates.lastname  = lastname;
    if (username  !== undefined) updates.username  = username;

    await user.update(updates);

    const updated = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
    });
    const files = await updated.getFiles({ raw: true });

    res.json({ ok: true, message: 'Profile updated', user: { ...updated.toJSON(), files } });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
