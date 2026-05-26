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

// ── Delegate remaining CRUD to v1 router ─────────────────────────────────
//
// v2 re-uses v1 handlers for GET/:id, PUT/:id, DELETE/:id, POST/:id/restore.
//
// NOTE: Do NOT use route.stack[0].handle introspection — index 0 is the
// requireAuth middleware, not the business logic.  Delegating via
// v1Files.handle() correctly dispatches to the right handler.
// The v2 requireAuth guard above is still enforced first.

const v1Files = require('../v1/files');

router.get('/:id',          requireAuth, (req, res, next) => v1Files.handle(req, res, next));
router.put('/:id',          requireAuth, (req, res, next) => v1Files.handle(req, res, next));
router.delete('/:id',       requireAuth, (req, res, next) => v1Files.handle(req, res, next));
router.post('/:id/restore', requireAuth, (req, res, next) => v1Files.handle(req, res, next));

module.exports = router;
