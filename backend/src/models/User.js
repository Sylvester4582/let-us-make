const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class User {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.run(
      `INSERT INTO users (id, username, email, password_hash) 
       VALUES (?, ?, ?, ?)`,
      [id, username, email, hashedPassword]
    );

    return await this.findById(id);
  }

  static async findByEmail(email) {
    return await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  static async findById(id) {
    return await db.get(
      'SELECT id, username, email, points, level, streak, badges, unlocked_premium_discount, discount_percentage, claimed_benefits, avatar_url, last_active FROM users WHERE id = ?',
      [id]
    );
  }

  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async updatePoints(userId, pointsToAdd) {
    const user = await this.findById(userId);
    const newPoints = user.points + pointsToAdd;
    const newLevel = Math.floor(newPoints / 100) + 1; // Simple level calculation

    await db.run(
      `UPDATE users 
       SET points = ?,
           level = ?,
           unlocked_premium_discount = ?,
           discount_percentage = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        newPoints,
        newLevel,
        newLevel >= 3 ? 1 : 0, // Unlock premium discount at level 3
        newLevel >= 3 ? 10 : 0, // 10% discount
        userId
      ]
    );

    return await this.findById(userId);
  }

  static async getLeaderboard(limit = 10) {
    const users = await db.all(
      `SELECT username, points, level, avatar_url
       FROM users 
       ORDER BY points DESC, level DESC, username ASC
       LIMIT ?`,
      [limit]
    );

    return users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      points: user.points,
      level: user.level,
      avatarUrl: user.avatar_url
    }));
  }

  static async getUserRank(userId) {
    const result = await db.get(
      `SELECT COUNT(*) + 1 as rank
       FROM users 
       WHERE points > (SELECT points FROM users WHERE id = ?)`,
      [userId]
    );

    return result ? result.rank : 1;
  }
}

module.exports = User;