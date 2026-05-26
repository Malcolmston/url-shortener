/**
 * API v2 router — extends v1 with additional endpoints and breaking changes
 * Mounted at /api/v2 in app.js
 *
 * v2 differences from v1:
 *   - All list endpoints return { data, pagination } envelope
 *   - File upload returns richer metadata
 *   - User profile includes link/click counts
 */
const { Router } = require('express');

// v2 reuses v1 auth and user routers (no breaking changes there)
const authRouter  = require('../v1/auth');
const filesRouter = require('./files');
const userRouter  = require('./user');

const v2 = Router();

v2.use('/auth',  authRouter);
v2.use('/files', filesRouter);
v2.use('/user',  userRouter);

v2.get('/', (req, res) => {
  res.json({ version: '2', status: 'ok', uptime: process.uptime() });
});

module.exports = v2;
