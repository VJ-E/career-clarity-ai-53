import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAIAnalysis } from './AIAnalysisEngine';

interface ResumeUploadProps {
  // New props
  onAnalysisComplete?: (analysis: any) => void;
  onError?: (error: string) => void;
  // Legacy props (for backward compatibility)
  onFileUpload?: (file: File, content: string) => void;
  isProcessing?: boolean;
}

export const ResumeUpload = ({
  onAnalysisComplete,
  onError,
  // Legacy props with defaults
  onFileUpload,
  isProcessing = false,
}: ResumeUploadProps) => {
  const { toast } = useToast();
  const { analyzeResume, isLoading: isAnalyzing, error } = useAIAnalysis();
  // Use the new loading state or fall back to the legacy isProcessing prop
  const isLoading = isAnalyzing || isProcessing;
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = useCallback(async (file: File) => {
    setUploadStatus('processing');
    
    try {
      // Read file as text for initial preview
      const content = await file.text();
      
      // If using the legacy onFileUpload prop
      if (onFileUpload) {
        onFileUpload(file, content);
      } 
      // If using the new onAnalysisComplete prop
      else if (onAnalysisComplete) {
        // Start the actual analysis
        const analysis = await analyzeResume(file, content);
        setUploadStatus('success');
        onAnalysisComplete(analysis);
        
        toast({
          title: "Analysis Complete",
          description: "Your resume has been analyzed successfully!",
        });
      } else {
        throw new Error('No callback provided for handling the uploaded file');
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      setUploadStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze resume';
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [analyzeResume, onAnalysisComplete, onError, toast]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    await handleAnalysis(file);
  }, [handleAnalysis]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isLoading
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
        <input 
      {...getInputProps()} 
      ref={fileInputRef}
      disabled={isLoading}
    />
        
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

          {(uploadStatus === 'idle' || uploadStatus === 'error') && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Analyzing...' : 'Choose File'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};