const { run, get, all } = require('../db/database');

const generateTrackingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'DNG-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const createNotification = async (user_id, title, message, type = 'info', delivery_id = null) => {
  try {
    await run(
      'INSERT INTO notifications (user_id, title, message, type, delivery_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, title, message, type, delivery_id]
    );
  } catch (e) {
    console.error('Notification error', e);
  }
};

// Customer: create delivery request
const createDelivery = async (req, res) => {
  try {
    const { pickup_address, pickup_lat, pickup_lng, delivery_address, delivery_lat, delivery_lng,
            recipient_name, recipient_phone, package_description, priority, notes } = req.body;
            
    if (!pickup_address || !delivery_address || !recipient_name || !recipient_phone) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    
    let tracking_code;
    let existing;
    do { 
      tracking_code = generateTrackingCode(); 
      existing = await get('SELECT id FROM deliveries WHERE tracking_code = ?', [tracking_code]);
    } while (existing);

    await run(
      `INSERT INTO deliveries (tracking_code, customer_id, pickup_address, pickup_lat, pickup_lng,
        delivery_address, delivery_lat, delivery_lng, recipient_name, recipient_phone,
        package_description, priority, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tracking_code, req.user.id, pickup_address, pickup_lat || null, pickup_lng || null,
       delivery_address, delivery_lat || null, delivery_lng || null,
       recipient_name, recipient_phone, package_description || '', priority || 'normal', notes || '']
    );
    
    const delivery = await get('SELECT * FROM deliveries WHERE tracking_code = ?', [tracking_code]);
    return res.status(201).json({ success: true, message: 'Delivery request created', delivery });
  } catch (err) {
    console.error('[Delivery] create error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Customer: get own deliveries
const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await all(`
      SELECT d.*, u.full_name as rider_name, u.phone as rider_phone,
             r.vehicle_type, r.plate_number, r.rating
      FROM deliveries d
      LEFT JOIN users u ON d.rider_id = u.id
      LEFT JOIN riders r ON r.user_id = d.rider_id
      WHERE d.customer_id = ?
      ORDER BY d.created_at DESC
    `, [req.user.id]);
    
    return res.json({ success: true, deliveries });
  } catch (err) {
    console.error('[Delivery] getMyDeliveries error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Public: track by code
const trackDelivery = async (req, res) => {
  try {
    const { code } = req.params;
    const delivery = await get(`
      SELECT d.*, u.full_name as rider_name, u.phone as rider_phone,
             r.vehicle_type, r.plate_number, r.current_lat, r.current_lng
      FROM deliveries d
      LEFT JOIN users u ON d.rider_id = u.id
      LEFT JOIN riders r ON r.user_id = d.rider_id
      WHERE d.tracking_code = ?
    `, [code.toUpperCase()]);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    return res.json({ success: true, delivery });
  } catch (err) {
    console.error('[Delivery] trackDelivery error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rider: get available (pending) deliveries
const getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await all(`
      SELECT d.*, u.full_name as customer_name, u.phone as customer_phone
      FROM deliveries d
      JOIN users u ON d.customer_id = u.id
      WHERE d.status = 'pending'
      ORDER BY d.priority DESC, d.created_at ASC
      LIMIT 20
    `);
    
    return res.json({ success: true, deliveries });
  } catch (err) {
    console.error('[Delivery] getAvailableDeliveries error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rider: get own active + history
const getRiderDeliveries = async (req, res) => {
  try {
    const deliveries = await all(`
      SELECT d.*, u.full_name as customer_name, u.phone as customer_phone
      FROM deliveries d
      JOIN users u ON d.customer_id = u.id
      WHERE d.rider_id = ?
      ORDER BY d.created_at DESC
    `, [req.user.id]);
    
    return res.json({ success: true, deliveries });
  } catch (err) {
    console.error('[Delivery] getRiderDeliveries error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rider: accept delivery
const acceptDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await get('SELECT id, status, customer_id FROM deliveries WHERE id = ?', [id]);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    if (delivery.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Delivery is no longer available' });
    }
    
    await run('UPDATE deliveries SET rider_id = ?, status = "assigned", updated_at = datetime("now") WHERE id = ?', [req.user.id, id]);
    
    await createNotification(delivery.customer_id, 'Rider assigned', 'A dispatch rider has accepted your delivery request.', 'success', parseInt(id));
    
    return res.json({ success: true, message: 'Delivery accepted' });
  } catch (err) {
    console.error('[Delivery] acceptDelivery error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rider: update delivery status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['picked_up', 'in_transit', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const delivery = await get('SELECT id, rider_id, customer_id, status FROM deliveries WHERE id = ?', [id]);
    
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    if (delivery.rider_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your delivery' });
    }
    
    const deliveredAt = status === 'delivered' ? `, delivered_at = datetime("now")` : '';
    await run(`UPDATE deliveries SET status = ?, updated_at = datetime("now")${deliveredAt} WHERE id = ?`, [status, id]);
    
    if (status === 'delivered') {
      await run('UPDATE riders SET total_deliveries = total_deliveries + 1 WHERE user_id = ?', [req.user.id]);
      await createNotification(delivery.customer_id, 'Package delivered!', 'Your package has been successfully delivered.', 'success', parseInt(id));
    } else if (status === 'picked_up') {
      await createNotification(delivery.customer_id, 'Package picked up', 'Your package has been picked up and is on the way.', 'info', parseInt(id));
    } else if (status === 'in_transit') {
      await createNotification(delivery.customer_id, 'Package in transit', 'Your package is currently in transit.', 'info', parseInt(id));
    }
    
    return res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    console.error('[Delivery] updateStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: get all deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let where = '';
    const params = [];
    if (status) {
      where = 'WHERE d.status = ?';
      params.push(status);
    }
    
    const deliveries = await all(`
      SELECT d.*, c.full_name as customer_name, r.full_name as rider_name
      FROM deliveries d
      JOIN users c ON d.customer_id = c.id
      LEFT JOIN users r ON d.rider_id = r.id
      ${where}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    
    const totalRow = await get(`SELECT COUNT(*) as cnt FROM deliveries ${where}`, params);
    
    return res.json({ success: true, deliveries, total: totalRow.cnt });
  } catch (err) {
    console.error('[Delivery] getAllDeliveries error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: stats
const getStats = async (req, res) => {
  try {
    const totalDeliveries = await get('SELECT COUNT(*) as cnt FROM deliveries');
    const pending = await get("SELECT COUNT(*) as cnt FROM deliveries WHERE status='pending'");
    const inTransit = await get("SELECT COUNT(*) as cnt FROM deliveries WHERE status IN ('assigned','picked_up','in_transit')");
    const delivered = await get("SELECT COUNT(*) as cnt FROM deliveries WHERE status='delivered'");
    const totalUsers = await get("SELECT COUNT(*) as cnt FROM users WHERE role='customer'");
    const totalRiders = await get("SELECT COUNT(*) as cnt FROM users WHERE role='rider'");
    const activeRiders = await get("SELECT COUNT(*) as cnt FROM riders WHERE is_available=1");
    
    return res.json({ 
      success: true, 
      stats: { 
        totalDeliveries: totalDeliveries.cnt, 
        pending: pending.cnt, 
        inTransit: inTransit.cnt, 
        delivered: delivered.cnt, 
        totalUsers: totalUsers.cnt, 
        totalRiders: totalRiders.cnt, 
        activeRiders: activeRiders.cnt 
      } 
    });
  } catch (err) {
    console.error('[Delivery] getStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createDelivery, getMyDeliveries, trackDelivery, getAvailableDeliveries, getRiderDeliveries, acceptDelivery, updateStatus, getAllDeliveries, getStats };
