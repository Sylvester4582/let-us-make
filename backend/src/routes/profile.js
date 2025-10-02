const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get user health profile
router.get('/health-profile', authenticateToken, async (req, res) => {
    try {
        const result = await db.get(
            `SELECT age, height, weight, gender, date_of_birth, updated_at
             FROM user_health_profiles 
             WHERE user_id = ?`,
            [req.user.id]
        );

        if (!result) {
            return res.json({
                success: true,
                data: null,
                message: 'No health profile found'
            });
        }

        res.json({
            success: true,
            data: {
                age: result.age,
                height: result.height,
                weight: result.weight,
                gender: result.gender,
                dateOfBirth: result.date_of_birth,
                updatedAt: result.updated_at
            }
        });
    } catch (error) {
        console.error('Error fetching health profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch health profile',
            errors: [error.message]
        });
    }
});

// Update user health profile
router.put('/health-profile', 
    authenticateToken,
    [
        body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
        body('height').optional().isInt({ min: 120, max: 250 }).withMessage('Height must be between 120 and 250 cm'),
        body('weight').optional().isInt({ min: 30, max: 300 }).withMessage('Weight must be between 30 and 300 kg'),
        body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
        body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array().map(err => err.msg)
                });
            }

            const { age, height, weight, gender, dateOfBirth } = req.body;
            const userId = req.user.id;

            // Check if profile exists
            const existing = await db.get(
                'SELECT id FROM user_health_profiles WHERE user_id = ?',
                [userId]
            );

            if (existing) {
                // Update existing profile
                await db.run(
                    `UPDATE user_health_profiles 
                     SET age = COALESCE(?, age),
                         height = COALESCE(?, height),
                         weight = COALESCE(?, weight),
                         gender = COALESCE(?, gender),
                         date_of_birth = COALESCE(?, date_of_birth),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = ?`,
                    [age, height, weight, gender, dateOfBirth, userId]
                );
            } else {
                // Create new profile
                await db.run(
                    `INSERT INTO user_health_profiles (user_id, age, height, weight, gender, date_of_birth)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, age, height, weight, gender, dateOfBirth]
                );
            }

            // Fetch updated profile
            const updatedProfile = await db.get(
                `SELECT age, height, weight, gender, date_of_birth, updated_at
                 FROM user_health_profiles 
                 WHERE user_id = ?`,
                [userId]
            );

            res.json({
                success: true,
                data: {
                    age: updatedProfile.age,
                    height: updatedProfile.height,
                    weight: updatedProfile.weight,
                    gender: updatedProfile.gender,
                    dateOfBirth: updatedProfile.date_of_birth,
                    updatedAt: updatedProfile.updated_at
                },
                message: 'Health profile updated successfully'
            });

        } catch (error) {
            console.error('Error updating health profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update health profile',
                errors: [error.message]
            });
        }
    }
);

// Calculate user's risk score
router.get('/risk-assessment', authenticateToken, async (req, res) => {
    try {
        // Get health profile
        const healthProfile = await db.get(
            `SELECT age, height, weight FROM user_health_profiles WHERE user_id = ?`,
            [req.user.id]
        );

        if (!healthProfile) {
            return res.status(404).json({
                success: false,
                message: 'Health profile not found. Please complete your health profile first.'
            });
        }

        // Get user activity data
        const userStats = await db.get(
            `SELECT points, streak FROM users WHERE id = ?`,
            [req.user.id]
        );

        // Get challenges completed count
        const challengesCompleted = await db.get(
            `SELECT COUNT(*) as count FROM user_challenges 
             WHERE user_id = ? AND status = 'completed'`,
            [req.user.id]
        );

        // Calculate BMI
        const heightM = healthProfile.height / 100;
        const bmi = healthProfile.weight / (heightM * heightM);
        
        // Calculate risk factors
        const optimalBmi = 22;
        const bmiDeviation = Math.abs(bmi - optimalBmi);
        const bmiRisk = Math.min(bmiDeviation * 1.5, 10); // Max 10 points

        // Fitness risk (lower points = better fitness)
        const challengeCount = challengesCompleted.count || 0;
        const fitnessScore = Math.min(challengeCount * 0.5 + (userStats.streak || 0) * 0.3, 10);
        const fitnessRisk = Math.max(10 - fitnessScore, 0);

        // Age risk
        const ageRisk = Math.min(Math.max((healthProfile.age - 20) * 0.2, 0), 10);

        // Weighted total risk (normalized to 0-10)
        const totalRisk = (bmiRisk * 0.25) + (fitnessRisk * 0.45) + (ageRisk * 0.30);
        
        // Convert to level (1-7, lower risk = higher level)
        const level = Math.max(1, Math.min(7, Math.ceil(7 - (totalRisk / 10) * 6)));
        
        // Calculate discount percentage (5% to 25%)
        const discountPercentage = 5 + (level - 1) * (20 / 6);

        res.json({
            success: true,
            data: {
                riskScore: Math.round(totalRisk * 10) / 10,
                level,
                discountPercentage: Math.round(discountPercentage),
                factors: {
                    bmi: Math.round(bmi * 10) / 10,
                    bmiRisk: Math.round(bmiRisk * 10) / 10,
                    fitnessRisk: Math.round(fitnessRisk * 10) / 10,
                    ageRisk: Math.round(ageRisk * 10) / 10
                },
                challengesCompleted: challengeCount,
                userPoints: userStats.points || 0,
                userStreak: userStats.streak || 0
            }
        });

    } catch (error) {
        console.error('Error calculating risk assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate risk assessment',
            errors: [error.message]
        });
    }
});

// Add points to user (for daily challenges)
router.post('/add-points', 
    authenticateToken,
    [
        body('points').isInt({ min: 1, max: 1000 }).withMessage('Points must be between 1 and 1000')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array().map(err => err.msg)
                });
            }

            const { points } = req.body;
            const userId = req.user.id;

            // Import User model
            const User = require('../models/User');
            
            // Update user points using the existing method
            const updatedUser = await User.updatePoints(userId, points);

            res.json({
                success: true,
                data: {
                    totalPoints: updatedUser.points,
                    level: updatedUser.level,
                    pointsAdded: points
                },
                message: `Successfully added ${points} points`
            });

        } catch (error) {
            console.error('Error adding points:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add points',
                errors: [error.message]
            });
        }
    }
);

module.exports = router;