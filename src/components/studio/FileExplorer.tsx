import React, { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface FileExplorerProps {
  files: ProjectFile[];
  onFileOpen: (file: ProjectFile) => void;
}

export function FileExplorer({ files, onFileOpen }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFile = (file: ProjectFile, depth = 0) => {
    const isExpanded = expandedFolders.has(file.path);
    const Icon = file.type === 'folder' ? Folder : File;
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div key={file.id}>
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-2 font-normal"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (file.type === 'folder') {
              toggleFolder(file.path);
            } else {
              onFileOpen(file);
            }
          }}
        >
          {file.type === 'folder' && (
            <ChevronIcon className="h-4 w-4 mr-1" />
          )}
          <Icon className="h-4 w-4 mr-2" />
          <span className="truncate">{file.name}</span>
        </Button>
        
        {file.type === 'folder' && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto border-r">
      <div className="p-2">
        <h3 className="font-medium text-sm mb-2">Explorer</h3>
        <div>
          {files.map(file => renderFile(file))}
        </div>
      </div>
    </div>
  );
}