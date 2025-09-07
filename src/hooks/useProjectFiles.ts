import { useState, useEffect } from 'react';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  modified?: boolean;
  lastModified?: string;
}

export interface FileSystemState {
  files: ProjectFile[];
  openTabs: {
    id: string;
    name: string;
    path: string;
    content: string;
    modified: boolean;
  }[];
  activeTab: string;
}

export function useProjectFiles(projectId?: string) {
  const [fileSystem, setFileSystem] = useState<FileSystemState>({
    files: [],
    openTabs: [],
    activeTab: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProjectFiles(projectId);
    }
  }, [projectId]);

  const loadProjectFiles = async (projectId: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call to load project files
      // For now, using enhanced mock data that simulates a real project structure
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
                  content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`,
                  lastModified: new Date().toISOString()
                },
                {
                  id: '4',
                  name: 'Header.tsx',
                  path: 'src/components/Header.tsx',
                  type: 'file',
                  content: `import React from 'react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}`,
                  lastModified: new Date().toISOString()
                }
              ]
            },
            {
              id: '5',
              name: 'pages',
              path: 'src/pages',
              type: 'folder',
              children: [
                {
                  id: '6',
                  name: 'HomePage.tsx',
                  path: 'src/pages/HomePage.tsx',
                  type: 'file',
                  content: `import React from 'react';
import { Header } from '../components/Header';

export function HomePage() {
  return (
    <div>
      <Header title="Welcome" />
      <main className="p-4">
        <h2>Home Page</h2>
        <p>This is the home page of our application.</p>
      </main>
    </div>
  );
}`,
                  lastModified: new Date().toISOString()
                },
                {
                  id: '7',
                  name: 'AboutPage.tsx',
                  path: 'src/pages/AboutPage.tsx',
                  type: 'file',
                  content: `import React from 'react';
import { Header } from '../components/Header';

export function AboutPage() {
  return (
    <div>
      <Header title="About Us" />
      <main className="p-4">
        <h2>About Page</h2>
        <p>Learn more about our company and mission.</p>
      </main>
    </div>
  );
}`,
                  lastModified: new Date().toISOString()
                }
              ]
            },
            {
              id: '8',
              name: 'styles',
              path: 'src/styles',
              type: 'folder',
              children: [
                {
                  id: '9',
                  name: 'globals.css',
                  path: 'src/styles/globals.css',
                  type: 'file',
                  content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.App {
  min-height: 100vh;
}`,
                  lastModified: new Date().toISOString()
                }
              ]
            }
          ]
        },
        {
          id: '10',
          name: 'public',
          path: 'public',
          type: 'folder',
          children: [
            {
              id: '11',
              name: 'index.html',
              path: 'public/index.html',
              type: 'file',
              content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
              lastModified: new Date().toISOString()
            }
          ]
        },
        {
          id: '12',
          name: 'package.json',
          path: 'package.json',
          type: 'file',
          content: `{
  "name": "react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.0",
    "vite": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`,
          lastModified: new Date().toISOString()
        },
        {
          id: '13',
          name: 'README.md',
          path: 'README.md',
          type: 'file',
          content: `# React Project

This is a React application built with TypeScript and Vite.

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build`,
          lastModified: new Date().toISOString()
        }
      ];

      setFileSystem(prev => ({
        ...prev,
        files: mockFiles
      }));
    } catch (error) {
      console.error('Failed to load project files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openFile = (file: ProjectFile) => {
    if (file.type === 'folder') return;
    
    const existingTab = fileSystem.openTabs.find(tab => tab.path === file.path);
    if (existingTab) {
      setFileSystem(prev => ({ ...prev, activeTab: existingTab.id }));
      return;
    }

    const newTab = {
      id: file.id,
      name: file.name,
      path: file.path,
      content: file.content || '',
      modified: false
    };

    setFileSystem(prev => ({
      ...prev,
      openTabs: [...prev.openTabs, newTab],
      activeTab: newTab.id
    }));
  };

  const closeTab = (tabId: string) => {
    setFileSystem(prev => {
      const newTabs = prev.openTabs.filter(tab => tab.id !== tabId);
      let newActiveTab = prev.activeTab;
      
      if (prev.activeTab === tabId && newTabs.length > 0) {
        const index = prev.openTabs.findIndex(tab => tab.id === tabId);
        const nextTab = newTabs[index] || newTabs[index - 1];
        newActiveTab = nextTab?.id || '';
      }
      
      return {
        ...prev,
        openTabs: newTabs,
        activeTab: newTabs.length > 0 ? newActiveTab : ''
      };
    });
  };

  const updateFileContent = (tabId: string, content: string) => {
    setFileSystem(prev => ({
      ...prev,
      openTabs: prev.openTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, content, modified: true }
          : tab
      )
    }));
  };

  const saveFile = async (tabId: string) => {
    // TODO: Implement real file saving via API
    console.log('Saving file:', tabId);
    
    setFileSystem(prev => ({
      ...prev,
      openTabs: prev.openTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, modified: false }
          : tab
      )
    }));
  };

  const saveAllFiles = async () => {
    const modifiedTabs = fileSystem.openTabs.filter(tab => tab.modified);
    for (const tab of modifiedTabs) {
      await saveFile(tab.id);
    }
  };

  const createFile = (parentPath: string, fileName: string, content = '') => {
    const newFileId = `file_${Date.now()}`;
    const newFilePath = parentPath ? `${parentPath}/${fileName}` : fileName;
    
    const newFile: ProjectFile = {
      id: newFileId,
      name: fileName,
      path: newFilePath,
      type: 'file',
      content,
      lastModified: new Date().toISOString()
    };

    // TODO: Implement real file creation via API
    console.log('Creating file:', newFilePath);
    
    // For now, just add to the file system state
    setFileSystem(prev => ({
      ...prev,
      files: addFileToTree(prev.files, parentPath, newFile)
    }));

    return newFile;
  };

  const deleteFile = (filePath: string) => {
    // TODO: Implement real file deletion via API
    console.log('Deleting file:', filePath);
    
    setFileSystem(prev => ({
      ...prev,
      files: removeFileFromTree(prev.files, filePath),
      openTabs: prev.openTabs.filter(tab => tab.path !== filePath)
    }));
  };

  const applyPatches = (patches: any[]) => {
    patches.forEach(patch => {
      if (patch.action === 'create' || patch.action === 'update') {
        // Create or update file
        const existingTab = fileSystem.openTabs.find(tab => tab.path === patch.file);
        if (existingTab) {
          updateFileContent(existingTab.id, patch.content);
        } else {
          const newFile = createFile(
            patch.file.includes('/') ? patch.file.substring(0, patch.file.lastIndexOf('/')) : '',
            patch.file.includes('/') ? patch.file.substring(patch.file.lastIndexOf('/') + 1) : patch.file,
            patch.content
          );
          openFile(newFile);
        }
      } else if (patch.action === 'delete') {
        deleteFile(patch.file);
      }
    });
  };

  const getCurrentFiles = (): Record<string, string> => {
    const result: Record<string, string> = {};
    
    const extractFiles = (files: ProjectFile[]) => {
      files.forEach(file => {
        if (file.type === 'file' && file.content) {
          result[file.path] = file.content;
        }
        if (file.children) {
          extractFiles(file.children);
        }
      });
    };
    
    extractFiles(fileSystem.files);
    return result;
  };

  return {
    fileSystem,
    isLoading,
    openFile,
    closeTab,
    updateFileContent,
    saveFile,
    saveAllFiles,
    createFile,
    deleteFile,
    applyPatches,
    getCurrentFiles
  };
}

// Helper functions
function addFileToTree(files: ProjectFile[], parentPath: string, newFile: ProjectFile): ProjectFile[] {
  return files.map(file => {
    if (file.path === parentPath && file.type === 'folder') {
      return {
        ...file,
        children: [...(file.children || []), newFile]
      };
    }
    if (file.children) {
      return {
        ...file,
        children: addFileToTree(file.children, parentPath, newFile)
      };
    }
    return file;
  });
}

function removeFileFromTree(files: ProjectFile[], filePath: string): ProjectFile[] {
  return files.filter(file => file.path !== filePath).map(file => {
    if (file.children) {
      return {
        ...file,
        children: removeFileFromTree(file.children, filePath)
      };
    }
    return file;
  });
}