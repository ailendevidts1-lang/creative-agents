import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Bot, GitBranch } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";
import { Link } from "react-router-dom";

interface WelcomeBannerProps {
  userName: string;
  onboardingProgress?: {
    completed: number;
    total: number;
  };
}

export const WelcomeBanner = ({ 
  userName, 
  onboardingProgress 
}: WelcomeBannerProps) => {
  return (
    <div className="card-premium relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-muted-foreground max-w-md">
              Ready to deploy intelligent agents and earn from the decentralized AI economy?
            </p>
          </div>
          
          {onboardingProgress && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Onboarding Progress</span>
                <span className="font-medium">
                  {onboardingProgress.completed}/{onboardingProgress.total} completed
                </span>
              </div>
              <Progress 
                value={(onboardingProgress.completed / onboardingProgress.total) * 100} 
                className="w-48 h-2"
              />
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Button className="btn-premium" asChild>
              <Link to="/builder">
                <Plus className="w-4 h-4 mr-2" />
                Create New Agent
              </Link>
            </Button>
            
            <Button variant="outline" className="btn-glass" asChild>
              <Link to="/marketplace">
                <Search className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Link>
            </Button>
            
            <Button variant="outline" className="btn-glass" asChild>
              <Link to="/workflows">
                <GitBranch className="w-4 h-4 mr-2" />
                Build Workflow
              </Link>
            </Button>
            
            <Button variant="outline" className="btn-glass" asChild>
              <Link to="/my-agents">
                <Bot className="w-4 h-4 mr-2" />
                View My Agents
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="hidden lg:block">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-border/30 flex items-center justify-center animate-float">
            <Bot className="w-16 h-16 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};