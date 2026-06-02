const express = require('express');
const Forum = require('../models/Forum');
const Result = require('../models/Result');
const User = require('../models/User');
const requireAuth = require('../utils/requireAuth');

const router = express.Router();

const populateForumQuery = () => [
  { path: 'author', select: 'name email role profileImage department rollNumber class semester' },
  { path: 'replies.user', select: 'name email role profileImage department rollNumber class semester' },
];

const normalizeForum = (forum) => forum;

router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { content: regex },
        { subject: regex },
        { tags: regex },
      ];
    }

    const forums = await Forum.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate(populateForumQuery());

    return res.json({ forums: forums.map(normalizeForum) });
  } catch (error) {
    console.error('Fetch forums error:', error);
    return res.status(500).json({ message: 'Failed to fetch forums' });
  }
});

router.get('/subjects/list', async (req, res) => {
  try {
    const subjects = await Forum.distinct('subject');
    subjects.sort((a, b) => a.localeCompare(b));
    return res.json({ subjects });
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, subject, tags = [] } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [];

    const generatedTitle = title && String(title).trim()
      ? String(title).trim()
      : String(content).trim().slice(0, 60);

    const forum = await Forum.create({
      title: generatedTitle,
      content: String(content).trim(),
      subject: subject && String(subject).trim() ? String(subject).trim() : 'General',
      tags: normalizedTags,
      author: req.userId,
    });

    const populatedForum = await Forum.findById(forum._id).populate(populateForumQuery());
    return res.status(201).json({ success: true, forum: populatedForum });
  } catch (error) {
    console.error('Create forum error:', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const forum = await Forum.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate(populateForumQuery());

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    return res.json({ forum });
  } catch (error) {
    console.error('Fetch forum error:', error);
    return res.status(500).json({ message: 'Failed to load discussion' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const liked = forum.likes.some((likeId) => String(likeId) === String(req.userId));
    if (liked) {
      forum.likes = forum.likes.filter((likeId) => String(likeId) !== String(req.userId));
    } else {
      forum.likes.push(req.userId);
    }

    await forum.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Like forum error:', error);
    return res.status(500).json({ message: 'Failed to like post' });
  }
});

router.post('/:id/reply', requireAuth, async (req, res) => {
  try {
    const { content, parentReplyId = null } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (forum.isClosed) {
      return res.status(400).json({ message: 'This discussion is closed' });
    }

    forum.replies.push({
      user: req.userId,
      content: String(content).trim(),
      parentReply: parentReplyId || null,
      likes: [],
      isBestAnswer: false,
    });

    await forum.save();
    const updatedForum = await Forum.findById(forum._id).populate(populateForumQuery());
    return res.status(201).json({ success: true, forum: updatedForum });
  } catch (error) {
    console.error('Reply forum error:', error);
    return res.status(500).json({ message: 'Failed to post reply' });
  }
});

router.post('/:id/reply/:replyId/like', requireAuth, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const reply = forum.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const liked = reply.likes.some((likeId) => String(likeId) === String(req.userId));
    if (liked) {
      reply.likes = reply.likes.filter((likeId) => String(likeId) !== String(req.userId));
    } else {
      reply.likes.push(req.userId);
    }

    await forum.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Like reply error:', error);
    return res.status(500).json({ message: 'Failed to like reply' });
  }
});

router.put('/:id/reply/:replyId/best-answer', requireAuth, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (String(forum.author) !== String(req.userId)) {
      return res.status(403).json({ message: 'Only the author can mark the best answer' });
    }

    forum.replies.forEach((reply) => {
      reply.isBestAnswer = String(reply._id) === String(req.params.replyId);
    });
    forum.isSolved = true;

    await forum.save();
    const updatedForum = await Forum.findById(forum._id).populate(populateForumQuery());
    return res.json({ success: true, forum: updatedForum });
  } catch (error) {
    console.error('Best answer error:', error);
    return res.status(500).json({ message: 'Failed to mark best answer' });
  }
});

router.get('/user/:userId/posts', async (req, res) => {
  try {
    const forums = await Forum.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate(populateForumQuery());

    return res.json({ forums });
  } catch (error) {
    console.error('User forum posts error:', error);
    return res.status(500).json({ message: 'Failed to fetch user posts' });
  }
});

module.exports = router;
