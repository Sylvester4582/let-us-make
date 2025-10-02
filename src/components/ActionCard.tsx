import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  points: number;
  onClick: () => void;
  color?: string;
}

export const ActionCard = ({ icon: Icon, title, description, points, onClick, color = "primary" }: ActionCardProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-primary/50 relative overflow-hidden" onClick={onClick}>
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className={`p-4 rounded-xl bg-${color}/10 text-${color} group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 group-hover:animate-wiggle`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-bold animate-pulse group-hover:animate-bounce-subtle">
                +{points} points
              </div>
            </div>
            <Button size="sm" className="gap-2 group-hover:bg-primary group-hover:scale-110 transition-all">
              <Plus className="w-4 h-4" />
              Log Activity
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
