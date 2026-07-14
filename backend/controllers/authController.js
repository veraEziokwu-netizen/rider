const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../db/database');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!['customer', 'rider'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be customer or rider' });
    }
    
    const emailLower = email.toLowerCase().trim();
    const existing = await get('SELECT id FROM users WHERE email = ?', [emailLower]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const { id } = await run(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [full_name.trim(), emailLower, phone.trim(), hash, role]
    );
    
    const newUser = await get('SELECT id, full_name, email, phone, role FROM users WHERE id = ?', [id]);
    
    // If rider, create rider profile
    if (role === 'rider') {
      await run('INSERT INTO riders (user_id) VALUES (?)', [id]);
    }
    
    const token = generateToken(id);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('[Auth] register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const emailLower = email.toLowerCase().trim();
    const user = await get(
      'SELECT id, full_name, email, phone, role, password_hash, is_active FROM users WHERE email = ?',
      [emailLower]
    );
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    delete user.password_hash;
    
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('[Auth] login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await get('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let extra = {};
    if (user.role === 'rider') {
      const riderRes = await get('SELECT is_available, vehicle_type, plate_number, total_deliveries, rating FROM riders WHERE user_id = ?', [user.id]);
      if (riderRes) {
        extra = { 
          is_available: !!riderRes.is_available, 
          vehicle_type: riderRes.vehicle_type, 
          plate_number: riderRes.plate_number, 
          total_deliveries: riderRes.total_deliveries, 
          rating: riderRes.rating 
        };
      }
    }
    
    return res.json({ success: true, user: { ...user, ...extra } });
  } catch (err) {
    console.error('[Auth] getMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
