const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

// Record a new event
router.post('/', auth, [
  body('eventType').isString().isIn(Object.keys(Event.TYPES)),
  body('metadata').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { eventType, metadata } = req.body;
    const userId = req.user.id;

    // Create event
    const event = await Event.create(userId, eventType, metadata);

    // Update user points
    const updatedUser = await User.updatePoints(userId, event.pointsAwarded);

    // Check for level up
    const levelUp = updatedUser.level > (req.user.level || 1);

    res.json({
      success: true,
      data: {
        event,
        pointsAwarded: event.pointsAwarded,
        totalPoints: updatedUser.points,
        levelUp,
        newLevel: updatedUser.level,
        unlockedPremiumDiscount: updatedUser.unlocked_premium_discount,
        discountPercentage: updatedUser.discount_percentage,
        message: generateEventMessage(eventType, levelUp)
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording event',
      errors: [error.message]
    });
  }
});

// Get user's event history
router.get('/history', auth, async (req, res) => {
  try {
    const events = await Event.getUserEvents(req.user.id);
    
    res.json({
      success: true,
      data: {
        events: events.map(event => ({
          ...event,
          metadata: JSON.parse(event.metadata)
        }))
      }
    });
  } catch (error) {
    console.error('Event history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event history',
      errors: [error.message]
    });
  }
});

function generateEventMessage(eventType, levelUp) {
  const messages = {
    daily_login: 'Welcome back! Keep up the streak! 🌟',
    log_workout: 'Great workout! Your body will thank you! 💪',
    read_article: 'Knowledge is power! Keep learning! 📚',
    view_policy: 'Smart move checking out our policies! 🎯',
    complete_challenge: 'Challenge conquered! You\'re unstoppable! 🏆',
    invite_friend: 'Thanks for spreading the wellness! 🤝',
    share_achievement: 'Sharing is caring! 🌟',
    use_new_feature: 'Thanks for trying something new! 🎉'
  };

  let message = messages[eventType] || 'Great job!';
  if (levelUp) {
    message += ' Level Up! 🎊';
  }

  return message;
}

module.exports = router;