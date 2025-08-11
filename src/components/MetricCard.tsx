import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className = ""
}: MetricCardProps) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        
        {trend && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );
};