const { run, all } = require('../db/database');

const getNotifications = async (req, res) => {
  try {
    const notifications = await all(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);
    
    const unread_count = notifications.filter(n => !n.is_read).length;
    return res.json({ success: true, notifications, unread_count });
  } catch (err) {
    console.error('[Notifications] getNotifications error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read=1 WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[Notifications] markAllRead error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markOneRead = async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read=1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Notifications] markOneRead error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getNotifications, markAllRead, markOneRead };
