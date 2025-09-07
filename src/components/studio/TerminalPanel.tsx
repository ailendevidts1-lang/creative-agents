import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Bug, Play, AlertCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: 'build' | 'test' | 'ai' | 'system';
}

export function TerminalPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '14:32:15',
      level: 'info',
      message: 'Starting development server...',
      source: 'build'
    },
    {
      id: '2',
      timestamp: '14:32:16',
      level: 'info',
      message: 'Server running on http://localhost:3000',
      source: 'build'
    },
    {
      id: '3',
      timestamp: '14:32:45',
      level: 'warning',
      message: 'Missing dependency @types/react',
      source: 'build'
    }
  ]);

  const [problems] = useState([
    {
      id: '1',
      file: 'src/components/App.tsx',
      line: 15,
      message: 'Unused variable "data"',
      severity: 'warning'
    },
    {
      id: '2',
      file: 'src/utils/helpers.ts',
      line: 23,
      message: 'Property "id" does not exist on type',
      severity: 'error'
    }
  ]);

  const [aiJobs] = useState([
    {
      id: '1',
      title: 'Generate user authentication',
      status: 'completed',
      timestamp: '14:30:12'
    },
    {
      id: '2',
      title: 'Create API endpoints',
      status: 'running',
      timestamp: '14:32:45'
    }
  ]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-orange-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'error' ? (
      <AlertCircle className="h-3 w-3 text-red-500" />
    ) : (
      <AlertCircle className="h-3 w-3 text-orange-500" />
    );
  };

  return (
    <div className="h-full border-t">
      <Tabs defaultValue="terminal" className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="problems">Problems ({problems.length})</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="ai-jobs">AI Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="h-full p-0">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="text-sm font-medium">Terminal</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearLogs}>
                Clear
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              <div className="font-mono text-xs space-y-1">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-muted-foreground">{log.timestamp}</span>
                    <span className={getLevelColor(log.level)}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="problems" className="h-full p-0">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b">
              <Bug className="h-4 w-4" />
              <span className="text-sm font-medium">Problems</span>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {problems.map(problem => (
                  <div key={problem.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                    {getSeverityIcon(problem.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{problem.message}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {problem.file}:{problem.line}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="output" className="h-full p-0">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b">
              <Play className="h-4 w-4" />
              <span className="text-sm font-medium">Build Output</span>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              <div className="font-mono text-xs text-muted-foreground">
                <div>Building for production...</div>
                <div>✓ Compiled successfully</div>
                <div>Bundle size: 245.8 KB</div>
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="ai-jobs" className="h-full p-0">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b">
              <Terminal className="h-4 w-4" />
              <span className="text-sm font-medium">AI Jobs</span>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {aiJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div>
                      <div className="text-sm">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.timestamp}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      job.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}