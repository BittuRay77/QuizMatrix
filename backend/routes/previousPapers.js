const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PreviousPaper = require('../models/PreviousPaper');
const requireAuth = require('../utils/requireAuth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads', 'previous-papers');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const populateTeacher = { path: 'teacher', select: 'name email role profileImage department rollNumber class semester' };

const buildPaper = (paper) => paper;

router.get('/filters', requireAuth, async (req, res) => {
  try {
    const [countries, states, colleges, branches, semesters, subjects, years] = await Promise.all([
      PreviousPaper.distinct('country', { isPublished: true }),
      PreviousPaper.distinct('state', { isPublished: true }),
      PreviousPaper.distinct('college', { isPublished: true }),
      PreviousPaper.distinct('branch', { isPublished: true }),
      PreviousPaper.distinct('semester', { isPublished: true }),
      PreviousPaper.distinct('subject', { isPublished: true }),
      PreviousPaper.distinct('year', { isPublished: true }),
    ]);

    const sortStrings = (arr) => arr.filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));

    return res.json({
      countries: sortStrings(countries),
      states: sortStrings(states),
      colleges: sortStrings(colleges),
      branches: sortStrings(branches),
      semesters: sortStrings(semesters),
      subjects: sortStrings(subjects),
      years: sortStrings(years),
    });
  } catch (error) {
    console.error('Fetch previous paper filters error:', error);
    return res.status(500).json({ message: 'Failed to fetch filter options' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { country, state, college, branch, semester, subject, year, search } = req.query;
    const filter = { isPublished: true };

    if (country) filter.country = country;
    if (state) filter.state = state;
    if (college) filter.college = college;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;
    if (year) filter.year = year;

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { title: regex },
        { subject: regex },
      ];
    }

    const papers = await PreviousPaper.find(filter)
      .sort({ createdAt: -1 })
      .populate(populateTeacher);

    return res.json(papers.map(buildPaper));
  } catch (error) {
    console.error('Fetch previous papers error:', error);
    return res.status(500).json({ message: 'Failed to fetch papers' });
  }
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can upload papers' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const { title, subject, year, country, state, college, branch, semester } = req.body;

    if (!title || !subject || !year || !country || !state || !college || !branch || !semester) {
      return res.status(400).json({ message: 'All paper fields are required' });
    }

    const paper = await PreviousPaper.create({
      title: String(title).trim(),
      subject: String(subject).trim(),
      year: String(year).trim(),
      country: String(country).trim(),
      state: String(state).trim(),
      college: String(college).trim(),
      branch: String(branch).trim(),
      semester: String(semester).trim(),
      fileUrl: `/uploads/previous-papers/${req.file.filename}`,
      teacher: req.userId,
    });

    return res.status(201).json({ success: true, paper: await PreviousPaper.findById(paper._id).populate(populateTeacher) });
  } catch (error) {
    console.error('Upload previous paper error:', error);
    return res.status(500).json({ message: 'Failed to upload paper' });
  }
});

router.get('/download/:id', requireAuth, async (req, res) => {
  try {
    const paper = await PreviousPaper.findById(req.params.id).populate(populateTeacher);
    if (!paper) {
      return res.status(404).json({ message: 'Previous paper not found' });
    }

    if (!paper.fileUrl) {
      return res.status(404).json({ message: 'File not available', fileNotAvailable: true });
    }

    let absolutePath = null;
    if (paper.fileUrl.startsWith('/uploads/')) {
      absolutePath = path.join(__dirname, '..', paper.fileUrl.replace(/^\/+/, ''));
    } else {
      absolutePath = path.join(__dirname, '..', paper.fileUrl.replace(/^\/+/, ''));
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found', fileNotAvailable: true });
    }

    paper.downloadCount += 1;
    await paper.save();

    return res.download(absolutePath, path.basename(absolutePath));
  } catch (error) {
    console.error('Download previous paper error:', error);
    return res.status(500).json({ message: 'Failed to download file' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete papers' });
    }

    const paper = await PreviousPaper.findOneAndDelete({ _id: req.params.id, teacher: req.userId });
    if (!paper) {
      return res.status(404).json({ message: 'Previous paper not found' });
    }

    return res.json({ success: true, message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Delete previous paper error:', error);
    return res.status(500).json({ message: 'Failed to delete paper' });
  }
});

module.exports = router;
