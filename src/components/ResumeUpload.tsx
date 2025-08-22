import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onFileUpload: (file: File, content: string) => void;
  isProcessing: boolean;
}

export const ResumeUpload = ({ onFileUpload, isProcessing }: ResumeUploadProps) => {
  const { toast } = useToast();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('processing');
    
    try {
      // Simulate file processing for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(file, content);
        setUploadStatus('success');
        toast({
          title: "Resume uploaded successfully",
          description: "AI analysis starting...",
        });
      };
      reader.readAsText(file);
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: "Please try again with a different file.",
        variant: "destructive",
      });
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-success" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-destructive" />;
      default:
        return <Upload className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'processing':
        return 'Processing your resume...';
      case 'success':
        return 'Resume uploaded successfully!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume or click to browse';
    }
  };

  return (
    <Card className="relative overflow-hidden transition-smooth hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
      <div 
        {...getRootProps()} 
        className={`relative p-12 text-center cursor-pointer transition-smooth border-2 border-dashed rounded-lg ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : uploadStatus === 'success'
            ? 'border-success bg-success/10'
            : uploadStatus === 'error'
            ? 'border-destructive bg-destructive/10'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${
            uploadStatus === 'success' 
              ? 'bg-success/20' 
              : uploadStatus === 'error'
              ? 'bg-destructive/20'
              : 'bg-primary/20'
          }`}>
            {getStatusIcon()}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{getStatusText()}</h3>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, and TXT files (max 10MB)
            </p>
          </div>

          {uploadStatus === 'idle' && (
            <Button variant="outline" className="mt-4">
              <FileText className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};