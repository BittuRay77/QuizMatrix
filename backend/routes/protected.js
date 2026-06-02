const express = require('express');
const requireAuth = require('../utils/requireAuth');
const requireRole = require('../utils/requireRole');
const router = express.Router();

// Example protected route accessible to any authenticated user
router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

// Teacher-only example
router.get('/teacher-only', requireAuth, requireRole('teacher'), (req, res) => {
  return res.json({ message: 'Hello teacher', user: req.user });
});

// Student-only example
router.get('/student-only', requireAuth, requireRole('student'), (req, res) => {
  return res.json({ message: 'Hello student', user: req.user });
});

module.exports = router;
