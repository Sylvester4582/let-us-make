const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Insurance {
    static async initialize() {
        // Insurance plans table
        await db.run(`
            CREATE TABLE IF NOT EXISTS insurance_plans (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                premium REAL NOT NULL,
                coverage REAL NOT NULL,
                features TEXT NOT NULL,
                max_discount INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User insurance enrollments
        await db.run(`
            CREATE TABLE IF NOT EXISTS user_insurance (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                plan_id TEXT NOT NULL,
                current_discount REAL DEFAULT 0,
                start_date TEXT NOT NULL,
                last_update_date TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(plan_id) REFERENCES insurance_plans(id)
            )
        `);

        // Discount history tracking
        await db.run(`
            CREATE TABLE IF NOT EXISTS discount_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                plan_id TEXT NOT NULL,
                discount_type TEXT NOT NULL,
                amount REAL NOT NULL,
                reason TEXT NOT NULL,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(plan_id) REFERENCES insurance_plans(id)
            )
        `);

        // Create indexes
        await db.run(`CREATE INDEX IF NOT EXISTS idx_user_insurance_user ON user_insurance(user_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_discount_history_user ON discount_history(user_id)`);

        // Initialize default plans if they don't exist
        await this.initializeDefaultPlans();
    }

    static async initializeDefaultPlans() {
        const existingPlans = await db.all('SELECT COUNT(*) as count FROM insurance_plans');
        if (existingPlans[0].count === 0) {
            const defaultPlans = [
                {
                    id: 'basic-health',
                    name: 'Basic Health Coverage',
                    type: 'health',
                    premium: 200,
                    coverage: 100000,
                    features: {
                        basicMedical: true,
                        emergency: true,
                        prescriptions: true,
                        annualCheckup: true,
                        specialists: false,
                        mentalHealth: false,
                        preventiveCare: false,
                        maternity: false,
                        dental: false,
                        vision: false
                    },
                    maxDiscount: 15
                },
                {
                    id: 'premium-health',
                    name: 'Premium Health Plan',
                    type: 'health',
                    premium: 350,
                    coverage: 250000,
                    features: {
                        basicMedical: true,
                        emergency: true,
                        prescriptions: true,
                        annualCheckup: true,
                        specialists: true,
                        mentalHealth: true,
                        preventiveCare: true,
                        maternity: false,
                        dental: false,
                        vision: false
                    },
                    maxDiscount: 25
                },
                {
                    id: 'family-coverage',
                    name: 'Family Coverage',
                    type: 'family',
                    premium: 500,
                    coverage: 500000,
                    features: {
                        basicMedical: true,
                        emergency: true,
                        prescriptions: true,
                        annualCheckup: true,
                        specialists: true,
                        mentalHealth: true,
                        preventiveCare: true,
                        maternity: true,
                        dental: true,
                        vision: true
                    },
                    maxDiscount: 30
                }
            ];

            for (const plan of defaultPlans) {
                await this.createPlan(plan);
            }
        }
    }

    static async createPlan(planData) {
        const { id, name, type, premium, coverage, features, maxDiscount } = planData;
        await db.run(
            `INSERT INTO insurance_plans (id, name, type, premium, coverage, features, max_discount)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, type, premium, coverage, JSON.stringify(features), maxDiscount]
        );
        return planData;
    }

    static async getPlan(planId) {
        const plan = await db.get(
            'SELECT * FROM insurance_plans WHERE id = ?',
            [planId]
        );
        if (plan) {
            plan.features = JSON.parse(plan.features);
        }
        return plan;
    }

    static async getAllPlans() {
        const plans = await db.all('SELECT * FROM insurance_plans');
        return plans.map(plan => ({
            ...plan,
            features: JSON.parse(plan.features)
        }));
    }

    static async enrollUser(enrollmentData) {
        const id = uuidv4();
        const { userId, planId, startDate = new Date().toISOString() } = enrollmentData;
        
        // Check if user already has an active plan
        const existingPlan = await this.getUserCurrentPlan(userId);
        if (existingPlan) {
            throw new Error('User already has an active insurance plan');
        }

        await db.run(
            `INSERT INTO user_insurance (id, user_id, plan_id, start_date, last_update_date, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, planId, startDate, startDate, 'ACTIVE']
        );

        return await this.getUserInsurance(id);
    }

    static async getUserCurrentPlan(userId) {
        const result = await db.get(
            `SELECT ui.*, ip.name, ip.premium, ip.coverage, ip.features, ip.max_discount
             FROM user_insurance ui
             JOIN insurance_plans ip ON ui.plan_id = ip.id
             WHERE ui.user_id = ? AND ui.status = 'ACTIVE'`,
            [userId]
        );

        if (result) {
            result.features = JSON.parse(result.features);
        }
        return result;
    }

    static async getUserInsurance(insuranceId) {
        const result = await db.get(
            `SELECT ui.*, ip.name, ip.premium, ip.coverage, ip.features, ip.max_discount
             FROM user_insurance ui
             JOIN insurance_plans ip ON ui.plan_id = ip.id
             WHERE ui.id = ?`,
            [insuranceId]
        );

        if (result) {
            result.features = JSON.parse(result.features);
        }
        return result;
    }

    static async calculateUserDiscount(userId) {
        // Get user data
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) return 0;

        let totalDiscount = 0;

        // Health score based discount (based on user level as health proxy)
        const healthScoreDiscount = this.calculateHealthScoreDiscount(user.level);
        totalDiscount += healthScoreDiscount;

        // Activity based discount (based on points/events)
        const activityDiscount = await this.calculateActivityDiscount(userId);
        totalDiscount += activityDiscount;

        // Preventive care discount (if user has done checkups)
        const preventiveDiscount = await this.calculatePreventiveDiscount(userId);
        totalDiscount += preventiveDiscount;

        // Cap the discount at reasonable limits
        return Math.min(totalDiscount, 30) / 100; // Convert to decimal, max 30%
    }

    static calculateHealthScoreDiscount(userLevel) {
        // Convert user level to health score simulation
        const healthScore = Math.min(userLevel * 20, 100); // Level 5 = 100 health score
        
        if (healthScore >= 90) return 15;
        if (healthScore >= 80) return 12;
        if (healthScore >= 70) return 10;
        if (healthScore >= 60) return 7;
        return 0;
    }

    static async calculateActivityDiscount(userId) {
        // Count exercise events in the last 180 days
        const exerciseDays = await db.get(
            `SELECT COUNT(DISTINCT DATE(timestamp)) as days
             FROM events 
             WHERE user_id = ? 
             AND event_type = 'exercise'
             AND timestamp > datetime('now', '-180 days')`,
            [userId]
        );

        const days = exerciseDays?.days || 0;
        if (days >= 180) return 8;
        if (days >= 90) return 5;
        if (days >= 30) return 2;
        return 0;
    }

    static async calculatePreventiveDiscount(userId) {
        // Check for checkup events in the last year
        const checkups = await db.get(
            `SELECT COUNT(*) as count
             FROM events 
             WHERE user_id = ? 
             AND event_type = 'checkup'
             AND timestamp > datetime('now', '-365 days')`,
            [userId]
        );

        return checkups?.count > 0 ? 3 : 0;
    }

    static async recordDiscountHistory(userId, planId, discountType, amount, reason) {
        const id = uuidv4();
        await db.run(
            `INSERT INTO discount_history (id, user_id, plan_id, discount_type, amount, reason)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, planId, discountType, amount, reason]
        );
    }

    static async getUserDiscountHistory(userId, limit = 10) {
        return await db.all(
            `SELECT dh.*, ip.name as plan_name
             FROM discount_history dh
             JOIN insurance_plans ip ON dh.plan_id = ip.id
             WHERE dh.user_id = ?
             ORDER BY dh.timestamp DESC
             LIMIT ?`,
            [userId, limit]
        );
    }
}

module.exports = Insurance;