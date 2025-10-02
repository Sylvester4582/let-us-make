const express = require('express');
const { body, validationResult } = require('express-validator');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize challenges table
Challenge.initialize().catch(console.error);

// Get user's active challenges
router.get('/active', auth, async (req, res) => {
    try {
        const challenges = await Challenge.getUserActiveChallenges(req.userId);
        
        res.json({
            success: true,
            data: { challenges }
        });
    } catch (error) {
        console.error('Error fetching active challenges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching challenges',
            errors: [error.message]
        });
    }
});

// Get user's completed challenges
router.get('/completed', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const challenges = await Challenge.getUserCompletedChallenges(req.userId, limit);
        
        res.json({
            success: true,
            data: { challenges }
        });
    } catch (error) {
        console.error('Error fetching completed challenges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching completed challenges',
            errors: [error.message]
        });
    }
});

// Get personalized challenge
router.get('/personalized', auth, async (req, res) => {
    try {
        const challenge = await Challenge.generatePersonalizedChallenge(req.userId);
        
        res.json({
            success: true,
            data: { challenge }
        });
    } catch (error) {
        console.error('Error generating personalized challenge:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating challenge',
            errors: [error.message]
        });
    }
});

// Get user's challenge statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Challenge.getUserChallengeStats(req.userId);
        
        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        console.error('Error fetching challenge stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching challenge statistics',
            errors: [error.message]
        });
    }
});

// Update challenge progress manually
router.post('/:challengeId/progress', [
    auth,
    body('increment').optional().isInt({ min: 1 }).withMessage('Increment must be a positive integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { challengeId } = req.params;
        const { increment = 1 } = req.body;

        // Verify challenge belongs to user
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        if (challenge.user_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this challenge'
            });
        }

        const updatedChallenge = await Challenge.updateProgress(challengeId, increment);
        
        res.json({
            success: true,
            message: updatedChallenge.status === 'completed' 
                ? `🎉 Challenge completed! You earned ${updatedChallenge.reward_points} points!`
                : 'Challenge progress updated',
            data: { challenge: updatedChallenge }
        });
    } catch (error) {
        console.error('Error updating challenge progress:', error);
        if (error.message === 'Challenge not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Challenge is not active') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating challenge progress',
            errors: [error.message]
        });
    }
});

// Create a custom challenge
router.post('/create', [
    auth,
    body('challengeType').isIn(Object.values(Challenge.TYPES)).withMessage('Invalid challenge type'),
    body('title').optional().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').optional().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    body('targetValue').optional().isInt({ min: 1 }).withMessage('Target value must be a positive integer'),
    body('durationDays').optional().isInt({ min: 1, max: 30 }).withMessage('Duration must be 1-30 days')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { challengeType, ...options } = req.body;
        const challenge = await Challenge.create(req.userId, challengeType, options);
        
        res.json({
            success: true,
            message: 'Challenge created successfully',
            data: { challenge }
        });
    } catch (error) {
        console.error('Error creating challenge:', error);
        if (error.message.startsWith('Unknown challenge type')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating challenge',
            errors: [error.message]
        });
    }
});

// Get available challenge types
router.get('/types', auth, async (req, res) => {
    try {
        const types = Object.entries(Challenge.TYPES).map(([key, value]) => ({
            key,
            value,
            template: Challenge.TEMPLATES[value] || null
        }));
        
        res.json({
            success: true,
            data: { types }
        });
    } catch (error) {
        console.error('Error fetching challenge types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching challenge types',
            errors: [error.message]
        });
    }
});

// Expire old challenges (maintenance endpoint)
router.post('/expire-old', auth, async (req, res) => {
    try {
        await Challenge.expireOldChallenges();
        
        res.json({
            success: true,
            message: 'Old challenges expired successfully'
        });
    } catch (error) {
        console.error('Error expiring challenges:', error);
        res.status(500).json({
            success: false,
            message: 'Error expiring old challenges',
            errors: [error.message]
        });
    }
});

module.exports = router;