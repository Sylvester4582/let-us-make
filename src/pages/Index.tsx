import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAI } from "@/hooks/useAI";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/StatsCard";
import { LevelProgress } from "@/components/LevelProgress";
import { ActionCard } from "@/components/ActionCard";
import { ChallengeCard } from "@/components/ChallengeCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { BadgeShowcase } from "@/components/BadgeShowcase";
import { DailyRewardCard } from "@/components/DailyRewardCard";
import { PointsAnimation } from "@/components/PointsAnimation";
import { AIMotivationCard } from "@/components/AIMotivationCard";
import { AIPredictiveChallenges } from "@/components/AIPredictiveChallenges";
import { AIRecommendationsPanel } from "@/components/AIRecommendationsPanel";
import { AIUserProfileInsights } from "@/components/AIUserProfileInsights";
import { BenefitsCard } from "@/components/BenefitsCard";
import { Button } from "@/components/ui/button";
import { EventType } from "@/services/eventService";
import { 
  Award, 
  Flame, 
  Zap, 
  Dumbbell, 
  BookOpen, 
  FileText, 
  Users, 
  Share2,
  Activity,
  Sparkles,
  Brain,
  LogOut,
  User
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { userData, updatePoints, calculateLevel, resetUserData, logEvent } = useUser();
  const { leaderboard, currentUserRank, isLoading: leaderboardLoading } = useLeaderboard();
  const { logActivity } = useAI();
  const { user, logout, isAuthenticated } = useAuth();
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);

  // Calculate points needed for next level
  const getLevelProgress = () => {
    const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
    const currentLevel = userData.level;
    
    if (currentLevel >= 5) {
      return { currentPoints: 0, pointsToNextLevel: 1, progress: 100 };
    }
    
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || 1500;
    const currentPoints = userData.points - currentThreshold;
    const pointsToNextLevel = nextThreshold - currentThreshold;
    
    return { currentPoints, pointsToNextLevel };
  };

  const levelProgress = getLevelProgress();

  const handleActivityLog = async (activityName: string, eventType: EventType, fallbackPoints: number) => {
    // Try to log event via backend first
    const response = await logEvent(eventType);
    
    if (response && response.success && response.data) {
      // Backend event logged successfully
      setAnimatedPoints(response.data.pointsAwarded);
      setShowPointsAnimation(true);
      
      // Show level up message if applicable
      if (response.data.levelUp) {
        toast.success(`🎉 Level Up! Welcome to Level ${response.data.newLevel}!`, {
          description: response.data.message,
          duration: 5000,
        });
      } else {
        toast.success(`🎉 +${response.data.pointsAwarded} points earned!`, {
          description: response.data.message,
          duration: 3000,
        });
      }
      
      // Show premium unlock notification
      if (response.data.unlockedPremiumDiscount) {
        toast.success(`🌟 Premium Unlocked! ${response.data.discountPercentage}% discount available!`, {
          description: "You've unlocked premium features and discounts!",
          duration: 5000,
        });
      }
    } else {
      // Fallback to local points update
      await updatePoints(fallbackPoints);
      setAnimatedPoints(fallbackPoints);
      setShowPointsAnimation(true);
      
      toast.success(`🎉 +${fallbackPoints} points earned!`, {
        description: `Amazing! You just logged your ${activityName}!`,
        duration: 3000,
      });
    }
    
    // Log activity for AI analysis
    logActivity({
      id: `activity-${Date.now()}`,
      type: activityName,
      timestamp: new Date(),
      points: response?.data?.pointsAwarded || fallbackPoints
    });

    setTimeout(() => setShowPointsAnimation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Points Animation Overlay */}
      <PointsAnimation points={animatedPoints} show={showPointsAnimation} />

      {/* Header */}
      <header className="bg-gradient-hero text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm animate-bounce-subtle">
                <Activity className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">YouMatter</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                👋 Welcome back, {isAuthenticated ? user?.username : userData.username}!
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-white hover:bg-white/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Level Progress - Hero Section */}
        <div className="mb-8 animate-fade-in">
          <LevelProgress
            level={userData.level}
            currentPoints={levelProgress.currentPoints}
            pointsToNextLevel={levelProgress.pointsToNextLevel}
            levelTitle={userData.levelTitle}
          />
        </div>

        {/* Daily Reward */}
        <div className="mb-8 animate-slide-up">
          <DailyRewardCard onClaim={(points) => handleActivityLog("daily reward", EventType.DAILY_LOGIN, points)} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <StatsCard
            icon={Zap}
            label="Total Points"
            value={userData.points.toLocaleString()}
            subtitle="Keep earning!"
            variant="primary"
          />
          <StatsCard
            icon={Award}
            label="Current Level"
            value={userData.level}
            subtitle={userData.levelTitle}
          />
          <StatsCard
            icon={Flame}
            label="Daily Streak"
            value={`${userData.streak} days`}
            subtitle="Don't break the chain!"
            variant="success"
          />
        </div>

        {/* AI-Powered Features Section */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
              <p className="text-sm text-muted-foreground">Personalized recommendations just for you</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AIMotivationCard />
            <AIUserProfileInsights />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AIPredictiveChallenges />
            <AIRecommendationsPanel />
          </div>
        </section>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Actions and Challenges */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">Earn Points</h2>
                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-bold animate-pulse">
                  Click to earn! 🎯
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                  icon={Dumbbell}
                  title="Log Workout"
                  description="Record your fitness activity"
                  points={10}
                  onClick={() => handleActivityLog("workout", EventType.LOG_WORKOUT, 10)}
                  color="primary"
                />
                <ActionCard
                  icon={BookOpen}
                  title="Read Article"
                  description="Learn about wellness"
                  points={7}
                  onClick={() => handleActivityLog("article", EventType.READ_ARTICLE, 7)}
                  color="secondary"
                />
                <ActionCard
                  icon={FileText}
                  title="View Policy"
                  description="Check your insurance details"
                  points={15}
                  onClick={() => handleActivityLog("policy review", EventType.VIEW_POLICY, 15)}
                  color="accent"
                />
                <ActionCard
                  icon={Users}
                  title="Invite Friend"
                  description="Share YouMatter with others"
                  points={20}
                  onClick={() => handleActivityLog("friend invite", EventType.INVITE_FRIEND, 20)}
                  color="success"
                />
              </div>
            </section>

            {/* Active Challenges */}
            <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Active Challenges</h2>
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">
                  🏆 Complete for bonus points!
                </div>
              </div>
              <div className="space-y-4">
                <ChallengeCard
                  title="Workout Warrior"
                  description="Complete 5 workouts this week"
                  progress={3}
                  target={5}
                  reward={50}
                  timeLeft="3 days left"
                />
                <ChallengeCard
                  title="Knowledge Seeker"
                  description="Read 10 wellness articles"
                  progress={7}
                  target={10}
                  reward={35}
                  timeLeft="5 days left"
                />
                <ChallengeCard
                  title="Social Butterfly"
                  description="Invite 3 friends to join"
                  progress={1}
                  target={3}
                  reward={60}
                  timeLeft="7 days left"
                />
              </div>
            </section>
          </div>

          {/* Right Column - Leaderboard & Badges */}
          <div className="lg:col-span-1 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <LeaderboardCard 
                entries={leaderboard}
                currentUserRank={currentUserRank}
                isLoading={leaderboardLoading}
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <BadgeShowcase />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <section className="mt-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <BenefitsCard />
        </section>

        {/* Debug Panel - Remove in production */}
        <section className="mt-8 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Debug Panel</h3>
            <button 
              onClick={resetUserData}
              className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90"
            >
              Reset Data
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Stored Points: {userData.points} | Level: {userData.level} ({userData.levelTitle})</p>
            <p>Data persists across page refreshes via localStorage</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
