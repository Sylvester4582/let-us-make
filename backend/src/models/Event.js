const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class Event {
  static TYPES = {
    DAILY_LOGIN: { type: 'daily_login', points: 5 },
    LOG_WORKOUT: { type: 'log_workout', points: 10 },
    READ_ARTICLE: { type: 'read_article', points: 7 },
    VIEW_POLICY: { type: 'view_policy', points: 15 },
    COMPLETE_CHALLENGE: { type: 'complete_challenge', points: 50 },
    INVITE_FRIEND: { type: 'invite_friend', points: 20 },
    SHARE_ACHIEVEMENT: { type: 'share_achievement', points: 5 },
    USE_NEW_FEATURE: { type: 'use_new_feature', points: 30 }
  };

  static async create(userId, eventType, metadata = {}) {
    const event = Event.TYPES[eventType] || Event.TYPES.USE_NEW_FEATURE;
    const id = uuidv4();

    await db.run(
      `INSERT INTO events (id, user_id, event_type, points_awarded, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, event.type, event.points, JSON.stringify(metadata)]
    );

    return {
      id,
      userId,
      eventType: event.type,
      pointsAwarded: event.points,
      metadata,
      timestamp: new Date().toISOString()
    };
  }

  static async getUserEvents(userId, limit = 10) {
    return await db.all(
      `SELECT * FROM events 
       WHERE user_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [userId, limit]
    );
  }
}

module.exports = Event;