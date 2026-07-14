const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../db/database');

const locationHandler = (io) => {
  // Middleware: authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Rider: broadcast location update
    socket.on('rider:location', async ({ lat, lng, delivery_id }) => {
      try {
        const db = await getDb();
        // Update rider's current position
        db.run(
          `UPDATE riders SET current_lat=${lat}, current_lng=${lng}, last_seen=datetime('now') WHERE user_id=${socket.userId}`
        );
        if (delivery_id) {
          // Log position
          db.run('INSERT INTO location_logs (delivery_id, rider_id, lat, lng) VALUES (?, ?, ?, ?)',
            [delivery_id, socket.userId, lat, lng]);
          // Find customer for this delivery and push update
          const res = db.exec(`SELECT customer_id FROM deliveries WHERE id=${delivery_id}`);
          if (res.length && res[0].values.length) {
            const customer_id = res[0].values[0][0];
            io.to(`user:${customer_id}`).emit('delivery:location', { delivery_id, lat, lng, rider_id: socket.userId });
          }
          // Broadcast to any watchers of this delivery
          io.to(`delivery:${delivery_id}`).emit('delivery:location', { delivery_id, lat, lng });
        }
        saveDb();
      } catch (err) {
        console.error('[Socket] rider:location error', err);
      }
    });

    // Customer: watch a specific delivery
    socket.on('watch:delivery', ({ delivery_id }) => {
      socket.join(`delivery:${delivery_id}`);
    });

    socket.on('unwatch:delivery', ({ delivery_id }) => {
      socket.leave(`delivery:${delivery_id}`);
    });

    // Rider: status update via socket
    socket.on('delivery:status', async ({ delivery_id, status }) => {
      try {
        const db = await getDb();
        const validStatuses = ['picked_up', 'in_transit', 'delivered'];
        if (!validStatuses.includes(status)) return;
        const check = db.exec(`SELECT customer_id, rider_id FROM deliveries WHERE id=${delivery_id}`);
        if (!check.length || !check[0].values.length) return;
        const [customer_id, rider_id] = check[0].values[0];
        if (rider_id !== socket.userId) return;
        const deliveredAt = status === 'delivered' ? `, delivered_at=datetime('now')` : '';
        db.run(`UPDATE deliveries SET status='${status}'${deliveredAt}, updated_at=datetime('now') WHERE id=${delivery_id}`);
        if (status === 'delivered') {
          db.run(`UPDATE riders SET total_deliveries=total_deliveries+1 WHERE user_id=${socket.userId}`);
        }
        saveDb();
        // Notify customer room
        io.to(`user:${customer_id}`).emit('delivery:status_update', { delivery_id, status });
        io.to(`delivery:${delivery_id}`).emit('delivery:status_update', { delivery_id, status });
      } catch (err) {
        console.error('[Socket] delivery:status error', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.userId} disconnected`);
    });
  });
};

module.exports = locationHandler;
