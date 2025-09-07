import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, GitBranch, Download, Settings, Save } from 'lucide-react';
import { FileExplorer } from '@/components/studio/FileExplorer';
import { CodeEditor } from '@/components/studio/CodeEditor';
import { AISidecar } from '@/components/studio/AISidecar';
import { GitPanel } from '@/components/studio/GitPanel';
import { TerminalPanel } from '@/components/studio/TerminalPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { useToast } from '@/hooks/use-toast';

export function StudioPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('main');
  
  const {
    fileSystem,
    isLoading,
    openFile,
    closeTab,
    updateFileContent,
    saveFile,
    saveAllFiles,
    applyPatches,
    getCurrentFiles
  } = useProjectFiles(projectId);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    // Mock project data - in real implementation, fetch from API
    setProject({
      id: projectId,
      name: 'My AI Project',
      description: 'AI-generated project',
      type: 'web-app'
    });
  };

  const handleSaveAll = async () => {
    try {
      await saveAllFiles();
      toast({
        title: "Files Saved",
        description: "All modified files have been saved",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyPatches = (patches: any[]) => {
    try {
      applyPatches(patches);
      toast({
        title: "Patches Applied",
        description: `Applied ${patches.length} code changes`,
      });
    } catch (error) {
      toast({
        title: "Apply Failed",
        description: "Failed to apply patches. Please try again.",
        variant: "destructive",
      });
    }
  };

  const runProject = () => {
    setIsRunning(true);
    // Simulate build process
    setTimeout(() => setIsRunning(false), 3000);
  };

  const hasUnsavedChanges = fileSystem.openTabs.some(tab => tab.modified);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="font-semibold">{project?.name}</h1>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {currentBranch}
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save All {hasUnsavedChanges && `(${fileSystem.openTabs.filter(t => t.modified).length})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runProject}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <Tabs defaultValue="files" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="git">Git</TabsTrigger>
              </TabsList>
              <TabsContent value="files" className="h-full">
                <FileExplorer files={fileSystem.files} onFileOpen={openFile} />
              </TabsContent>
              <TabsContent value="git" className="h-full">
                <GitPanel />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70} minSize={40}>
                <CodeEditor
                  tabs={fileSystem.openTabs}
                  activeTab={fileSystem.activeTab}
                  onTabClose={closeTab}
                  onTabSelect={(tabId) => {
                    const updatedFileSystem = { ...fileSystem, activeTab: tabId };
                    // We need to manage this state properly, but for now this will work
                  }}
                  onContentChange={updateFileContent}
                />
              </ResizablePanel>
              
              <ResizableHandle />
              
              <ResizablePanel defaultSize={30} minSize={20}>
                <TerminalPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - AI Sidecar */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <AISidecar 
              projectId={projectId} 
              currentFiles={getCurrentFiles()}
              onApplyPatches={handleApplyPatches}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}