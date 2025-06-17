import React, { useState, useEffect, useRef } from 'react';
import { BarChart2, TrendingUp, Users, Download, ChevronDown, Lightbulb, Award, Book, Code, Rocket, Briefcase, GraduationCap } from 'lucide-react';
import resumeService from '../services/resumeService';
import analysisService, { GeminiAnalysisData } from '../services/analysisService';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';

// Define interfaces for data from basic backend APIs
interface AnalyticsData {
  resumeAnalysis?: {
    wordCount: number;
    keywordsDensity: Record<string, number>;
    suggestions: string[];
  };
  jobMatch?: {
    matchScore: number;
    missingKeywords: string[];
    suggestions: string[];
  };
  userStats?: {
    totalResumes: number;
    averageScore: number;
  };
}

const Analytics = () => {
  const [selectedResume, setSelectedResume] = useState<string>("Select a resume");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumeList, setResumeList] = useState<{id: string, name: string}[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [geminiAnalyticsData, setGeminiAnalyticsData] = useState<GeminiAnalysisData | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showGeminiFormat, setShowGeminiFormat] = useState<boolean>(true);
  const analyticsContentRef = useRef<HTMLDivElement>(null);
  
  // Fetch list of available resumes from backend
  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        console.log('Analytics: Starting to fetch resumes');
        
        // Check if token exists before making the request
        const token = localStorage.getItem('token');
        console.log('Analytics: Current auth token available:', !!token);
        
        const resumes = await resumeService.getAllResumes();
        console.log('Analytics: Resumes fetched:', resumes);
        
        const formattedResumes = resumes.map(resume => ({
          id: resume.id,
          name: resume.title || `Resume #${resume.id.slice(-5)}`
        }));
        
        setResumeList(formattedResumes);
        console.log('Analytics: Resume list set with', formattedResumes.length, 'items');
        
        if (formattedResumes.length > 0) {
          setSelectedResume(formattedResumes[0].name);
          setSelectedResumeId(formattedResumes[0].id);
          await fetchAnalyticsData(formattedResumes[0].id);
        } else {
          console.log('Analytics: No resumes found');
        }
      } catch (error: any) {
        console.error('Analytics: Error fetching resumes:', error);
        if (error && error.response) {
          console.error('Analytics: Error response:', {
            status: error.response.status,
            data: error.response.data
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumes();
  }, []);

  // Fetch analytics data based on selected resume
  const fetchAnalyticsData = async (resumeId: string) => {
    setIsLoading(true);
    try {
      // Fetch basic analytics data from existing endpoints
      const data: AnalyticsData = {};
      
      try {
        const resumeAnalysis = await analysisService.getResumeAnalysis(resumeId);
        data.resumeAnalysis = resumeAnalysis;
      } catch (error) {
        console.error('Error fetching resume analysis:', error);
      }

      try {
        const userStats = await analysisService.getUserStats();
        data.userStats = userStats;
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }

      if (jobDescription) {
        try {
          const jobMatch = await analysisService.getJobMatch(resumeId, jobDescription);
          data.jobMatch = jobMatch;
        } catch (error) {
          console.error('Error fetching job match:', error);
        }
      }

      setAnalyticsData(data);
      
      // Also fetch enhanced analysis data (directly using resume endpoint)
      try {
        const enhancedData = await analysisService.getEnhancedAnalysis(resumeId);
        setGeminiAnalyticsData(enhancedData);
      } catch (error) {
        console.error('Error fetching enhanced analysis:', error);
        // If enhanced analysis fails, keep the UI working with basic data
        setGeminiAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resume selection
  const handleResumeSelect = async (resumeId: string, resumeName: string) => {
    setSelectedResumeId(resumeId);
    setSelectedResume(resumeName);
    setIsDropdownOpen(false);
    await fetchAnalyticsData(resumeId);
  };

  // Handle job description submission
  const handleJobDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedResumeId && jobDescription) {
      setIsLoading(true);
      try {
        const jobMatch = await analysisService.getJobMatch(selectedResumeId, jobDescription);
        setAnalyticsData(prev => ({
          ...prev,
          jobMatch
        }));
        
        // Re-fetch enhanced analysis after job match to get updated data
        try {
          const enhancedData = await analysisService.getEnhancedAnalysis(selectedResumeId);
          setGeminiAnalyticsData(enhancedData);
        } catch (enhancedError) {
          console.error('Error updating enhanced analysis after job match:', enhancedError);
        }
      } catch (error) {
        console.error('Error fetching job match:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExport = async () => {
    if (!analyticsContentRef.current) {
      console.error('Analytics content ref is null');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Create a PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const contentElements = analyticsContentRef.current.children;
      
      let currentY = 10; // Starting Y position
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(`Resume Analytics: ${selectedResume}`, 10, currentY);
      currentY += 15;
      
      // Process each section
      for (let i = 0; i < contentElements.length; i++) {
        const section = contentElements[i] as HTMLElement;
        
        try {
          // Ensure the section is visible and styled properly for capture
          const originalDisplay = section.style.display;
          section.style.display = 'block';
          
          // Convert section to image
          const sectionImage = await htmlToImage.toPng(section, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          // Restore original styling
          section.style.display = originalDisplay;
          
          // Check if we need to add a new page
          if (currentY > 270) {
            pdf.addPage();
            currentY = 10;
          }
          
          // Get dimensions and preserve aspect ratio
          const imgWidth = 190; // Width with margins
          const imgProps = pdf.getImageProperties(sectionImage);
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          
          // Add image to PDF
          pdf.addImage(sectionImage, 'PNG', 10, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10; // Add spacing between sections
          
        } catch (err) {
          console.error(`Error processing section ${i+1}:`, err);
        }
      }
      
      // Save the PDF
      const filename = `${selectedResume.replace(/\s+/g, '_')}_analytics.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get the top keywords from keyword density
  const getTopKeywords = (): string[] => {
    if (!analyticsData.resumeAnalysis?.keywordsDensity) return [];
    
    return Object.entries(analyticsData.resumeAnalysis.keywordsDensity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  };

  // Render skill bars for relevant skills scores
  const renderSkillBars = () => {
    if (!geminiAnalyticsData?.relevantSkillsScore) return null;
    
    return (
      <div className="space-y-4">
        {geminiAnalyticsData.relevantSkillsScore.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
              <span className="text-sm font-medium text-gray-700">{skill.score}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 rounded-full bg-blue-600" 
                style={{ width: `${skill.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render job level scores
  const renderJobLevelScores = () => {
    if (!geminiAnalyticsData?.jobLevelScore) return null;
    
    return (
      <div className="space-y-4">
        {geminiAnalyticsData.jobLevelScore.map((level, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">{level.level}</span>
              <span className="text-sm font-medium text-gray-700">{level.score}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  level.score > 80 ? 'bg-green-600' :
                  level.score > 60 ? 'bg-blue-600' :
                  'bg-amber-600'
                }`}
                style={{ width: `${level.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render career growth path
  const renderCareerPath = () => {
    if (!geminiAnalyticsData?.careerGrowthTrajectory || geminiAnalyticsData.careerGrowthTrajectory.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">Career growth data not available</p>
        </div>
      );
    }
    
    const careerPath = geminiAnalyticsData.careerGrowthTrajectory[0];
    
    return (
      <div className="space-y-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <div className="flex-shrink-0 w-36 px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-center">
            <p className="text-sm font-medium">{careerPath.currentRole}</p>
          </div>
          
          <div className="flex-shrink-0 w-6 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-blue-400"></div>
          </div>
          
          <div className="flex-shrink-0 w-36 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-md text-center">
            <p className="text-sm font-medium">{careerPath.nextRole}</p>
          </div>
          
          <div className="flex-shrink-0 w-6 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-indigo-400"></div>
          </div>
          
          {careerPath.futureRoles.map((role, index) => (
            <React.Fragment key={index}>
              <div className="flex-shrink-0 w-36 px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-center">
                <p className="text-sm font-medium">{role}</p>
              </div>
              {index < careerPath.futureRoles.length - 1 && (
                <div className="flex-shrink-0 w-6 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-purple-400"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Suggestions for Career Growth</h4>
          <ul className="space-y-2">
            {careerPath.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-purple-600 text-xs">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Toggle between basic and Gemini format
  const toggleDisplayFormat = () => {
    setShowGeminiFormat(!showGeminiFormat);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Resume Analytics</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <button 
              className="flex items-center justify-between w-64 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{isLoading ? 'Loading...' : selectedResume}</span>
              <ChevronDown className="h-5 w-5 ml-2" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                {resumeList.length > 0 ? (
                  <ul className="max-h-60 overflow-auto py-1">
                    {resumeList.map((resume) => (
                      <li 
                        key={resume.id}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedResume === resume.name ? 'bg-gray-50' : ''}`}
                        onClick={() => handleResumeSelect(resume.id, resume.name)}
                      >
                        {resume.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No resumes available</div>
                )}
              </div>
            )}
          </div>
          
          <button 
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            onClick={handleExport}
            disabled={isExporting || !selectedResumeId || (!analyticsData.resumeAnalysis && !geminiAnalyticsData)}
          >
            {isExporting ? (
              <>
                <div className="h-5 w-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Export PDF
              </>
            )}
          </button>
          
          <button
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={toggleDisplayFormat}
          >
            {showGeminiFormat ? "Basic View" : "Enhanced View"}
          </button>
        </div>
      </div>

      {/* Job description input form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Match Analysis</h2>
        <form onSubmit={handleJobDescriptionSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Paste job description to analyze match with your resume
            </label>
            <textarea
              id="jobDescription"
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={!selectedResumeId || !jobDescription.trim() || isLoading}
          >
            Analyze Match
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div ref={analyticsContentRef} className="space-y-6">
          {/* Show either basic analytics or enhanced Gemini-style analytics */}
          {showGeminiFormat && geminiAnalyticsData ? (
            <>
              {/* ATS Score and Resume Summary */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Award className="h-6 w-6 text-amber-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">ATS Score & Summary</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="col-span-1 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">ATS Score</p>
                    <div className="flex items-center">
                      <p className="text-3xl font-semibold text-gray-900">{geminiAnalyticsData.atsScore}%</p>
                      <div className="ml-4 w-20 h-3 bg-gray-200 rounded-full">
                        <div 
                          className={`h-3 rounded-full ${
                            geminiAnalyticsData.atsScore > 80 ? 'bg-green-500' : 
                            geminiAnalyticsData.atsScore > 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${geminiAnalyticsData.atsScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">AI Resume Summary</p>
                    <p className="text-sm text-gray-700 mt-2">{geminiAnalyticsData.aiResumeSummary}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">ATS Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {geminiAnalyticsData.atsKeywords.map((keyword, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Matching Job Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {geminiAnalyticsData.matchingJobRoles.map((role, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Skills Analysis */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Code className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Skills Analysis</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Current Skills</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {geminiAnalyticsData.skills.currentSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Recommended Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {geminiAnalyticsData.skills.recommendedSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Relevant Skills Score</h3>
                  {renderSkillBars()}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Job Level Match</h3>
                  {renderJobLevelScores()}
                </div>
              </div>
              
              {/* Resume Tips */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Lightbulb className="h-6 w-6 text-yellow-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Resume Tips</h2>
                </div>
                
                <div className="space-y-4">
                  {geminiAnalyticsData.resumeTips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <span className="text-yellow-600 text-xs">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Appreciation */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Strengths & Appreciation</h2>
                </div>
                
                <div className="space-y-4">
                  {geminiAnalyticsData.appreciation.map((point, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Project Suggestions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Briefcase className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Project Suggestions</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Improvement Tips</h3>
                    <div className="space-y-3">
                      {geminiAnalyticsData.projectSuggestions.improvementTips.map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                            <span className="text-indigo-600 text-xs">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">New Project Ideas</h3>
                    <div className="space-y-3">
                      {geminiAnalyticsData.projectSuggestions.newProjectRecommendations.map((project, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <span className="text-green-600 text-xs">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-700">{project}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Course Recommendations */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Book className="h-6 w-6 text-orange-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Course Recommendations</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {geminiAnalyticsData.courseRecommendations.map((course, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{course.course_name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{course.platform}</p>
                          <a 
                            href={course.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View Course
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Career Growth Trajectory */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-6">
                  <Rocket className="h-6 w-6 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Career Growth Trajectory</h2>
                </div>
                
                {renderCareerPath()}
              </div>
              
              {/* Basic Job Match Analysis */}
              {analyticsData.jobMatch && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-6">
                    <BarChart2 className="h-6 w-6 text-purple-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Job Match Analysis</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Match Score</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-semibold text-gray-900">{analyticsData.jobMatch.matchScore}%</p>
                        <div className="ml-4 w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              analyticsData.jobMatch.matchScore > 70 ? 'bg-green-500' : 
                              analyticsData.jobMatch.matchScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analyticsData.jobMatch.matchScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.jobMatch.missingKeywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Job Match Suggestions</h3>
                    <div className="space-y-3">
                      {analyticsData.jobMatch.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-indigo-600 text-xs">{index + 1}</span>
                          </div>
                          <p className="text-gray-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {analyticsData.resumeAnalysis && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Analysis</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Word Count</p>
                      <p className="text-2xl font-semibold text-gray-900">{analyticsData.resumeAnalysis.wordCount}</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Unique Keywords</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {Object.keys(analyticsData.resumeAnalysis.keywordsDensity).length}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Suggestions</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analyticsData.resumeAnalysis.suggestions.length}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-md font-medium text-gray-900 mb-3">Top Keywords</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {getTopKeywords().map((keyword, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-md font-medium text-gray-900 mb-3">Improvement Suggestions</h3>
                  <div className="space-y-3">
                    {analyticsData.resumeAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-xs">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analyticsData.jobMatch && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-6">
                    <BarChart2 className="h-6 w-6 text-purple-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Job Match Analysis</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Match Score</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-semibold text-gray-900">{analyticsData.jobMatch.matchScore}%</p>
                        <div className="ml-4 w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              analyticsData.jobMatch.matchScore > 70 ? 'bg-green-500' : 
                              analyticsData.jobMatch.matchScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analyticsData.jobMatch.matchScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analyticsData.jobMatch.missingKeywords.map((keyword, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Job Match Suggestions</h3>
                    <div className="space-y-3">
                      {analyticsData.jobMatch.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-indigo-600 text-xs">{index + 1}</span>
                          </div>
                          <p className="text-gray-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {analyticsData.userStats && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-6">
                    <Users className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">User Statistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                      <p className="text-2xl font-semibold text-gray-900">{analyticsData.userStats.totalResumes}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Average Score</p>
                      <p className="text-2xl font-semibold text-gray-900">{analyticsData.userStats.averageScore}%</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!analyticsData.resumeAnalysis && !analyticsData.jobMatch && !analyticsData.userStats && !geminiAnalyticsData && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">
                {selectedResumeId ? 'No analytics data available for this resume.' : 'Please select a resume to view analytics.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;