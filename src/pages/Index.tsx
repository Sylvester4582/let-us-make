import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { LevelProgress } from "@/components/LevelProgress";
import { ActionCard } from "@/components/ActionCard";
import { ChallengeCard } from "@/components/ChallengeCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { 
  Award, 
  Flame, 
  Zap, 
  Dumbbell, 
  BookOpen, 
  FileText, 
  Users, 
  Share2,
  Activity
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [userData, setUserData] = useState({
    points: 285,
    level: 3,
    streak: 7,
    levelTitle: "Advocate",
  });

  const handleActivityLog = (activityName: string, points: number) => {
    setUserData(prev => ({ ...prev, points: prev.points + points }));
    toast.success(`+${points} points earned!`, {
      description: `Great job logging your ${activityName}!`,
    });
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
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">YouMatter</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">
                👋 Welcome back, User!
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Level Progress - Hero Section */}
        <div className="mb-8">
          <LevelProgress
            level={userData.level}
            currentPoints={userData.points % 300}
            pointsToNextLevel={300}
            levelTitle={userData.levelTitle}
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <section>
              <h2 className="text-2xl font-bold mb-4">Earn Points</h2>
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
            <section>
              <h2 className="text-2xl font-bold mb-4">Active Challenges</h2>
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

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <LeaderboardCard 
              entries={mockLeaderboard}
              currentUserRank={4}
            />
          </div>
        </div>

        {/* Achievement Showcase */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-card rounded-xl shadow-card border-2 border-success">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-semibold">Premium Discount</h3>
              </div>
              <p className="text-2xl font-bold text-success mb-1">10% OFF</p>
              <p className="text-sm text-muted-foreground">Unlocked at Level 3</p>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground">Next Unlock</h3>
              </div>
              <p className="text-2xl font-bold mb-1">20% OFF</p>
              <p className="text-sm text-muted-foreground">Reach Level 4 (315 points to go)</p>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground">Final Unlock</h3>
              </div>
              <p className="text-2xl font-bold mb-1">30% OFF</p>
              <p className="text-sm text-muted-foreground">Reach Level 5 (Master)</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
