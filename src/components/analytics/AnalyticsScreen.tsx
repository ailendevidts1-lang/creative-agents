import React from "react";
import { ArrowLeft, TrendingUp, Users, Heart, Share2, Eye, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalyticsScreenProps {
  onBack: () => void;
}

export function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const kpis = [
    { label: "Total Reach", value: "2.4M", change: "+12.5%", icon: Eye, color: "text-blue-500" },
    { label: "Engagement Rate", value: "4.8%", change: "+0.8%", icon: Heart, color: "text-red-500" },
    { label: "Followers", value: "156.2K", change: "+2.1K", icon: Users, color: "text-green-500" },
    { label: "Viral Score", value: "87", change: "+5", icon: TrendingUp, color: "text-purple-500" },
  ];

  const platforms = [
    { name: "Instagram", posts: 24, engagement: "5.2%", reach: "1.2M", color: "bg-pink-500" },
    { name: "TikTok", posts: 18, engagement: "8.1%", reach: "890K", color: "bg-black" },
    { name: "Twitter", posts: 32, engagement: "3.4%", reach: "340K", color: "bg-blue-500" },
    { name: "YouTube", posts: 6, engagement: "6.7%", reach: "125K", color: "bg-red-500" },
  ];

  const topContent = [
    {
      id: "1",
      title: "Morning Routine Tips",
      platform: "TikTok",
      views: "234K",
      likes: "18.2K",
      shares: "2.1K",
      viralScore: 94
    },
    {
      id: "2", 
      title: "Tech Product Review",
      platform: "Instagram",
      views: "189K",
      likes: "12.4K",
      shares: "890",
      viralScore: 87
    },
    {
      id: "3",
      title: "Weekend Motivation",
      platform: "Twitter",
      views: "98K",
      likes: "5.2K",
      shares: "1.2K",
      viralScore: 76
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel border-b border-border/30 p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="metal-highlight rounded-xl hover:neon-glow luxury-transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track performance and viral content metrics</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* KPIs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card key={index} className="glass-panel border-border/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                        <Badge variant="outline" className="text-xs">
                          {kpi.change}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{kpi.value}</p>
                        <p className="text-sm text-muted-foreground">{kpi.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Platform Performance */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platforms.map((platform, index) => (
                <Card key={index} className="glass-panel border-border/30">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full ${platform.color}`} />
                      <h3 className="font-semibold">{platform.name}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Posts</span>
                        <span>{platform.posts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Engagement</span>
                        <span>{platform.engagement}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reach</span>
                        <span>{platform.reach}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Top Content */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Top Performing Content</h2>
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <Card key={content.id} className="glass-panel border-border/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{content.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{content.platform}</Badge>
                            <Badge className="bg-primary/20 text-primary">
                              Viral Score: {content.viralScore}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{content.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{content.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>{content.shares}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <Card className="glass-panel border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium">Optimal Posting Time</p>
                      <p className="text-sm text-muted-foreground">Post on Tuesday at 2:30 PM for maximum engagement</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <div>
                      <p className="font-medium">Content Suggestion</p>
                      <p className="text-sm text-muted-foreground">Morning routine content performs 40% better on your TikTok</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium">Trending Opportunity</p>
                      <p className="text-sm text-muted-foreground">#TechTips hashtag is trending - create content now</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}