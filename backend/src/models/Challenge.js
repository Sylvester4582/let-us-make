const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class Challenge {
    static TYPES = {
        WORKOUT_STREAK: 'workout_streak',
        ARTICLE_READER: 'article_reader',
        POLICY_EXPLORER: 'policy_explorer',
        SOCIAL_CONNECTOR: 'social_connector',
        FEATURE_DISCOVERER: 'feature_discoverer',
        POINTS_COLLECTOR: 'points_collector',
        LEVEL_CLIMBER: 'level_climber'
    };

    static TEMPLATES = {
        [this.TYPES?.WORKOUT_STREAK]: {
            title: '💪 Workout Warrior',
            description: 'Complete workouts for consecutive days',
            category: 'fitness',
            targetValue: 7,
            rewardPoints: 100,
            durationDays: 14
        },
        [this.TYPES?.ARTICLE_READER]: {
            title: '📚 Knowledge Seeker',
            description: 'Read health and wellness articles',
            category: 'education',
            targetValue: 10,
            rewardPoints: 75,
            durationDays: 7
        },
        [this.TYPES?.POLICY_EXPLORER]: {
            title: '🔍 Policy Expert',
            description: 'Explore different insurance policies',
            category: 'insurance',
            targetValue: 5,
            rewardPoints: 125,
            durationDays: 10
        },
        [this.TYPES?.SOCIAL_CONNECTOR]: {
            title: '🤝 Community Builder',
            description: 'Invite friends and share achievements',
            category: 'social',
            targetValue: 3,
            rewardPoints: 150,
            durationDays: 14
        },
        [this.TYPES?.FEATURE_DISCOVERER]: {
            title: '🚀 Explorer',
            description: 'Try new platform features',
            category: 'platform',
            targetValue: 5,
            rewardPoints: 100,
            durationDays: 7
        },
        [this.TYPES?.POINTS_COLLECTOR]: {
            title: '⭐ Point Master',
            description: 'Collect points through various activities',
            category: 'general',
            targetValue: 500,
            rewardPoints: 200,
            durationDays: 14
        },
        [this.TYPES?.LEVEL_CLIMBER]: {
            title: '📈 Level Up Hero',
            description: 'Advance to the next level',
            category: 'progression',
            targetValue: 1,
            rewardPoints: 250,
            durationDays: 21
        }
    };

    static async initialize() {
        await db.run(`
            CREATE TABLE IF NOT EXISTS challenges (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                challenge_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                target_value INTEGER NOT NULL,
                current_progress INTEGER DEFAULT 0,
                category TEXT NOT NULL,
                difficulty TEXT DEFAULT 'medium',
                reward_points INTEGER NOT NULL,
                status TEXT DEFAULT 'active',
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP NOT NULL,
                completed_at TIMESTAMP,
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await db.run(`CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(challenge_type)`);
    }

    static async create(userId, type, options = {}) {
        const id = uuidv4();
        const template = this.TEMPLATES[type];
        
        if (!template) {
            throw new Error(`Unknown challenge type: ${type}`);
        }

        const {
            title = template.title,
            description = template.description,
            targetValue = template.targetValue,
            category = template.category,
            difficulty = 'medium',
            rewardPoints = template.rewardPoints,
            durationDays = template.durationDays
        } = { ...template, ...options };

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        await db.run(
            `INSERT INTO challenges (
                id, user_id, challenge_type, title, description,
                target_value, category, difficulty, reward_points,
                start_date, end_date, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, userId, type, title, description,
                targetValue, category, difficulty, rewardPoints,
                startDate.toISOString(), endDate.toISOString(),
                JSON.stringify(options.metadata || {})
            ]
        );

        return await this.findById(id);
    }

    static async updateProgress(id, increment = 1) {
        const challenge = await this.findById(id);
        if (!challenge) throw new Error('Challenge not found');

        if (challenge.status !== 'active') {
            throw new Error('Challenge is not active');
        }

        const newProgress = challenge.current_progress + increment;
        const isCompleted = newProgress >= challenge.target_value;

        await db.run(
            `UPDATE challenges 
             SET current_progress = ?,
                 status = ?,
                 completed_at = ?
             WHERE id = ?`,
            [
                newProgress,
                isCompleted ? 'completed' : 'active',
                isCompleted ? new Date().toISOString() : null,
                id
            ]
        );

        const updatedChallenge = await this.findById(id);
        
        // If completed, award points to user
        if (isCompleted) {
            await this.awardChallengeCompletion(challenge.user_id, challenge.reward_points);
        }

        return updatedChallenge;
    }

    static async awardChallengeCompletion(userId, rewardPoints) {
        // Update user points
        await db.run(
            'UPDATE users SET points = points + ? WHERE id = ?',
            [rewardPoints, userId]
        );

        // Log the event
        const eventId = uuidv4();
        await db.run(
            `INSERT INTO events (id, user_id, event_type, points_awarded, metadata)
             VALUES (?, ?, ?, ?, ?)`,
            [
                eventId,
                userId,
                'complete_challenge',
                rewardPoints,
                JSON.stringify({ source: 'challenge_completion' })
            ]
        );
    }

    static async findById(id) {
        const challenge = await db.get(
            'SELECT * FROM challenges WHERE id = ?',
            [id]
        );
        
        if (challenge) {
            challenge.metadata = JSON.parse(challenge.metadata || '{}');
        }
        
        return challenge;
    }

    static async getUserActiveChallenges(userId) {
        const challenges = await db.all(
            `SELECT * FROM challenges 
             WHERE user_id = ? 
             AND status = 'active'
             AND end_date > datetime('now')
             ORDER BY created_at DESC`,
            [userId]
        );

        return challenges.map(challenge => ({
            ...challenge,
            metadata: JSON.parse(challenge.metadata || '{}')
        }));
    }

    static async getUserCompletedChallenges(userId, limit = 10) {
        const challenges = await db.all(
            `SELECT * FROM challenges 
             WHERE user_id = ? 
             AND status = 'completed'
             ORDER BY completed_at DESC
             LIMIT ?`,
            [userId, limit]
        );

        return challenges.map(challenge => ({
            ...challenge,
            metadata: JSON.parse(challenge.metadata || '{}')
        }));
    }

    static async generatePersonalizedChallenge(userId) {
        // Get user's recent activity to personalize challenges
        const userStats = await db.get(
            `SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN event_type = 'exercise' THEN 1 ELSE 0 END) as workout_count,
                SUM(CASE WHEN event_type = 'read_article' THEN 1 ELSE 0 END) as article_count,
                SUM(CASE WHEN event_type = 'view_policy' THEN 1 ELSE 0 END) as policy_count,
                SUM(points_awarded) as total_points,
                u.level
             FROM events e
             JOIN users u ON e.user_id = u.id
             WHERE e.user_id = ?
             AND e.timestamp > datetime('now', '-30 days')`,
            [userId]
        );

        // Determine best challenge type based on user activity
        let challengeType;
        if (userStats.workout_count < 5) {
            challengeType = this.TYPES.WORKOUT_STREAK;
        } else if (userStats.article_count < 3) {
            challengeType = this.TYPES.ARTICLE_READER;
        } else if (userStats.policy_count < 2) {
            challengeType = this.TYPES.POLICY_EXPLORER;
        } else if (userStats.total_points < 200) {
            challengeType = this.TYPES.POINTS_COLLECTOR;
        } else {
            challengeType = this.TYPES.FEATURE_DISCOVERER;
        }

        // Check if user already has this type of challenge active
        const existingChallenge = await db.get(
            `SELECT id FROM challenges 
             WHERE user_id = ? 
             AND challenge_type = ?
             AND status = 'active'
             AND end_date > datetime('now')`,
            [userId, challengeType]
        );

        if (existingChallenge) {
            // Return a different type or modify the existing one
            const alternativeTypes = Object.values(this.TYPES).filter(type => type !== challengeType);
            challengeType = alternativeTypes[Math.floor(Math.random() * alternativeTypes.length)];
        }

        // Create the personalized challenge
        return await this.create(userId, challengeType);
    }

    static async updateChallengeProgress(userId, eventType, metadata = {}) {
        // Find active challenges that might be affected by this event
        const relevantChallenges = await db.all(
            `SELECT * FROM challenges 
             WHERE user_id = ? 
             AND status = 'active'
             AND end_date > datetime('now')`,
            [userId]
        );

        const updatedChallenges = [];

        for (const challenge of relevantChallenges) {
            let shouldUpdate = false;
            let increment = 1;

            // Determine if this event affects the challenge
            switch (challenge.challenge_type) {
                case this.TYPES.WORKOUT_STREAK:
                    shouldUpdate = eventType === 'exercise';
                    break;
                case this.TYPES.ARTICLE_READER:
                    shouldUpdate = eventType === 'read_article';
                    break;
                case this.TYPES.POLICY_EXPLORER:
                    shouldUpdate = eventType === 'view_policy';
                    break;
                case this.TYPES.SOCIAL_CONNECTOR:
                    shouldUpdate = ['invite_friend', 'share_achievement'].includes(eventType);
                    break;
                case this.TYPES.FEATURE_DISCOVERER:
                    shouldUpdate = eventType === 'use_new_feature';
                    break;
                case this.TYPES.POINTS_COLLECTOR:
                    shouldUpdate = true; // Any event gives points
                    increment = metadata.pointsAwarded || 1;
                    break;
                case this.TYPES.LEVEL_CLIMBER:
                    shouldUpdate = metadata.levelUp === true;
                    break;
            }

            if (shouldUpdate) {
                const updated = await this.updateProgress(challenge.id, increment);
                updatedChallenges.push(updated);
            }
        }

        return updatedChallenges;
    }

    static async expireOldChallenges() {
        await db.run(
            `UPDATE challenges 
             SET status = 'expired'
             WHERE status = 'active'
             AND end_date <= datetime('now')`
        );
    }

    static async getUserChallengeStats(userId) {
        const stats = await db.get(
            `SELECT 
                COUNT(*) as total_challenges,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_challenges,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_challenges,
                SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_challenges,
                SUM(CASE WHEN status = 'completed' THEN reward_points ELSE 0 END) as total_rewards_earned
             FROM challenges
             WHERE user_id = ?`,
            [userId]
        );

        return {
            ...stats,
            completion_rate: stats.total_challenges > 0 
                ? (stats.completed_challenges / stats.total_challenges * 100).toFixed(1)
                : 0
        };
    }
}

module.exports = Challenge;