const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Define available benefits
const AVAILABLE_BENEFITS = [
  {
    id: 'starter-discount',
    title: 'Starter Discount',
    description: 'Welcome bonus for new members',
    discountPercentage: 5,
    requiredPoints: 100,
    requiredLevel: 2,
    icon: '🎯',
    category: 'discount'
  },
  {
    id: 'advocate-discount',
    title: 'Advocate Premium',
    description: 'Premium features and discounts',
    discountPercentage: 10,
    requiredPoints: 300,
    requiredLevel: 3,
    icon: '⭐',
    category: 'discount'
  },
  {
    id: 'champion-discount',
    title: 'Champion Exclusive',
    description: 'Exclusive discounts for champions',
    discountPercentage: 20,
    requiredPoints: 600,
    requiredLevel: 4,
    icon: '🏆',
    category: 'discount'
  },
  {
    id: 'master-discount',
    title: 'Wellness Master',
    description: 'Maximum savings for wellness masters',
    discountPercentage: 30,
    requiredPoints: 1000,
    requiredLevel: 5,
    icon: '👑',
    category: 'discount'
  },
  {
    id: 'early-access',
    title: 'Early Access',
    description: 'Early access to new features',
    discountPercentage: 0,
    requiredPoints: 200,
    requiredLevel: 2,
    icon: '🚀',
    category: 'feature'
  },
  {
    id: 'personal-coach',
    title: 'Personal AI Coach',
    description: 'Dedicated AI coaching sessions',
    discountPercentage: 0,
    requiredPoints: 500,
    requiredLevel: 4,
    icon: '🤖',
    category: 'feature'
  },
  {
    id: 'exclusive-content',
    title: 'Exclusive Content',
    description: 'Access to premium wellness content',
    discountPercentage: 0,
    requiredPoints: 800,
    requiredLevel: 5,
    icon: '📚',
    category: 'exclusive'
  }
];

// Get user benefits
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse claimed benefits from user data
    const claimedBenefits = user.claimed_benefits ? JSON.parse(user.claimed_benefits) : [];
    
    // Calculate benefit status for each benefit
    const benefitsWithStatus = AVAILABLE_BENEFITS.map(benefit => ({
      ...benefit,
      isUnlocked: user.points >= benefit.requiredPoints && user.level >= benefit.requiredLevel,
      isClaimed: claimedBenefits.includes(benefit.id)
    }));

    const unlockedBenefits = benefitsWithStatus.filter(b => b.isUnlocked && !b.isClaimed);
    const availableBenefits = benefitsWithStatus.filter(b => !b.isUnlocked);
    const claimedBenefitsData = benefitsWithStatus.filter(b => b.isClaimed);
    
    const totalSavings = claimedBenefitsData
      .filter(b => b.category === 'discount')
      .reduce((sum, b) => sum + b.discountPercentage, 0);

    res.json({
      unlockedBenefits,
      availableBenefits,
      claimedBenefits: claimedBenefitsData,
      totalSavings
    });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

// Claim a benefit
router.post('/claim', auth, async (req, res) => {
  try {
    const { benefitId } = req.body;
    
    if (!benefitId) {
      return res.status(400).json({ error: 'Benefit ID is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the benefit
    const benefit = AVAILABLE_BENEFITS.find(b => b.id === benefitId);
    if (!benefit) {
      return res.status(404).json({ error: 'Benefit not found' });
    }

    // Check if user meets requirements
    if (user.points < benefit.requiredPoints || user.level < benefit.requiredLevel) {
      return res.status(400).json({ 
        error: 'Requirements not met',
        message: `You need ${benefit.requiredPoints} points and level ${benefit.requiredLevel} to claim this benefit`
      });
    }

    // Parse claimed benefits
    const claimedBenefits = user.claimed_benefits ? JSON.parse(user.claimed_benefits) : [];
    
    // Check if already claimed
    if (claimedBenefits.includes(benefitId)) {
      return res.status(400).json({ 
        error: 'Already claimed',
        message: 'You have already claimed this benefit'
      });
    }

    // Add to claimed benefits
    claimedBenefits.push(benefitId);
    
    // Update user in database
    const db = require('../config/database');
    await db.run(
      'UPDATE users SET claimed_benefits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(claimedBenefits), req.userId]
    );

    res.json({
      success: true,
      message: `Successfully claimed ${benefit.title}!`,
      benefit: {
        ...benefit,
        isUnlocked: true,
        isClaimed: true
      }
    });
  } catch (error) {
    console.error('Error claiming benefit:', error);
    res.status(500).json({ error: 'Failed to claim benefit' });
  }
});

module.exports = router;