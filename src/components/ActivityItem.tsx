import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  type: 'completion' | 'revenue' | 'review' | 'update';
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
  agentName?: string;
  status?: 'success' | 'warning' | 'error';
}

export const ActivityItem = ({ 
  type, 
  title, 
  description, 
  timestamp, 
  amount, 
  agentName,
  status = 'success'
}: ActivityItemProps) => {
  const getTypeColor = () => {
    switch (type) {
      case 'completion': return 'bg-success/10 text-success border-success/20';
      case 'revenue': return 'bg-accent/10 text-accent border-accent/20';
      case 'review': return 'bg-primary/10 text-primary border-primary/20';
      case 'update': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'completion': return '✓';
      case 'revenue': return '$';
      case 'review': return '⭐';
      case 'update': return '📢';
      default: return '•';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-card/70 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getTypeColor()}`}>
        {getTypeIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground text-sm truncate">{title}</h4>
          {amount && (
            <Badge variant="secondary" className="text-xs">
              +${amount}
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
          {agentName && (
            <>
              <span>•</span>
              <span className="font-medium">{agentName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};