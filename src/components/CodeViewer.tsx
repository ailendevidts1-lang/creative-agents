import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  codeStructure?: any;
  zipUrl?: string;
  projectName?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  isOpen,
  onClose,
  codeStructure,
  zipUrl,
  projectName
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Code has been copied to your clipboard.',
    });
  };

  const downloadZip = () => {
    if (zipUrl) {
      window.open(zipUrl, '_blank');
    }
  };

  if (!codeStructure) return null;

  const {
    generatedCode,
    files = [],
    buildInstructions = [],
    deploymentInstructions = [],
    complexity,
    estimatedLines,
    techStack
  } = codeStructure;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Generated Code - {projectName}</span>
            <div className="flex gap-2">
              {zipUrl && (
                <Button variant="outline" size="sm" onClick={downloadZip}>
                  <Download className="h-4 w-4 mr-2" />
                  Download ZIP
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="code">Generated Code</TabsTrigger>
            <TabsTrigger value="files">File Structure</TabsTrigger>
            <TabsTrigger value="build">Build Guide</TabsTrigger>
            <TabsTrigger value="deploy">Deploy Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Complexity</div>
                <div className="text-lg font-semibold">{complexity || 'Medium'}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Estimated Lines</div>
                <div className="text-lg font-semibold">{estimatedLines || 'N/A'}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Files</div>
                <div className="text-lg font-semibold">{files.length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Tech Stack</div>
                <div className="text-lg font-semibold">
                  {techStack ? Object.keys(techStack).length : 'N/A'}
                </div>
              </div>
            </div>

            {techStack && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technology Stack</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(techStack).map(([category, technologies]) => (
                    <div key={category} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 capitalize">{category}</h4>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(technologies) ? technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {String(tech)}
                          </Badge>
                        )) : (
                          <Badge variant="secondary" className="text-xs">
                            {String(technologies)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generated Code</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedCode || '')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
            <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {generatedCode || 'No code generated yet.'}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="flex-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">File Structure</h3>
              <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                <div className="space-y-2">
                  {files.map((file: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                      <span className="text-sm font-mono">{file}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="build" className="flex-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Build Instructions</h3>
              <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                <div className="space-y-3">
                  {buildInstructions.map((instruction: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {instruction}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instruction)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="deploy" className="flex-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deployment Instructions</h3>
              <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                <div className="space-y-3">
                  {deploymentInstructions.map((instruction: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {instruction}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instruction)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};