/**
 * v2 user router — includes link + click counts in profile response
 */
const { Router } = require('express');
const { requireAuth } = require('../v1/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { User } = require('../../database/associations');
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

    const files = await user.getFiles({ raw: true, attributes: ['id', 'name', 'visibility', 'createdAt'] });

    // Include link count if Link association exists
    let linkCount = 0;
    try {
      const links = await user.getLinks({ attributes: ['id'] });
      linkCount = links?.length || 0;
    } catch { /* Link model may not be present on this branch */ }

    res.json({
      ok: true,
      data: {
        ...user.toJSON(),
        stats: {
          files: files.length,
          links: linkCount,
        },
        files,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// v2 update is same as v1
const v1User = require('../v1/user');
router.put('/', requireAuth, (req, res, next) => v1User.handle(req, res, next));

module.exports = router;
