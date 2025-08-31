import React, { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Upload, File, Image, Code, FileText } from "lucide-react";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  acceptedTypes: string[];
}

export function FileUpload({ onUpload, acceptedTypes }: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      onUpload(filesArray);
    }
  }, [onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      onUpload(filesArray);
    }
  }, [onUpload]);

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image;
    if (type.includes('code') || type.includes('javascript') || type.includes('python')) return Code;
    if (type.includes('pdf') || type.includes('doc')) return FileText;
    return File;
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5 glow' 
            : 'border-border/50 hover:border-primary/50 hover:bg-primary/2'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          multiple
          onChange={handleChange}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-medium">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">
              Documents, images, or code files
            </p>
          </div>
        </div>
      </Card>

      {/* Supported File Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Documents", types: "PDF, DOC, DOCX" },
          { icon: Image, label: "Images", types: "JPG, PNG, GIF" },
          { icon: Code, label: "Code", types: "JS, TS, PY" },
          { icon: File, label: "Data", types: "JSON, CSV, XML" }
        ].map((type, index) => (
          <div key={index} className="ai-card p-3 text-center">
            <type.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">{type.label}</p>
            <p className="text-xs text-muted-foreground">{type.types}</p>
          </div>
        ))}
      </div>
    </div>
  );
}