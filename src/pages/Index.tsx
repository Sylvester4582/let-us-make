import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { LevelProgress } from "@/components/LevelProgress";
import { ActionCard } from "@/components/ActionCard";
import { ChallengeCard } from "@/components/ChallengeCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { BadgeShowcase } from "@/components/BadgeShowcase";
import { DailyRewardCard } from "@/components/DailyRewardCard";
import { PointsAnimation } from "@/components/PointsAnimation";
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
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [userData, setUserData] = useState({
    points: 285,
    level: 3,
    streak: 7,
    levelTitle: "Advocate",
  });
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);

  const handleActivityLog = (activityName: string, points: number) => {
    setUserData(prev => ({ ...prev, points: prev.points + points }));
    setAnimatedPoints(points);
    setShowPointsAnimation(true);
    
    toast.success(`🎉 +${points} points earned!`, {
      description: `Amazing! You just logged your ${activityName}!`,
      duration: 3000,
    });

    setTimeout(() => setShowPointsAnimation(false), 2000);
  };

  const mockLeaderboard = [
    { rank: 1, username: "Sarah Chen", points: 1245, level: 5 },
    { rank: 2, username: "Mike Johnson", points: 987, level: 4 },
    { rank: 3, username: "Emma Davis", points: 756, level: 4 },
    { rank: 4, username: "You", points: 285, level: 3 },
    { rank: 5, username: "Alex Kumar", points: 234, level: 2 },
  ];

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
                👋 Welcome back, User!
              </div>
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
            currentPoints={userData.points % 300}
            pointsToNextLevel={300}
            levelTitle={userData.levelTitle}
          />
        </div>

        {/* Daily Reward */}
        <div className="mb-8 animate-slide-up">
          <DailyRewardCard onClaim={(points) => handleActivityLog("daily reward", points)} />
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
                  onClick={() => handleActivityLog("workout", 10)}
                  color="primary"
                />
                <ActionCard
                  icon={BookOpen}
                  title="Read Article"
                  description="Learn about wellness"
                  points={7}
                  onClick={() => handleActivityLog("article", 7)}
                  color="secondary"
                />
                <ActionCard
                  icon={FileText}
                  title="View Policy"
                  description="Check your insurance details"
                  points={15}
                  onClick={() => handleActivityLog("policy review", 15)}
                  color="accent"
                />
                <ActionCard
                  icon={Users}
                  title="Invite Friend"
                  description="Share YouMatter with others"
                  points={20}
                  onClick={() => handleActivityLog("friend invite", 20)}
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
                entries={mockLeaderboard}
                currentUserRank={4}
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <BadgeShowcase />
            </div>
          </div>
        </div>

        {/* Achievement Showcase */}
        <section className="mt-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold">Your Benefits</h2>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse">
              🎁 Unlock more rewards!
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-card rounded-xl shadow-card border-2 border-success hover:scale-105 transition-all cursor-pointer group animate-pulse-success">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success/10 rounded-lg group-hover:animate-bounce-subtle">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-semibold">Premium Discount</h3>
              </div>
              <p className="text-3xl font-bold text-success mb-1 group-hover:scale-110 transition-transform">10% OFF</p>
              <p className="text-sm text-muted-foreground">✓ Unlocked at Level 3</p>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-card border-2 border-dashed border-muted hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg group-hover:animate-bounce-subtle">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground">Next Unlock</h3>
              </div>
              <p className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">20% OFF</p>
              <p className="text-sm text-muted-foreground">Reach Level 4 (315 points to go)</p>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-card border-2 border-dashed border-muted hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg group-hover:animate-bounce-subtle">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground">Final Unlock</h3>
              </div>
              <p className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">30% OFF</p>
              <p className="text-sm text-muted-foreground">Reach Level 5 (Master)</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
