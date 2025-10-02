import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

interface PointsAnimationProps {
  points: number;
  show: boolean;
}

export const PointsAnimation = ({ points, show }: PointsAnimationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="animate-slide-up">
        <div className="bg-success text-success-foreground px-8 py-4 rounded-2xl shadow-success flex items-center gap-3 animate-scale-in">
          <Coins className="w-8 h-8 animate-coin-flip" />
          <span className="text-3xl font-bold">+{points}</span>
        </div>
      </div>
    </div>
  );
};
