const { run, get, all } = require('../db/database');

// Rider: toggle availability
const toggleAvailability = async (req, res) => {
  try {
    const rider = await get('SELECT is_available FROM riders WHERE user_id = ?', [req.user.id]);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }
    const next = rider.is_available ? 0 : 1;
    await run('UPDATE riders SET is_available = ?, last_seen = datetime("now") WHERE user_id = ?', [next, req.user.id]);
    return res.json({ success: true, is_available: !!next, message: next ? 'You are now available' : 'You are now offline' });
  } catch (err) {
    console.error('[Rider] toggleAvailability error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rider: update location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng, delivery_id } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    
    await run('UPDATE riders SET current_lat = ?, current_lng = ?, last_seen = datetime("now") WHERE user_id = ?', [lat, lng, req.user.id]);
    
    if (delivery_id) {
      await run('INSERT INTO location_logs (delivery_id, rider_id, lat, lng) VALUES (?, ?, ?, ?)', [delivery_id, req.user.id, lat, lng]);
    }
    
    return res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    console.error('[Rider] updateLocation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: get all riders
const getAllRiders = async (req, res) => {
  try {
    const riders = await all(`
      SELECT u.id, u.full_name, u.email, u.phone, u.is_active,
             r.is_available, r.vehicle_type, r.plate_number, r.total_deliveries, r.rating, r.last_seen
      FROM users u
      JOIN riders r ON r.user_id = u.id
      ORDER BY u.full_name ASC
    `);
    return res.json({ success: true, riders });
  } catch (err) {
    console.error('[Rider] getAllRiders error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: get all users (customers)
const getAllUsers = async (req, res) => {
  try {
    const users = await all(`
      SELECT id, full_name, email, phone, role, is_active, created_at
      FROM users WHERE role != 'admin'
      ORDER BY created_at DESC
    `);
    return res.json({ success: true, users });
  } catch (err) {
    console.error('[Rider] getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await get('SELECT is_active FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const next = user.is_active ? 0 : 1;
    await run('UPDATE users SET is_active = ? WHERE id = ?', [next, id]);
    
    return res.json({ success: true, message: next ? 'User activated' : 'User deactivated' });
  } catch (err) {
    console.error('[Rider] toggleUserStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { toggleAvailability, updateLocation, getAllRiders, getAllUsers, toggleUserStatus };
