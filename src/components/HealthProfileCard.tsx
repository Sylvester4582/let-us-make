import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useUser } from '@/contexts/UserContext';
import { User, Scale, Ruler, Calendar, Save, Edit3 } from 'lucide-react';

export const HealthProfileCard: React.FC = () => {
  const { userData, updateHealthProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: userData.healthProfile.age || '',
    height: userData.healthProfile.height || '',
    weight: userData.healthProfile.weight || '',
    gender: userData.healthProfile.gender || 'other'
  });

  const handleSave = async () => {
    const healthData = {
      age: formData.age ? parseInt(formData.age.toString()) : undefined,
      height: formData.height ? parseInt(formData.height.toString()) : undefined,
      weight: formData.weight ? parseInt(formData.weight.toString()) : undefined,
      gender: formData.gender as 'male' | 'female' | 'other'
    };

    await updateHealthProfile(healthData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      age: userData.healthProfile.age || '',
      height: userData.healthProfile.height || '',
      weight: userData.healthProfile.weight || '',
      gender: userData.healthProfile.gender || 'other'
    });
    setIsEditing(false);
  };

  const calculateBMI = () => {
    if (userData.healthProfile.height && userData.healthProfile.weight) {
      const heightM = userData.healthProfile.height / 100;
      const bmi = userData.healthProfile.weight / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Obese', color: 'bg-red-100 text-red-800' };
  };

  const isProfileComplete = userData.healthProfile.age && userData.healthProfile.height && userData.healthProfile.weight;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Health Profile
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isProfileComplete && !isEditing && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Complete your health profile to get personalized risk assessments and insurance recommendations!
            </p>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    min="18"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-500" />
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    min="120"
                    max="250"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-gray-500" />
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    min="30"
                    max="300"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Age</span>
                </div>
                <p className="text-lg font-bold">
                  {userData.healthProfile.age || 'Not set'}
                  {userData.healthProfile.age && ' years'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Gender</span>
                </div>
                <p className="text-lg font-bold capitalize">
                  {userData.healthProfile.gender === 'other' ? 'Not specified' : userData.healthProfile.gender || 'Not set'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Height</span>
                </div>
                <p className="text-lg font-bold">
                  {userData.healthProfile.height || 'Not set'}
                  {userData.healthProfile.height && ' cm'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Weight</span>
                </div>
                <p className="text-lg font-bold">
                  {userData.healthProfile.weight || 'Not set'}
                  {userData.healthProfile.weight && ' kg'}
                </p>
              </div>
            </div>

            {calculateBMI() && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-800">BMI</span>
                    <p className="text-lg font-bold text-blue-900">{calculateBMI()}</p>
                  </div>
                  <Badge className={getBMIStatus(parseFloat(calculateBMI()!)).color}>
                    {getBMIStatus(parseFloat(calculateBMI()!)).label}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};