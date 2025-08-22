import { useState } from 'react';
import { AIHeader } from '@/components/AIHeader';
import { ResumeUpload } from '@/components/ResumeUpload';
import { AnalysisResults } from '@/components/AnalysisResults';
import { useAIAnalysis } from '@/components/AIAnalysisEngine';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Users, TrendingUp, Award } from 'lucide-react';

const Index = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const { analyzeResume, isLoading } = useAIAnalysis();

  const handleFileUpload = async (file: File, content: string) => {
    try {
      const results = await analyzeResume(file, content);
      setAnalysisData(results);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AIHeader />
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-md mx-auto p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-secondary animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Our neural networks are analyzing your resume...
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AIHeader />
      
      <main className="container mx-auto px-6 py-12">
        {!analysisData ? (
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI-Powered Resume Intelligence
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Transform your career with deep neural network analysis. Get personalized insights, 
                  skill gap analysis, and career recommendations.
                </p>
              </div>
              
              {/* Feature Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-primary">87%</h3>
                  <p className="text-sm text-muted-foreground">Classification Accuracy</p>
                </Card>
                <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
                  <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-secondary">3.2x</h3>
                  <p className="text-sm text-muted-foreground">Interview Success Rate</p>
                </Card>
                <Card className="p-6 text-center bg-gradient-to-br from-success/10 to-transparent border-success/20">
                  <Award className="w-8 h-8 text-success mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-success">50K+</h3>
                  <p className="text-sm text-muted-foreground">Resumes Analyzed</p>
                </Card>
              </div>
            </div>

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <ResumeUpload onFileUpload={handleFileUpload} isProcessing={isLoading} />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {[
                {
                  title: "Zero-Shot Classification",
                  description: "Advanced transformer models classify your resume into relevant job roles",
                  icon: "🎯"
                },
                {
                  title: "Skill Gap Analysis",
                  description: "Identify missing skills and get personalized improvement recommendations",
                  icon: "📊"
                },
                {
                  title: "ATS Optimization",
                  description: "Ensure your resume passes Applicant Tracking Systems",
                  icon: "✅"
                },
                {
                  title: "Career Guidance",
                  description: "Get AI-powered recommendations for courses, certifications, and projects",
                  icon: "🚀"
                }
              ].map((feature, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-smooth">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <AnalysisResults data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
