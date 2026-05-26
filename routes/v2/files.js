/**
 * v2 files router — paginated responses, richer metadata
 */
const { Router } = require('express');
const multer     = require('multer');
const mime       = require('mime-types');
const { requireAuth } = require('../v1/auth');

const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// ── List (paginated) ──────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const { File } = require('../../database/associations');
    const page  = Math.max(1, parseInt(req.query.page  || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '20'));
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (req.query.visibility === 'public')  where.visibility = true;
    if (req.query.visibility === 'private') where.visibility = false;

    const paranoid = req.query.deleted !== 'true';

    const { count, rows: files } = await File.findAndCountAll({
      where,
      paranoid,
      attributes: ['id', 'name', 'type', 'visibility', 'createdAt', 'deletedAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      ok: true,
      data: files,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: offset + limit < count,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Upload (richer response) ───────────────────────────────────────────────

router.post('/', requireAuth, upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ ok: false, message: 'No files uploaded' });
  }

  try {
    const { File } = require('../../database/associations');
    const saved = [];

    for (const f of req.files) {
      const record = await File.create({
        name: f.originalname,
        file: f.buffer,
        type: f.mimetype,
        visibility: true,
        userId: req.user.id,
      });
      saved.push({
        id:         record.id,
        name:       record.name,
        type:       record.type,
        mimeType:   mime.lookup(record.name) || record.type,
        size:       f.size,
        visibility: record.visibility,
        url:        `/uploads/${encodeURIComponent(record.name)}`,
        createdAt:  record.createdAt,
      });
    }

    res.status(201).json({
      ok: true,
      message: `${saved.length} file(s) uploaded`,
      data: saved,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// v2 re-uses v1 for remaining CRUD operations
const v1Files = require('../v1/files');
router.get('/:id',          requireAuth, v1Files.stack?.find(r => r.route?.path === '/:id')?.route?.stack[0]?.handle || ((req, res) => res.status(501).json({ ok: false })));
router.put('/:id',          ...v1Files.stack?.filter(r => r.route?.path === '/:id' && r.route?.methods?.put)?.map(r => r.route.stack[0].handle) || []);
router.delete('/:id',       requireAuth, async (req, res, next) => { req.params = req.params; return v1Files.handle(req, res, next); });
router.post('/:id/restore', requireAuth, async (req, res, next) => v1Files.handle(req, res, next));

module.exports = router;
