import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Edit, Eye, Calendar, TrendingUp, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApprovalsScreenProps {
  onBack: () => void;
}

interface ApprovalItem {
  id: string;
  type: "script" | "video" | "post";
  title: string;
  platform: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  content?: string;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export function ApprovalsScreen({ onBack }: ApprovalsScreenProps) {
  const [selectedTab, setSelectedTab] = useState("pending");

  const mockApprovals: ApprovalItem[] = [
    {
      id: "1",
      type: "script",
      title: "Morning Motivation Quote - Instagram Story",
      platform: "Instagram",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      content: "Start your day with intention. Every small step counts toward your bigger dreams. ✨ #MondayMotivation #Inspiration #Goals"
    },
    {
      id: "2",
      type: "video",
      title: "Product Demo - TikTok",
      platform: "TikTok",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      content: "15-second product demo with trending audio and effects"
    },
    {
      id: "3",
      type: "post",
      title: "Weekend Recap Post",
      platform: "Twitter",
      status: "approved",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      content: "Amazing weekend at the tech conference! Key takeaways: 1) AI is transforming everything 2) Community matters most 3) Keep learning 🚀",
      engagement: { likes: 156, shares: 23, comments: 12 }
    }
  ];

  const filteredApprovals = mockApprovals.filter(item => 
    selectedTab === "all" || item.status === selectedTab
  );

  const handleApproval = (id: string, approved: boolean) => {
    console.log(`${approved ? 'Approved' : 'Rejected'} item:`, id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "script": return <Edit className="w-4 h-4" />;
      case "video": return <Eye className="w-4 h-4" />;
      case "post": return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "approved": return "bg-green-500/20 text-green-500";
      case "rejected": return "bg-red-500/20 text-red-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  const pendingCount = mockApprovals.filter(item => item.status === "pending").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel border-b border-border/30 p-6">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold">Approval Workbench</h1>
              <p className="text-muted-foreground">Review and approve content before publishing</p>
            </div>
          </div>
          
          {pendingCount > 0 && (
            <Badge className="bg-accent text-accent-foreground">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {filteredApprovals.map((item) => (
                <Card key={item.id} className="glass-panel border-border/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{item.platform}</Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                Math.floor((item.createdAt.getTime() - Date.now()) / (1000 * 60)), 'minute'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.status === "pending" && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproval(item.id, false)}
                            className="border-destructive/20 text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproval(item.id, true)}
                            className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{item.content}</p>
                      
                      {item.engagement && (
                        <div className="flex items-center space-x-6 pt-4 border-t border-border/30">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-sm">
                              {item.engagement.likes} likes, {item.engagement.shares} shares, {item.engagement.comments} comments
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredApprovals.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No items to review</h3>
                  <p className="text-muted-foreground">
                    {selectedTab === "pending" 
                      ? "All caught up! No pending approvals."
                      : `No ${selectedTab} items found.`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}