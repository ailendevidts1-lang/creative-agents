import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Code, 
  Cpu, 
  Bot, 
  Globe, 
  Smartphone, 
  Wrench, 
  Shield,
  CheckCircle,
  Zap
} from 'lucide-react';

interface SystemShowcaseProps {
  onNavigateToGenerate?: () => void;
}

const SystemShowcase: React.FC<SystemShowcaseProps> = ({ onNavigateToGenerate }) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const capabilities = [
    {
      id: 'full-stack',
      icon: Globe,
      title: 'Full-Stack Web Applications',
      description: 'Complete React/Next.js apps with backend APIs, databases, and deployment',
      example: 'E-commerce platform with Stripe payments, user authentication, and admin dashboard',
      tech: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel']
    },
    {
      id: 'mobile',
      icon: Smartphone,
      title: 'Cross-Platform Mobile Apps',
      description: 'Native iOS and Android apps using React Native or Flutter',
      example: 'Social media app with real-time messaging, photo sharing, and push notifications',
      tech: ['React Native', 'Expo', 'Firebase', 'App Store', 'Google Play']
    },
    {
      id: 'ai-assistant',
      icon: Bot,
      title: 'AI-Powered Assistants',
      description: 'Voice and text AI assistants with tool integration and memory',
      example: 'Personal assistant that manages calendar, emails, and smart home devices',
      tech: ['OpenAI GPT-5', 'Whisper', 'Text-to-Speech', 'Vector DB', 'Python']
    },
    {
      id: 'automation',
      icon: Wrench,
      title: 'Automation & Trading Systems',
      description: 'Intelligent automation tools and algorithmic trading systems',
      example: 'Crypto arbitrage bot monitoring multiple exchanges with risk management',
      tech: ['Node.js', 'Python', 'Redis', 'Docker', 'Kubernetes']
    },
    {
      id: 'os',
      icon: Cpu,
      title: 'Custom Operating Systems',
      description: 'Lightweight Linux distributions and embedded systems',
      example: 'Raspberry Pi OS for digital signage with kiosk mode and remote management',
      tech: ['Linux Kernel', 'C', 'Shell Scripts', 'Buildroot', 'ISO Image']
    },
    {
      id: 'enterprise',
      icon: Shield,
      title: 'Enterprise Solutions',
      description: 'Scalable enterprise applications with microservices architecture',
      example: 'HR management system with SSO, audit logs, and compliance reporting',
      tech: ['Microservices', 'Kubernetes', 'PostgreSQL', 'Redis', 'OAuth']
    }
  ];

  const pipeline = [
    { name: 'Requirements Analysis', status: 'completed' },
    { name: 'Architecture Planning', status: 'completed' },
    { name: 'Tech Stack Selection', status: 'completed' },
    { name: 'AI Integration Setup', status: 'completed' },
    { name: 'Code Generation', status: 'running' },
    { name: 'QA & Testing', status: 'pending' },
    { name: 'Deployment', status: 'pending' },
    { name: 'Monitoring', status: 'pending' }
  ];

  const stats = {
    projectsGenerated: 1247,
    linesOfCode: 2840000,
    deploymentsCompleted: 892,
    aiModelsIntegrated: 15
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Development System Capabilities
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          From simple websites to complex operating systems - our AI agents can build anything you can imagine.
        </p>
      </div>

      {/* Live Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.projectsGenerated.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Projects Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{(stats.linesOfCode / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-muted-foreground">Lines of Code</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.deploymentsCompleted}</div>
              <div className="text-sm text-muted-foreground">Deployments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.aiModelsIntegrated}</div>
              <div className="text-sm text-muted-foreground">AI Models</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((capability) => (
          <Card 
            key={capability.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeDemo === capability.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === capability.id ? null : capability.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <capability.icon className="h-6 w-6 text-primary" />
                {capability.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{capability.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <strong>Example:</strong> {capability.example}
              </div>
              <div className="flex flex-wrap gap-1">
                {capability.tech.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              {activeDemo === capability.id && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Live Generation Demo</div>
                  <Progress value={75} className="h-2 mb-2" />
                  <div className="text-xs text-muted-foreground">
                    Generating {capability.title.toLowerCase()}...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Generation Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipeline.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : step.status === 'running' ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className={`flex-1 ${
                  step.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                  step.status === 'running' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.name}
                </span>
                <Badge variant={
                  step.status === 'completed' ? 'default' :
                  step.status === 'running' ? 'secondary' : 'outline'
                }>
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button size="lg" className="px-8" onClick={onNavigateToGenerate}>
          <Rocket className="h-5 w-5 mr-2" />
          Try the System
        </Button>
        <Button size="lg" variant="outline" className="px-8">
          <Code className="h-5 w-5 mr-2" />
          View Code Examples
        </Button>
      </div>
    </div>
  );
};

export default SystemShowcase;