import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { DailyChallengesPage } from './DailyChallengesPage';

export const ChallengesDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in to view challenges</h2>
          <p className="text-gray-600">You need to be logged in to access daily challenges.</p>
        </div>
      </div>
    );
  }

  return <DailyChallengesPage userId={user.email} />;
};