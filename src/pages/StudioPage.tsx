import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, GitBranch, Download, Settings } from 'lucide-react';
import { FileExplorer } from '@/components/studio/FileExplorer';
import { CodeEditor } from '@/components/studio/CodeEditor';
import { AISidecar } from '@/components/studio/AISidecar';
import { GitPanel } from '@/components/studio/GitPanel';
import { TerminalPanel } from '@/components/studio/TerminalPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  modified: boolean;
}

export function StudioPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('main');

  useEffect(() => {
    // Load project and files
    loadProject();
    loadFiles();
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

  const loadFiles = () => {
    // Mock file structure
    const mockFiles: ProjectFile[] = [
      {
        id: '1',
        name: 'src',
        path: 'src',
        type: 'folder',
        children: [
          {
            id: '2',
            name: 'components',
            path: 'src/components',
            type: 'folder',
            children: [
              {
                id: '3',
                name: 'App.tsx',
                path: 'src/components/App.tsx',
                type: 'file',
                content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;'
              }
            ]
          }
        ]
      },
      {
        id: '4',
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        content: '{\n  "name": "ai-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}'
      }
    ];
    setFiles(mockFiles);
  };

  const openFile = (file: ProjectFile) => {
    if (file.type === 'folder') return;
    
    const existingTab = openTabs.find(tab => tab.path === file.path);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const newTab: EditorTab = {
      id: file.id,
      name: file.name,
      path: file.path,
      content: file.content || '',
      modified: false
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId && openTabs.length > 1) {
      const index = openTabs.findIndex(tab => tab.id === tabId);
      const nextTab = openTabs[index + 1] || openTabs[index - 1];
      setActiveTab(nextTab?.id || '');
    }
  };

  const updateTabContent = (tabId: string, content: string) => {
    setOpenTabs(prev => 
      prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, content, modified: true }
          : tab
      )
    );
  };

  const runProject = () => {
    setIsRunning(true);
    // Simulate build process
    setTimeout(() => setIsRunning(false), 3000);
  };

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
                <FileExplorer files={files} onFileOpen={openFile} />
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
                  tabs={openTabs}
                  activeTab={activeTab}
                  onTabClose={closeTab}
                  onTabSelect={setActiveTab}
                  onContentChange={updateTabContent}
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
            <AISidecar projectId={projectId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}