import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCommit, GitBranch, Plus, Minus, FileText } from 'lucide-react';

interface GitChange {
  id: string;
  path: string;
  type: 'added' | 'modified' | 'deleted';
  staged: boolean;
}

export function GitPanel() {
  const [commitMessage, setCommitMessage] = useState('');
  const [changes, setChanges] = useState<GitChange[]>([
    {
      id: '1',
      path: 'src/components/App.tsx',
      type: 'modified',
      staged: false
    },
    {
      id: '2',
      path: 'src/components/NewFeature.tsx',
      type: 'added',
      staged: false
    },
    {
      id: '3',
      path: 'package.json',
      type: 'modified',
      staged: true
    }
  ]);

  const stageChange = (changeId: string) => {
    setChanges(prev => 
      prev.map(change => 
        change.id === changeId 
          ? { ...change, staged: !change.staged }
          : change
      )
    );
  };

  const stageAll = () => {
    setChanges(prev => prev.map(change => ({ ...change, staged: true })));
  };

  const unstageAll = () => {
    setChanges(prev => prev.map(change => ({ ...change, staged: false })));
  };

  const commit = () => {
    if (!commitMessage.trim()) return;
    // Simulate commit
    setChanges([]);
    setCommitMessage('');
  };

  const getChangeIcon = (type: GitChange['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-3 w-3 text-green-500" />;
      case 'deleted':
        return <Minus className="h-3 w-3 text-red-500" />;
      case 'modified':
        return <FileText className="h-3 w-3 text-orange-500" />;
    }
  };

  const stagedChanges = changes.filter(c => c.staged);
  const unstagedChanges = changes.filter(c => !c.staged);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="font-medium text-sm">main</span>
          <Badge variant="outline" className="text-xs">
            origin/main
          </Badge>
        </div>

        {/* Changes */}
        <div className="space-y-3">
          {unstagedChanges.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  Changes ({unstagedChanges.length})
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={stageAll}
                    className="h-6 px-2 text-xs"
                  >
                    Stage All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {unstagedChanges.map(change => (
                    <div 
                      key={change.id}
                      className="flex items-center justify-between p-1 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => stageChange(change.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getChangeIcon(change.type)}
                        <span className="text-xs font-mono truncate">
                          {change.path}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stagedChanges.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  Staged Changes ({stagedChanges.length})
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={unstageAll}
                    className="h-6 px-2 text-xs"
                  >
                    Unstage All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 mb-3">
                  {stagedChanges.map(change => (
                    <div 
                      key={change.id}
                      className="flex items-center justify-between p-1 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => stageChange(change.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getChangeIcon(change.type)}
                        <span className="text-xs font-mono truncate">
                          {change.path}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Commit message..."
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="text-xs"
                  />
                  <Button 
                    onClick={commit}
                    disabled={!commitMessage.trim()}
                    size="sm"
                    className="w-full"
                  >
                    <GitCommit className="h-3 w-3 mr-2" />
                    Commit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {changes.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No changes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}