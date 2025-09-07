import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Upload, Play, Square, Download, Trash2, Settings, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceProfile {
  id: string;
  name: string;
  sampleDuration: number;
  quality: number;
  createdAt: Date;
  isActive: boolean;
}

export function VoiceCloningSkill() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([
    {
      id: '1',
      name: 'Default Voice',
      sampleDuration: 30,
      quality: 85,
      createdAt: new Date(),
      isActive: true,
    }
  ]);
  const [newProfileName, setNewProfileName] = useState('');
  const [testText, setTestText] = useState('Hello, this is a test of the voice cloning system.');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly for at least 10 seconds for best results.",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioBlob(file);
      toast({
        title: "Audio Uploaded",
        description: `Loaded ${file.name} for voice analysis.`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a valid audio file (MP3, WAV, M4A).",
        variant: "destructive",
      });
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob || !newProfileName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both audio sample and profile name.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate voice analysis process
    const steps = [
      { progress: 20, message: "Preprocessing audio..." },
      { progress: 40, message: "Extracting voice features..." },
      { progress: 60, message: "Analyzing pitch and timbre..." },
      { progress: 80, message: "Training voice model..." },
      { progress: 100, message: "Voice profile created!" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(step.progress);
      
      if (step.progress === 100) {
        const newProfile: VoiceProfile = {
          id: Date.now().toString(),
          name: newProfileName,
          sampleDuration: 15, // Simulated duration
          quality: Math.floor(Math.random() * 20) + 80, // 80-100% quality
          createdAt: new Date(),
          isActive: false,
        };
        
        setVoiceProfiles(prev => [...prev, newProfile]);
        setNewProfileName('');
        setAudioBlob(null);
        
        toast({
          title: "Voice Clone Complete",
          description: `${newProfile.name} has been added to your voice library.`,
        });
      }
    }

    setIsAnalyzing(false);
    setAnalysisProgress(0);
  };

  const setActiveVoice = (profileId: string) => {
    setVoiceProfiles(prev => prev.map(profile => ({
      ...profile,
      isActive: profile.id === profileId
    })));
    
    const profile = voiceProfiles.find(p => p.id === profileId);
    toast({
      title: "Voice Changed",
      description: `AI voice set to "${profile?.name}".`,
    });
  };

  const deleteProfile = (profileId: string) => {
    const profile = voiceProfiles.find(p => p.id === profileId);
    if (profile?.isActive) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the active voice profile.",
        variant: "destructive",
      });
      return;
    }
    
    setVoiceProfiles(prev => prev.filter(p => p.id !== profileId));
    toast({
      title: "Profile Deleted",
      description: `Voice profile "${profile?.name}" has been removed.`,
    });
  };

  const testVoice = (profileId: string) => {
    const profile = voiceProfiles.find(p => p.id === profileId);
    toast({
      title: "Testing Voice",
      description: `Playing test audio with "${profile?.name}" voice...`,
    });
    
    // In a real implementation, this would use TTS with the cloned voice
    // For now, we'll just show the toast
  };

  const exportProfile = (profileId: string) => {
    const profile = voiceProfiles.find(p => p.id === profileId);
    toast({
      title: "Exporting Voice",
      description: `Preparing ${profile?.name} for download...`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Analysis & Mimicry
          </CardTitle>
          <CardDescription>
            Clone voices with high fidelity and manage multiple voice profiles for your AI assistant.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Voice</TabsTrigger>
          <TabsTrigger value="library">Voice Library</TabsTrigger>
          <TabsTrigger value="test">Test & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Voice Profile</CardTitle>
              <CardDescription>
                Record or upload audio samples to create a new voice clone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Profile Name</Label>
                <Input
                  id="profileName"
                  placeholder="Enter a name for this voice profile..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Record Audio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className="w-full"
                    >
                      {isRecording ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    {isRecording && (
                      <div className="text-center text-sm text-muted-foreground">
                        Recording... Speak clearly for best results
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upload Audio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Audio File
                    </Button>
                    <div className="text-xs text-muted-foreground text-center">
                      Supports MP3, WAV, M4A formats
                    </div>
                  </CardContent>
                </Card>
              </div>

              {audioBlob && (
                <Alert>
                  <AlertDescription>
                    Audio sample ready for analysis. Click "Analyze Voice" to create the profile.
                  </AlertDescription>
                </Alert>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} />
                  <div className="text-sm text-center text-muted-foreground">
                    Analyzing voice characteristics... {analysisProgress}%
                  </div>
                </div>
              )}

              <Button
                onClick={analyzeVoice}
                disabled={!audioBlob || !newProfileName.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Voice"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="grid gap-4">
            {voiceProfiles.map((profile) => (
              <Card key={profile.id} className={profile.isActive ? "ring-2 ring-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{profile.name}</h3>
                        {profile.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quality: {profile.quality}% • Duration: {profile.sampleDuration}s
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {profile.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!profile.isActive && (
                        <Button
                          size="sm"
                          onClick={() => setActiveVoice(profile.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testVoice(profile.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      {profile.id !== '1' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteProfile(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Voice Output</CardTitle>
              <CardDescription>
                Test your voice profiles and export them for use in other applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testText">Test Text</Label>
                <textarea
                  id="testText"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter text to test with your voice profiles..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                {voiceProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 justify-start"
                      onClick={() => testVoice(profile.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test with {profile.name}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => exportProfile(profile.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}