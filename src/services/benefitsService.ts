import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Benefit {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  requiredPoints: number;
  requiredLevel: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  icon: string;
  category: 'discount' | 'feature' | 'exclusive';
  validUntil?: Date;
}

export interface UserBenefits {
  unlockedBenefits: Benefit[];
  availableBenefits: Benefit[];
  claimedBenefits: Benefit[];
  totalSavings: number;
}

export interface ClaimBenefitResponse {
  success: boolean;
  message: string;
  benefit?: Benefit;
  error?: string;
}

// Define all available benefits
export const AVAILABLE_BENEFITS: Omit<Benefit, 'isUnlocked' | 'isClaimed'>[] = [
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

class BenefitsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('youmatter_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async getUserBenefits(): Promise<UserBenefits> {
    try {
      const response = await axios.get(`${API_URL}/api/benefits`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching user benefits:', error);
      // Fallback to calculate benefits locally
      return this.calculateBenefitsLocally();
    }
  }

  async claimBenefit(benefitId: string): Promise<ClaimBenefitResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/api/benefits/claim`,
        { benefitId },
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error claiming benefit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      return {
        success: false,
        message: responseMessage || 'Failed to claim benefit',
        error: errorMessage
      };
    }
  }

  private calculateBenefitsLocally(): UserBenefits {
    // Get user data from localStorage as fallback
    const userData = JSON.parse(localStorage.getItem('youmatter_user_data') || '{}');
    const claimedBenefits = JSON.parse(localStorage.getItem('youmatter_claimed_benefits') || '[]');
    
    const userPoints = userData.points || 0;
    const userLevel = userData.level || 1;

    const benefitsWithStatus = AVAILABLE_BENEFITS.map(benefit => ({
      ...benefit,
      isUnlocked: userPoints >= benefit.requiredPoints && userLevel >= benefit.requiredLevel,
      isClaimed: claimedBenefits.includes(benefit.id)
    }));

    const unlockedBenefits = benefitsWithStatus.filter(b => b.isUnlocked && !b.isClaimed);
    const availableBenefits = benefitsWithStatus.filter(b => !b.isUnlocked);
    const claimedBenefitsData = benefitsWithStatus.filter(b => b.isClaimed);
    
    const totalSavings = claimedBenefitsData
      .filter(b => b.category === 'discount')
      .reduce((sum, b) => sum + b.discountPercentage, 0);

    return {
      unlockedBenefits,
      availableBenefits,
      claimedBenefits: claimedBenefitsData,
      totalSavings
    };
  }

  async claimBenefitLocally(benefitId: string): Promise<ClaimBenefitResponse> {
    try {
      const benefits = this.calculateBenefitsLocally();
      const benefit = benefits.unlockedBenefits.find(b => b.id === benefitId);
      
      if (!benefit) {
        return {
          success: false,
          message: 'Benefit not available or already claimed'
        };
      }

      // Save claimed benefit to localStorage
      const claimedBenefits = JSON.parse(localStorage.getItem('youmatter_claimed_benefits') || '[]');
      claimedBenefits.push(benefitId);
      localStorage.setItem('youmatter_claimed_benefits', JSON.stringify(claimedBenefits));

      return {
        success: true,
        message: `Successfully claimed ${benefit.title}!`,
        benefit: { ...benefit, isClaimed: true }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to claim benefit locally',
        error: errorMessage
      };
    }
  }

  getNextBenefit(currentPoints: number, currentLevel: number): Benefit | null {
    const nextBenefit = AVAILABLE_BENEFITS
      .filter(b => currentPoints < b.requiredPoints || currentLevel < b.requiredLevel)
      .sort((a, b) => {
        const aDiff = a.requiredPoints - currentPoints;
        const bDiff = b.requiredPoints - currentPoints;
        return aDiff - bDiff;
      })[0];

    if (nextBenefit) {
      return {
        ...nextBenefit,
        isUnlocked: false,
        isClaimed: false
      };
    }
    return null;
  }

  getPointsToNextBenefit(currentPoints: number, currentLevel: number): number {
    const nextBenefit = this.getNextBenefit(currentPoints, currentLevel);
    return nextBenefit ? Math.max(0, nextBenefit.requiredPoints - currentPoints) : 0;
  }
}

export const benefitsService = new BenefitsService();