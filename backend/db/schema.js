const { run } = require('./database');
const bcrypt = require('bcryptjs');

async function initSchema() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('customer', 'rider', 'admin')),
        avatar_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS riders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        vehicle_type TEXT DEFAULT 'motorcycle',
        plate_number TEXT,
        is_available INTEGER DEFAULT 0,
        current_lat REAL,
        current_lng REAL,
        last_seen TEXT,
        total_deliveries INTEGER DEFAULT 0,
        rating REAL DEFAULT 5.0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_code TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        rider_id INTEGER,
        pickup_address TEXT NOT NULL,
        pickup_lat REAL,
        pickup_lng REAL,
        delivery_address TEXT NOT NULL,
        delivery_lat REAL,
        delivery_lng REAL,
        recipient_name TEXT NOT NULL,
        recipient_phone TEXT NOT NULL,
        package_description TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending','assigned','picked_up','in_transit','delivered','cancelled')),
        priority TEXT DEFAULT 'normal' CHECK(priority IN ('normal','urgent')),
        notes TEXT,
        estimated_fee REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        delivered_at TEXT,
        FOREIGN KEY (customer_id) REFERENCES users(id),
        FOREIGN KEY (rider_id) REFERENCES users(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS location_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL,
        rider_id INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        logged_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
        FOREIGN KEY (rider_id) REFERENCES users(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' CHECK(type IN ('info','success','warning','error')),
        is_read INTEGER DEFAULT 0,
        delivery_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id)
      )
    `);

    // Seed admin user if not exists
    const { get } = require('./database');
    const adminCheck = await get("SELECT id FROM users WHERE email='admin@dispatchng.com'");
    
    if (!adminCheck) {
      const hash = bcrypt.hashSync('Admin@123', 10);
      await run(
        "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        ['Admin User', 'admin@dispatchng.com', '08000000000', hash, 'admin']
      );
    }

    console.log('[DB] Schema initialized successfully with sqlite3');
  } catch (error) {
    console.error('[DB] Schema initialization failed:', error);
    throw error;
  }
}

module.exports = { initSchema };
