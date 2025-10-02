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
    <Card className="p-6 shadow-card hover:shadow-lg transition-all group cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                +{points} points
              </div>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Log Activity
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
