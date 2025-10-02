import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  UserFitnessGoal, 
  ExerciseType 
} from '../types/fitness';
import { FitnessService } from '../services/fitnessService';
import { useUser } from '../hooks/useUser';
import { 
  Target,
  Activity,
  Clock,
  Calendar,
  Heart,
  Zap,
  Waves,
  Trophy,
  Dumbbell
} from 'lucide-react';

interface FitnessGoalSetupProps {
  onGoalSet: (goal: UserFitnessGoal) => void;
  existingGoal?: UserFitnessGoal | null;
}

const exerciseTypeOptions: { type: ExerciseType; label: string; icon: React.ReactNode }[] = [
  { type: 'cardio', label: 'Cardio', icon: <Heart className="w-4 h-4" /> },
  { type: 'strength', label: 'Strength Training', icon: <Dumbbell className="w-4 h-4" /> },
  { type: 'hiit', label: 'HIIT', icon: <Zap className="w-4 h-4" /> },
  { type: 'yoga', label: 'Yoga', icon: <Activity className="w-4 h-4" /> },
  { type: 'swimming', label: 'Swimming', icon: <Waves className="w-4 h-4" /> },
  { type: 'running', label: 'Running', icon: <Target className="w-4 h-4" /> },
  { type: 'cycling', label: 'Cycling', icon: <Target className="w-4 h-4" /> },
  { type: 'sports_basketball', label: 'Basketball', icon: <Trophy className="w-4 h-4" /> },
  { type: 'sports_football', label: 'Football', icon: <Trophy className="w-4 h-4" /> },
  { type: 'sports_tennis', label: 'Tennis', icon: <Trophy className="w-4 h-4" /> },
  { type: 'sports_badminton', label: 'Badminton', icon: <Trophy className="w-4 h-4" /> },
  { type: 'aerobics', label: 'Aerobics', icon: <Activity className="w-4 h-4" /> },
  { type: 'pilates', label: 'Pilates', icon: <Activity className="w-4 h-4" /> },
  { type: 'crossfit', label: 'CrossFit', icon: <Dumbbell className="w-4 h-4" /> },
  { type: 'calisthenics', label: 'Calisthenics', icon: <Dumbbell className="w-4 h-4" /> }
];

export const FitnessGoalSetup: React.FC<FitnessGoalSetupProps> = ({ 
  onGoalSet, 
  existingGoal 
}) => {
  const { userData } = useUser();
  const [goalType, setGoalType] = useState<string>(
    existingGoal?.type || 'general_fitness'
  );
  const [currentWeight, setCurrentWeight] = useState<string>(
    existingGoal?.currentWeight?.toString() || ''
  );
  const [targetWeight, setTargetWeight] = useState<string>(
    existingGoal?.targetWeight?.toString() || ''
  );
  const [height, setHeight] = useState<string>('1.70'); // Default height in meters
  const [fitnessLevel, setFitnessLevel] = useState<string>(
    existingGoal?.fitnessLevel || 'beginner'
  );
  const [availableTime, setAvailableTime] = useState<number[]>(
    [existingGoal?.availableTime || 30]
  );
  const [daysPerWeek, setDaysPerWeek] = useState<number[]>(
    [existingGoal?.daysPerWeek || 5]
  );
  const [selectedExerciseTypes, setSelectedExerciseTypes] = useState<ExerciseType[]>(
    existingGoal?.preferredExerciseTypes || []
  );

  const handleExerciseTypeToggle = (type: ExerciseType) => {
    setSelectedExerciseTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const calculateBMI = (weight: number, height: number): number => {
    return weight / (height * height);
  };

  const handleSubmit = () => {
    if (!currentWeight || selectedExerciseTypes.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const weight = parseFloat(currentWeight);
    const heightInMeters = parseFloat(height);
    const currentBMI = calculateBMI(weight, heightInMeters);
    const targetBMI = goalType === 'weight_loss' || goalType === 'muscle_gain' 
      ? FitnessService.getTargetBMI(currentBMI, goalType)
      : currentBMI;

    const goal: UserFitnessGoal = {
      id: existingGoal?.id || `goal-${Date.now()}`,
      type: goalType as UserFitnessGoal['type'],
      currentWeight: weight,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      currentBMI,
      targetBMI,
      preferredExerciseTypes: selectedExerciseTypes,
      fitnessLevel: fitnessLevel as UserFitnessGoal['fitnessLevel'],
      availableTime: availableTime[0],
      daysPerWeek: daysPerWeek[0],
      createdAt: existingGoal?.createdAt || new Date(),
      updatedAt: new Date()
    };

    FitnessService.saveUserGoals(goal, userData.username);
    onGoalSet(goal);
  };

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const currentBMI = currentWeight && height 
    ? calculateBMI(parseFloat(currentWeight), parseFloat(height))
    : 0;
  const bmiCategory = getBMICategory(currentBMI);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          Fitness Goal Setup
        </CardTitle>
        <CardDescription>
          Set up your personalized fitness goals and preferences to get AI-powered workout recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Primary Fitness Goal</Label>
          <RadioGroup value={goalType} onValueChange={setGoalType}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="weight_loss" id="weight_loss" />
                <Label htmlFor="weight_loss" className="flex-1 cursor-pointer">
                  <div className="font-medium">Weight Loss</div>
                  <div className="text-sm text-gray-500">Lose weight and burn fat</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="muscle_gain" id="muscle_gain" />
                <Label htmlFor="muscle_gain" className="flex-1 cursor-pointer">
                  <div className="font-medium">Muscle Gain</div>
                  <div className="text-sm text-gray-500">Build muscle and strength</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="endurance" id="endurance" />
                <Label htmlFor="endurance" className="flex-1 cursor-pointer">
                  <div className="font-medium">Endurance</div>
                  <div className="text-sm text-gray-500">Improve cardiovascular fitness</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="strength" id="strength" />
                <Label htmlFor="strength" className="flex-1 cursor-pointer">
                  <div className="font-medium">Strength</div>
                  <div className="text-sm text-gray-500">Increase overall strength</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg md:col-span-2">
                <RadioGroupItem value="general_fitness" id="general_fitness" />
                <Label htmlFor="general_fitness" className="flex-1 cursor-pointer">
                  <div className="font-medium">General Fitness</div>
                  <div className="text-sm text-gray-500">Overall health and wellness</div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Physical Stats */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Physical Information</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg) *</Label>
              <Input
                id="currentWeight"
                type="number"
                placeholder="70"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (meters)</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                placeholder="1.70"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                placeholder="65"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
            </div>
          </div>
          
          {currentBMI > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">
                Current BMI: {currentBMI.toFixed(1)} - 
                <span className={`ml-1 ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Healthy BMI range: 18.5 - 24.9
              </div>
            </div>
          )}
        </div>

        {/* Fitness Level */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Current Fitness Level</Label>
          <RadioGroup value={fitnessLevel} onValueChange={setFitnessLevel}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner">Beginner - Just starting or returning to fitness</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate">Intermediate - Regular exercise 2-3 times per week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced">Advanced - Consistent training 4+ times per week</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Time Availability */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Time Availability</Label>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <Label>Available time per workout: {availableTime[0]} minutes</Label>
              </div>
              <Slider
                value={availableTime}
                onValueChange={setAvailableTime}
                max={120}
                min={15}
                step={15}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>15 min</span>
                <span>60 min</span>
                <span>120 min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Label>Workout days per week: {daysPerWeek[0]} days</Label>
              </div>
              <Slider
                value={daysPerWeek}
                onValueChange={setDaysPerWeek}
                max={7}
                min={2}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2 days</span>
                <span>4 days</span>
                <span>7 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Preferences */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Preferred Exercise Types * (Select at least one)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {exerciseTypeOptions.map(({ type, label, icon }) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedExerciseTypes.includes(type)}
                  onCheckedChange={() => handleExerciseTypeToggle(type)}
                />
                <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                  {icon}
                  <span className="text-sm">{label}</span>
                </Label>
              </div>
            ))}
          </div>
          {selectedExerciseTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedExerciseTypes.map(type => (
                <Badge key={type} variant="secondary">
                  {exerciseTypeOptions.find(opt => opt.type === type)?.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!currentWeight || selectedExerciseTypes.length === 0}
          >
            {existingGoal ? 'Update Goals' : 'Set Fitness Goals'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};