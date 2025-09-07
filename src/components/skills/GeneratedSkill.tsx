import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Code, Trash2 } from 'lucide-react';

interface GeneratedSkillProps {
  skill: {
    id: string;
    name: string;
    description: string;
    component_code: string;
    created_at: string;
  };
  onDelete?: (skillId: string) => void;
}

export function GeneratedSkill({ skill, onDelete }: GeneratedSkillProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      // Simulate skill functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${skill.name} executed successfully!`);
    } catch (error) {
      toast.error('Failed to execute skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      onDelete?.(skill.id);
      toast.success('Generated skill deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-semibold">{skill.name}</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          </div>
          <p className="text-muted-foreground">{skill.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generated on {new Date(skill.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            <Code className="w-4 h-4 mr-2" />
            {showCode ? 'Hide Code' : 'View Code'}
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {showCode && (
        <Card className="glass-panel p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Generated Component Code
          </h3>
          <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto">
            <code>{skill.component_code}</code>
          </pre>
        </Card>
      )}

      <Card className="glass-panel p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-medium mb-2">AI-Generated Skill</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This skill was automatically generated and is ready to use.
            </p>
          </div>
          <Button 
            onClick={handleAction}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : `Use ${skill.name}`}
          </Button>
        </div>
      </Card>
    </div>
  );
}