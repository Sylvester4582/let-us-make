import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Star } from 'lucide-react';

interface PresentAnimationProps {
  points: number;
  onComplete: () => void;
  show: boolean;
}

export const PresentAnimation: React.FC<PresentAnimationProps> = ({ 
  points, 
  onComplete, 
  show 
}) => {
  const [stage, setStage] = useState<'closed' | 'opening' | 'opened' | 'complete'>('closed');

  useEffect(() => {
    if (show) {
      setStage('closed');
      
      // Animation sequence - present opens after 5 seconds
      const timer1 = setTimeout(() => setStage('opening'), 5000); // Wait 5 seconds before opening
      const timer2 = setTimeout(() => setStage('opened'), 6000);  // Open 1 second after opening starts
      const timer3 = setTimeout(() => {
        setStage('complete');
        onComplete();
      }, 9000); // Complete after 3 more seconds

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="relative">
        {/* Sparkles background */}
        <div className="absolute inset-0 -m-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Present Box */}
        <div className={`relative bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-lg shadow-2xl transition-all duration-1000 ${
          stage === 'opening' ? 'animate-pulse scale-110' : ''
        }`}>
          
          {/* Present Bow */}
          <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 transition-all duration-800 ${
            stage === 'opening' ? '-translate-y-12 opacity-50' : ''
          } ${stage === 'opened' ? 'opacity-0' : ''}`}>
            <div className="w-16 h-8 bg-yellow-400 rounded-full relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-full transform scale-90"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-6 bg-yellow-300 rounded-full"></div>
            </div>
          </div>

          {/* Present Ribbons */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-600 ${
            stage === 'opening' || stage === 'opened' ? 'scale-y-0 opacity-0' : ''
          }`}>
            <div className="w-full h-4 bg-yellow-400 absolute top-1/2 transform -translate-y-1/2"></div>
            <div className="h-full w-4 bg-yellow-400 absolute left-1/2 transform -translate-x-1/2"></div>
          </div>

          {/* Present Content */}
          <div className={`flex flex-col items-center justify-center p-8 transition-all duration-800 ${
            stage === 'opened' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 translate-y-5'
          }`}>
            <div className="animate-spin-slow">
              <Star className="w-16 h-16 text-yellow-300 mb-4 animate-pulse" />
            </div>
            
            <div className={`text-center transition-all duration-500 ${
              stage === 'opened' ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}>
              <h3 className="text-2xl font-bold text-white mb-2">🎉 Challenge Completed! 🎉</h3>
              <div className="text-4xl font-bold text-yellow-300 animate-bounce mb-2">
                +{points} Points
              </div>
              <p className="text-white text-sm">Keep up the great work!</p>
            </div>
          </div>

          {/* Gift Icon (when closed) */}
          {stage === 'closed' && (
            <div className="flex items-center justify-center p-8 animate-bounce">
              <Gift className="w-20 h-20 text-white" />
            </div>
          )}
        </div>

        {/* Floating particles */}
        {stage === 'opened' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute top-1/2 left-1/2 animate-ping"
                style={{
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: '2s',
                }}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${
                    Math.random() > 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{
                    transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};