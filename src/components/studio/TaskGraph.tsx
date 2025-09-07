import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, AlertCircle, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  batch_number: number;
  status: string;
  acceptance_criteria: string;
  target_files: string[];
}

interface TaskGraphProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}

export function TaskGraph({ tasks, onTaskSelect }: TaskGraphProps) {
  // Group tasks by batch number
  const batches = tasks.reduce((acc, task) => {
    const batchNum = task.batch_number;
    if (!acc[batchNum]) acc[batchNum] = [];
    acc[batchNum].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No tasks to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-medium">Task Graph</h3>
        <Badge variant="outline">{tasks.length} tasks</Badge>
      </div>
      
      <div className="space-y-4">
        {Object.entries(batches)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([batchNum, batchTasks], batchIndex) => (
            <div key={batchNum} className="relative">
              {/* Batch Header */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">Batch {batchNum}</Badge>
                <div className="h-px bg-border flex-1" />
              </div>

              {/* Tasks in Batch */}
              <div className="space-y-2">
                {batchTasks.map((task, taskIndex) => (
                  <Card
                    key={task.id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${getStatusColor(task.status)}`}
                    onClick={() => onTaskSelect?.(task)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="truncate">{task.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {task.acceptance_criteria}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{task.target_files.length} files</span>
                        {task.target_files.length > 0 && (
                          <span>• {task.target_files[0]}{task.target_files.length > 1 ? ` +${task.target_files.length - 1} more` : ''}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Arrow to next batch */}
              {batchIndex < Object.keys(batches).length - 1 && (
                <div className="flex justify-center my-3">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}