const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await User.getLeaderboard(limit);

    res.json({
      success: true,
      data: {
        leaderboard
      }
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
});

// Get current user's rank (requires authentication)
router.get('/my-rank', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const rank = await User.getUserRank(userId);

    res.json({
      success: true,
      data: {
        rank
      }
    });
  } catch (error) {
    console.error('User rank fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [error.message]
    });
  }
});

module.exports = router;