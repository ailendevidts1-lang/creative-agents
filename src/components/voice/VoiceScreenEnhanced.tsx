import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { VoiceAssistantInterface } from '@/components/VoiceAssistantInterface';

interface VoiceScreenEnhancedProps {
  appState: any;
  updateAppState: (updates: any) => void;
}

export function VoiceScreenEnhanced({ appState, updateAppState }: VoiceScreenEnhancedProps) {
  const [mode, setMode] = React.useState<'classic' | 'realtime'>('realtime');

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Voice Assistant</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setMode('classic')}
              variant={mode === 'classic' ? 'default' : 'outline'}
              size="sm"
            >
              Classic
            </Button>
            <Button
              onClick={() => setMode('realtime')}
              variant={mode === 'realtime' ? 'default' : 'outline'}
              size="sm"
            >
              Realtime AI
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {mode === 'realtime' ? (
          <VoiceAssistantInterface />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
            
            {/* Main Voice Interface */}
            <div className="flex flex-col items-center space-y-8 z-10">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
                  appState.voiceState === 'listening' 
                    ? 'border-green-500 bg-green-500/20 animate-pulse' 
                    : appState.voiceState === 'thinking'
                    ? 'border-blue-500 bg-blue-500/20 animate-spin'
                    : appState.voiceState === 'speaking'
                    ? 'border-purple-500 bg-purple-500/20 animate-bounce'
                    : 'border-muted bg-muted/10'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {appState.micMuted ? (
                      <MicOff className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <Mic className="w-12 h-12 text-primary" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">
                  {appState.voiceState === 'listening' && 'Listening...'}
                  {appState.voiceState === 'thinking' && 'Thinking...'}
                  {appState.voiceState === 'speaking' && 'Speaking...'}
                  {appState.voiceState === 'idle' && 'Ready'}
                </h3>
                
                <div className="flex items-center justify-center space-x-2">
                  {appState.wakeEnabled && (
                    <Badge variant="secondary">
                      Wake Word Enabled
                    </Badge>
                  )}
                  {appState.micMuted && (
                    <Badge variant="destructive">
                      Microphone Muted
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => updateAppState({ micMuted: !appState.micMuted })}
                  variant={appState.micMuted ? 'destructive' : 'outline'}
                  size="sm"
                >
                  {appState.micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={() => updateAppState({ wakeEnabled: !appState.wakeEnabled })}
                  variant={appState.wakeEnabled ? 'default' : 'outline'}
                  size="sm"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}