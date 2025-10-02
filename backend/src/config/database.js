const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../../youmatter.db'), (err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  async initializeTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        last_streak_date TEXT,
        badges TEXT DEFAULT '[]',
        unlocked_premium_discount BOOLEAN DEFAULT 0,
        discount_percentage INTEGER DEFAULT 0,
        claimed_benefits TEXT DEFAULT '[]',
        avatar_url TEXT,
        preferences TEXT DEFAULT '{}',
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_users_level ON users(level)`,
      
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        points_awarded INTEGER NOT NULL,
        metadata TEXT DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_user_events ON events(user_id, timestamp DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_event_type ON events(event_type)`,
      
      `CREATE TABLE IF NOT EXISTS user_health_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        age INTEGER,
        height INTEGER,
        weight INTEGER,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')),
        date_of_birth TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_health_user_id ON user_health_profiles(user_id)`
    ];

    for (const table of tables) {
      await this.run(table);
    }
    
    // Add claimed_benefits column if it doesn't exist (migration)
    try {
      await this.run(`ALTER TABLE users ADD COLUMN claimed_benefits TEXT DEFAULT '[]'`);
      console.log('Added claimed_benefits column to users table');
    } catch (error) {
      // Column already exists, which is fine
      if (!error.message.includes('duplicate column name')) {
        console.error('Error adding claimed_benefits column:', error);
      }
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Error running sql:', sql);
          console.error(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error('Error running sql:', sql);
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Error running sql:', sql);
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = new Database();