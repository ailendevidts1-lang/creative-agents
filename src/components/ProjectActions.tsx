import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Code } from 'lucide-react';

interface ProjectActionsProps {
  projectId: string;
  hasGeneratedCode?: boolean;
  onEdit?: () => void;
  onViewCode?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ProjectActions({ 
  projectId, 
  hasGeneratedCode, 
  onEdit, 
  onViewCode,
  size = 'md' 
}: ProjectActionsProps) {
  const handleEditInStudio = () => {
    if (onEdit) {
      onEdit();
    } else {
      window.location.href = `/studio/${projectId}`;
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleEditInStudio}
        variant="outline"
        size={buttonSize}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Edit in Studio
      </Button>
      
      {hasGeneratedCode && (
        <>
          <Badge variant="secondary" className="ml-2">
            Code Ready
          </Badge>
          {onViewCode && (
            <Button
              onClick={onViewCode}
              variant="ghost"
              size={buttonSize}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              View Code
            </Button>
          )}
        </>
      )}
    </div>
  );
}