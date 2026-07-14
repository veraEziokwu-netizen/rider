const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'dispatch.db');

let db = null;

function getDb() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) return reject(err);
        resolve(db);
      });
    });
  });
}

// Wrapper for running queries (run)
function run(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDb();
      database.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Wrapper for getting all rows (all)
function all(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDb();
      database.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Wrapper for getting a single row (get)
function get(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await getDb();
      database.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Graceful shutdown
process.on('exit', () => { if (db) db.close(); });
process.on('SIGINT', () => { if (db) db.close(); process.exit(0); });

module.exports = { getDb, run, all, get };
