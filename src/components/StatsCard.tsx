import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "primary" | "success";
}

export const StatsCard = ({ icon: Icon, label, value, subtitle, variant = "default" }: StatsCardProps) => {
  const variantClasses = {
    default: "bg-card",
    primary: "bg-gradient-primary text-primary-foreground",
    success: "bg-gradient-success text-success-foreground",
  };

  const variantAnimation = {
    default: "",
    primary: "animate-glow",
    success: "animate-pulse-success",
  };

  return (
    <Card className={`${variantClasses[variant]} ${variantAnimation[variant]} shadow-card p-6 transition-all hover:scale-105 hover:shadow-xl cursor-pointer group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${variant === "default" ? "text-muted-foreground" : "opacity-90"}`}>
            {label}
          </p>
          <p className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform inline-block">{value}</p>
          {subtitle && (
            <p className={`text-xs ${variant === "default" ? "text-muted-foreground" : "opacity-75"}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20"} group-hover:animate-bounce-subtle`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
