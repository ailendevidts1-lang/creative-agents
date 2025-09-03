import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSkills, Timer } from '@/hooks/useSkills';

export function TimerSkill() {
  const { timers, createTimer, pauseTimer, resumeTimer, cancelTimer } = useSkills();
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerDuration, setNewTimerDuration] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = (timer: Timer) => {
    if (timer.status !== 'active') return timer.remaining;
    
    const now = Date.now();
    const expiresAt = new Date(timer.expires_at).getTime();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  };

  const handleCreateTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimerName.trim() || !newTimerDuration) return;

    const duration = parseInt(newTimerDuration) * 60; // Convert minutes to seconds
    await createTimer(newTimerName.trim(), duration);
    
    setNewTimerName('');
    setNewTimerDuration('');
    setShowCreateForm(false);
  };

  const activeTimers = timers.filter(t => t.status === 'active' || t.status === 'paused');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Timers</h3>
            <p className="text-muted-foreground text-sm">Set and manage timers</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="outline"
          size="sm"
          className="glass-panel"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Timer
        </Button>
      </div>

      {showCreateForm && (
        <Card className="glass-panel p-6">
          <form onSubmit={handleCreateTimer} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Timer Name</label>
              <Input
                value={newTimerName}
                onChange={(e) => setNewTimerName(e.target.value)}
                placeholder="e.g., Pomodoro, Tea timer..."
                className="glass-panel mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
              <Input
                type="number"
                value={newTimerDuration}
                onChange={(e) => setNewTimerDuration(e.target.value)}
                placeholder="25"
                min="1"
                max="480"
                className="glass-panel mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Create Timer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {activeTimers.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active timers</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a timer to get started
            </p>
          </div>
        ) : (
          activeTimers.map((timer) => (
            <TimerCard 
              key={timer.id} 
              timer={timer} 
              remainingTime={getRemainingTime(timer)}
              onPause={() => pauseTimer(timer.id)}
              onResume={() => resumeTimer(timer.id)}
              onCancel={() => cancelTimer(timer.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TimerCardProps {
  timer: Timer;
  remainingTime: number;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function TimerCard({ timer, remainingTime, onPause, onResume, onCancel }: TimerCardProps) {
  const [currentTime, setCurrentTime] = useState(remainingTime);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (timer.status !== 'active') {
      setCurrentTime(remainingTime);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor(
        (new Date(timer.expires_at).getTime() - Date.now()) / 1000
      ));
      setCurrentTime(remaining);
      
      if (remaining === 0) {
        // Timer completed - could trigger notification here
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, remainingTime]);

  const progress = timer.duration > 0 ? ((timer.duration - currentTime) / timer.duration) * 100 : 0;
  const isExpired = currentTime === 0 && timer.status === 'active';

  return (
    <Card className={`glass-panel p-4 ${isExpired ? 'border-destructive/50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{timer.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-2xl font-mono ${isExpired ? 'text-destructive' : 'text-primary'}`}>
              {formatTime(currentTime)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatTime(timer.duration)}
            </span>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                isExpired ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {timer.status === 'active' && !isExpired && (
            <Button
              onClick={onPause}
              variant="outline"
              size="sm"
              className="glass-panel"
            >
              <Pause className="w-4 h-4" />
            </Button>
          )}
          
          {timer.status === 'paused' && (
            <Button
              onClick={onResume}
              variant="outline"
              size="sm"
              className="glass-panel"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="glass-panel hover:border-destructive/50"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {isExpired && (
        <div className="mt-3 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive font-medium">Timer completed! 🎉</p>
        </div>
      )}
    </Card>
  );
}