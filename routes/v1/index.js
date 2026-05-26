/**
 * API v1 router — mounts all v1 sub-routers
 * Mounted at /api/v1 in app.js
 */
const { Router } = require('express');

const authRouter  = require('./auth');
const filesRouter = require('./files');
const userRouter  = require('./user');

const v1 = Router();

v1.use('/auth',  authRouter);
v1.use('/files', filesRouter);
v1.use('/user',  userRouter);

// Version info endpoint
v1.get('/', (req, res) => {
  res.json({ version: '1', status: 'ok', uptime: process.uptime() });
});

module.exports = v1;
