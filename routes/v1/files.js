/**
 * GET    /api/v1/files           — list user's files
 * POST   /api/v1/files           — upload files (multipart/form-data)
 * GET    /api/v1/files/:id       — file metadata
 * PUT    /api/v1/files/:id       — rename / toggle visibility
 * DELETE /api/v1/files/:id       — soft-delete
 * POST   /api/v1/files/:id/restore — restore soft-deleted file
 * GET    /uploads/:name          — serve raw file (kept for compatibility)
 */
const { Router } = require('express');
const multer     = require('multer');
const mime       = require('mime-types');
const { requireAuth } = require('./auth');

const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB

// ── List ──────────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const { File } = require('../../database/associations');
    const { Op } = require('sequelize');

    const where = { userId: req.user.id };

    // ?visibility=public|private
    if (req.query.visibility === 'public')  where.visibility = true;
    if (req.query.visibility === 'private') where.visibility = false;

    // ?deleted=true — include soft-deleted
    const paranoid = req.query.deleted !== 'true';

    const files = await File.findAll({
      where,
      paranoid,
      attributes: ['id', 'name', 'type', 'visibility', 'createdAt', 'deletedAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Upload ────────────────────────────────────────────────────────────────

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
      saved.push({ id: record.id, name: record.name, type: record.type, visibility: record.visibility });
    }

    res.status(201).json({ ok: true, message: `${saved.length} file(s) uploaded`, files: saved });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Get metadata ──────────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { File } = require('../../database/associations');
    const file = await File.findOne({
      where: { id: req.params.id, userId: req.user.id },
      attributes: { exclude: ['file'] },
      paranoid: false,
    });
    if (!file) return res.status(404).json({ ok: false, message: 'File not found' });
    res.json({ ok: true, file });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Update ────────────────────────────────────────────────────────────────

router.put('/:id', requireAuth, async (req, res) => {
  const { name, visibility } = req.body;

  try {
    const { File } = require('../../database/associations');
    const file = await File.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!file) return res.status(404).json({ ok: false, message: 'File not found' });

    const updates = {};
    if (name !== undefined)       updates.name = name;
    if (visibility !== undefined) updates.visibility = Boolean(visibility);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ ok: false, message: 'Nothing to update' });
    }

    await file.update(updates);
    res.json({ ok: true, message: 'File updated', file: { id: file.id, name: file.name, visibility: file.visibility } });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Delete (soft) ─────────────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { File } = require('../../database/associations');
    const file = await File.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!file) return res.status(404).json({ ok: false, message: 'File not found' });
    await file.destroy();
    res.json({ ok: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Restore ───────────────────────────────────────────────────────────────

router.post('/:id/restore', requireAuth, async (req, res) => {
  try {
    const { File } = require('../../database/associations');
    const file = await File.findOne({ where: { id: req.params.id, userId: req.user.id }, paranoid: false });
    if (!file) return res.status(404).json({ ok: false, message: 'File not found' });
    if (!file.isSoftDeleted()) return res.status(400).json({ ok: false, message: 'File is not deleted' });
    await file.restore();
    res.json({ ok: true, message: 'File restored' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// ── Serve raw file ─────────────────────────────────────────────────────────
// NOTE: This route is on the main app at GET /uploads/:name, not under /api/v1
// It's exported here as a named handler for use in app.js

async function serveFile(req, res) {
  const { name } = req.params;
  try {
    const { User, File } = require('../../database/associations');

    // Public file — no auth required
    const publicFile = await File.findOne({ where: { name, visibility: true } });
    if (publicFile) {
      return sendFileBuffer(res, publicFile);
    }

    // Private file — require session auth
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ ok: false, message: 'Authentication required' });
    }

    const privateFile = await File.findOne({ where: { name, userId: req.user.id, visibility: false } });
    if (!privateFile) {
      return res.status(404).json({ ok: false, message: 'File not found' });
    }

    return sendFileBuffer(res, privateFile);
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
}

function sendFileBuffer(res, file) {
  if (file.deletedAt) return res.status(410).json({ ok: false, message: 'File has been deleted' });
  if (!file.file) return res.status(404).json({ ok: false, message: 'File data not found' });

  res.set({
    'Content-Type': mime.lookup(file.name) || 'application/octet-stream',
    'Content-Length': file.file.length,
    'Cache-Control': file.visibility ? 'public, max-age=31536000' : 'private, no-cache',
    'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"`,
  });
  res.send(file.file);
}

module.exports = router;
module.exports.serveFile = serveFile;
