import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, TrendingUp, Users } from "lucide-react";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  runs: number;
  price: number;
  avatar: string;
  isPopular?: boolean;
  onClick?: () => void;
}

export const AgentCard = ({ 
  name, 
  description, 
  category, 
  rating, 
  runs, 
  price, 
  avatar, 
  isPopular = false,
  onClick 
}: AgentCardProps) => {
  return (
    <div className="agent-card group cursor-pointer" onClick={onClick}>
      {isPopular && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-accent text-accent-foreground shadow-lg">
            <TrendingUp className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
          {avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-3 h-3 fill-warning text-warning" />
              <span>{rating}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{runs.toLocaleString()} runs</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                ${price}
              </span>
              <Button size="sm" className="btn-warm opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};