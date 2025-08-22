import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Award,
  ExternalLink,
  Download
} from 'lucide-react';

interface AnalysisData {
  fileName: string;
  classifications: Array<{
    role: string;
    confidence: number;
    description: string;
  }>;
  skillGaps: Array<{
    skill: string;
    level: 'missing' | 'beginner' | 'intermediate';
    importance: 'high' | 'medium' | 'low';
  }>;
  atsScore: number;
  atsIssues: string[];
  recommendations: Array<{
    type: 'course' | 'certification' | 'project';
    title: string;
    provider: string;
    url: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  readinessScores: Array<{
    role: string;
    score: number;
  }>;
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

export const AnalysisResults = ({ data }: AnalysisResultsProps) => {
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExportingPdf(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Analysis Complete</h2>
            <p className="text-sm text-muted-foreground">Resume: {data.fileName}</p>
          </div>
        </div>
        <Button 
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="bg-gradient-primary hover:opacity-90"
        >
          {exportingPdf ? (
            <>Loading...</>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ATS Score */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">ATS Compatibility</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{data.atsScore}%</span>
                  <span className={`text-sm font-medium ${getScoreColor(data.atsScore)}`}>
                    {data.atsScore >= 80 ? 'Excellent' : data.atsScore >= 60 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
                <Progress value={data.atsScore} className="h-2" />
              </div>
            </Card>

            {/* Top Role Match */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Best Role Match</h3>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">{data.classifications[0]?.role}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-smooth" 
                      style={{ width: `${data.classifications[0]?.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{data.classifications[0]?.confidence}%</span>
                </div>
              </div>
            </Card>

            {/* Readiness Score */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Role Readiness</h3>
              </div>
              <div className="space-y-2">
                {data.readinessScores.slice(0, 1).map((item) => (
                  <div key={item.role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{item.role}</span>
                      <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                        {item.score}%
                      </span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ATS Issues */}
          {data.atsIssues.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">ATS Issues to Fix</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.atsIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Classification Tab */}
        <TabsContent value="classification">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">AI Role Classification</h3>
            <div className="space-y-4">
              {data.classifications.map((classification, index) => (
                <div key={index} className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{classification.role}</h4>
                    <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-0">
                      {classification.confidence}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{classification.description}</p>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-smooth ${
                        index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-muted-foreground'
                      }`}
                      style={{ width: `${classification.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Gaps */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Skill Gap Analysis</h3>
              <div className="space-y-3">
                {data.skillGaps.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        skill.level === 'missing' ? 'bg-destructive' :
                        skill.level === 'beginner' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <span className="font-medium">{skill.skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={skill.importance === 'high' ? 'destructive' : skill.importance === 'medium' ? 'secondary' : 'outline'}>
                        {skill.importance}
                      </Badge>
                      <Badge variant="outline">{skill.level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Readiness Scores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Role Readiness Scores</h3>
              <div className="space-y-4">
                {data.readinessScores.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.role}</span>
                      <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-smooth ${getScoreBg(item.score)}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <div className="space-y-6">
            {['course', 'certification', 'project'].map((type) => {
              const items = data.recommendations.filter(r => r.type === type);
              if (items.length === 0) return null;

              const getTypeIcon = () => {
                switch (type) {
                  case 'course': return <BookOpen className="w-5 h-5 text-primary" />;
                  case 'certification': return <Award className="w-5 h-5 text-secondary" />;
                  case 'project': return <Target className="w-5 h-5 text-success" />;
                  default: return null;
                }
              };

              return (
                <Card key={type} className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    {getTypeIcon()}
                    <h3 className="text-lg font-semibold capitalize">{type}s</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-card to-muted/30 rounded-lg border border-border/50 hover:shadow-lg transition-smooth">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.provider}</p>
                          </div>
                          <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}>
                            {item.priority}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Learn More
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};