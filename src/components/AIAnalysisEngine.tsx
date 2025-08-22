import { useState } from 'react';

interface ResumeAnalysis {
  fileName: string;
  text: string;
  contact: {
    email: string;
    phone: string;
  };
  sections: Record<string, string>;
  skills: string[];
  classifications: Array<{
    role: string;
    confidence: number;
  }>;
  skillGaps: Array<{
    skill: string;
    level: 'missing' | 'beginner' | 'intermediate' | 'advanced';
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

export const useAIAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeResume = async (file: File, content: string): Promise<ResumeAnalysis> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Parse the resume
      const parseFormData = new FormData();
      parseFormData.append('file', file);
      
      const parseResponse = await fetch('http://localhost:8000/parse_resume', {
        method: 'POST',
        body: parseFormData,
      });
      
      if (!parseResponse.ok) {
        throw new Error('Failed to parse resume');
      }
      
      const parsedData = await parseResponse.json();
      
      // 2. Classify the resume
      const classifyResponse = await fetch('http://localhost:8000/classify_resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: parsedData.text }),
      });
      
      if (!classifyResponse.ok) {
        throw new Error('Failed to classify resume');
      }
      
      const classificationData = await classifyResponse.json();
      const topRole = classificationData.classifications[0]?.role;
      
      // 3. Get skill gap analysis
      let skillGaps: ResumeAnalysis['skillGaps'] = [];
      const recommendations: ResumeAnalysis['recommendations'] = [];

      if (topRole && parsedData.skills?.length > 0) {
        try {
          const skillGapResponse = await fetch('http://localhost:8000/skill_gap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: topRole,
              skills: parsedData.skills,
            }),
          });
          
          if (skillGapResponse.ok) {
            const gapData = await skillGapResponse.json();
            console.log('Skill Gap Response:', gapData);
            
            // Map the backend response to our expected format
            skillGaps = (gapData.missing_skills || []).map((skill: string) => ({
              skill,
              level: 'missing',
              importance: 'high' // Default to high importance for missing skills
            }));
            
            // Add recommendations from the backend
            if (gapData.recommendations) {
              gapData.recommendations.forEach((rec: string) => {
                recommendations.push({
                  type: 'course',
                  title: rec,
                  provider: 'Skill Development',
                  url: 'https://example.com/skills',
                  priority: 'high'
                });
              });
            }
          }
        } catch (e) {
          console.warn('Skill gap analysis failed, continuing without it', e);
        }
      }
      
      // 4. Get ATS score (using a default job description if none provided)
      let atsScore = 0;
      let atsIssues: string[] = [];
      
      try {
        const atsResponse = await fetch('http://localhost:8000/ats_score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume_text: parsedData.text,
            job_description: 'Looking for a skilled professional with experience in software development and problem-solving abilities.'
          }),
        });
        
        if (atsResponse.ok) {
          const atsData = await atsResponse.json();
          atsScore = atsData.ats_score || 0;
          atsIssues = atsData.suggestions || [];
          console.log('ATS Response:', { atsData, atsScore, atsIssues });
        }
      } catch (e) {
        console.warn('ATS scoring failed, using default values', e);
        atsScore = 0;
        atsIssues = ['Unable to analyze ATS compatibility at this time.'];
      }
      
      // 5. Generate readiness scores based on classification confidence
      const readinessScores = classificationData.classifications
        .map((c: { role: string; confidence: number }) => ({
          role: c.role,
          score: Math.round(c.confidence * 0.9), // Scale down slightly from confidence
        }));
      
      // 6. Add additional recommendations based on skill gaps if none were added from the backend
      if (recommendations.length === 0 && skillGaps.length > 0) {
        skillGaps.forEach(gap => {
          if (gap.importance === 'high') {
            recommendations.push({
              type: 'course',
              title: `Learn ${gap.skill}`,
              provider: 'Online Learning Platform',
              url: 'https://example.com',
              priority: 'high',
            });
          }
        });
      }
      
      // 7. Format the final response
      const result: ResumeAnalysis = {
        fileName: file.name,
        text: parsedData.text,
        contact: parsedData.contact || { email: '', phone: '' },
        sections: parsedData.sections || {},
        skills: parsedData.skills || [],
        classifications: classificationData.classifications || [],
        skillGaps,
        atsScore,
        atsIssues,
        recommendations,
        readinessScores,
      };
      
      setIsLoading(false);
      return result;
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsLoading(false);
      
      // Return a default error state
      return {
        fileName: file.name,
        text: '',
        contact: { email: '', phone: '' },
        sections: {},
        skills: [],
        classifications: [],
        skillGaps: [],
        atsScore: 0,
        atsIssues: ['Failed to analyze resume. Please try again.'],
        recommendations: [],
        readinessScores: [],
      };
    }
  };

  return {
    analyzeResume,
    isLoading,
    error
  };
};