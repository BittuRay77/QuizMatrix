const express = require('express');
const Notification = require('../models/Notification');
const requireAuth = require('../utils/requireAuth');

const router = express.Router();

const buildNotification = (notification) => ({
  _id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const unreadOnly = String(req.query.unreadOnly) === 'true';

    const filter = { user: req.userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: req.userId, isRead: false }),
    ]);

    return res.json({
      success: true,
      notifications: notifications.map(buildNotification),
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.userId, isRead: false });
    return res.json({ success: true, count });
  } catch (error) {
    console.error('Unread count error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
});

router.put('/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({ success: true, notification: buildNotification(notification) });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

router.put('/mark-all-read', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, isRead: false }, { $set: { isRead: true } });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
  }
});

router.delete('/:notificationId', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.notificationId, user: req.userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

module.exports = router;
