import React from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  modified: boolean;
}

interface CodeEditorProps {
  tabs: EditorTab[];
  activeTab: string;
  onTabClose: (tabId: string) => void;
  onTabSelect: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
}

export function CodeEditor({ 
  tabs, 
  activeTab, 
  onTabClose, 
  onTabSelect, 
  onContentChange 
}: CodeEditorProps) {
  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'js':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No files open</p>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center border-b bg-muted/30">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-3 py-2 border-r cursor-pointer hover:bg-muted/50 ${
              tab.id === activeTab ? 'bg-background' : ''
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="text-sm mr-2">
              {tab.name}
              {tab.modified && <span className="text-orange-500 ml-1">●</span>}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive/20"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeTabData && (
          <Editor
            height="100%"
            language={getLanguage(activeTabData.name)}
            value={activeTabData.content}
            onChange={(value) => onContentChange(activeTabData.id, value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        )}
      </div>
    </div>
  );
}