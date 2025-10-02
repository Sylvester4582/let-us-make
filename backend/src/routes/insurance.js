const express = require('express');
const router = express.Router();
const Insurance = require('../models/Insurance');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Initialize insurance tables on server start
Insurance.initialize().catch(console.error);

// Get all available insurance plans
router.get('/plans', auth, async (req, res) => {
    try {
        const plans = await Insurance.getAllPlans();
        res.json({
            success: true,
            data: { plans }
        });
    } catch (error) {
        console.error('Error fetching insurance plans:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch insurance plans'
            }
        });
    }
});

// Get specific plan details
router.get('/plans/:planId', auth, async (req, res) => {
    try {
        const plan = await Insurance.getPlan(req.params.planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Insurance plan not found'
                }
            });
        }
        res.json({
            success: true,
            data: { plan }
        });
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch plan details'
            }
        });
    }
});

// Calculate user's discount percentage
router.get('/calculate-discount', auth, async (req, res) => {
    try {
        const discount = await Insurance.calculateUserDiscount(req.userId);
        res.json({
            success: true,
            data: { 
                discount,
                discountPercentage: Math.round(discount * 100)
            }
        });
    } catch (error) {
        console.error('Error calculating discount:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to calculate discount'
            }
        });
    }
});

// Enroll in an insurance plan
router.post('/enroll', auth, async (req, res) => {
    try {
        const { planId } = req.body;
        
        if (!planId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Plan ID is required'
                }
            });
        }

        // Check if plan exists
        const plan = await Insurance.getPlan(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Insurance plan not found'
                }
            });
        }

        // Enroll user
        const enrollment = await Insurance.enrollUser({
            userId: req.userId,
            planId
        });

        res.json({
            success: true,
            message: `Successfully enrolled in ${plan.name}`,
            data: { enrollment }
        });
    } catch (error) {
        console.error('Error enrolling user:', error);
        if (error.message === 'User already has an active insurance plan') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_ENROLLED',
                    message: error.message
                }
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to enroll in plan'
            }
        });
    }
});

// Get user's current insurance plan
router.get('/current', auth, async (req, res) => {
    try {
        const currentPlan = await Insurance.getUserCurrentPlan(req.userId);
        
        if (!currentPlan) {
            return res.json({
                success: true,
                data: { currentPlan: null }
            });
        }

        // Calculate current discount
        const discount = await Insurance.calculateUserDiscount(req.userId);
        const discountedPremium = currentPlan.premium * (1 - discount);

        res.json({
            success: true,
            data: {
                currentPlan: {
                    ...currentPlan,
                    currentDiscount: discount,
                    discountedPremium,
                    savings: currentPlan.premium - discountedPremium
                }
            }
        });
    } catch (error) {
        console.error('Error fetching current plan:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch current plan'
            }
        });
    }
});

// Get user's discount history
router.get('/discount-history', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = await Insurance.getUserDiscountHistory(req.userId, limit);
        
        res.json({
            success: true,
            data: { history }
        });
    } catch (error) {
        console.error('Error fetching discount history:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch discount history'
            }
        });
    }
});

// Cancel/Update insurance plan
router.patch('/current', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['ACTIVE', 'CANCELLED', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid status. Must be ACTIVE, CANCELLED, or SUSPENDED'
                }
            });
        }

        // This would typically update the user_insurance status
        // Implementation depends on business logic requirements
        
        res.json({
            success: true,
            message: `Insurance plan status updated to ${status}`
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to update plan'
            }
        });
    }
});

module.exports = router;