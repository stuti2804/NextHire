import { Router, Request, Response } from 'express';
import { Resume } from '../models/Resume';
import { protect } from '../middleware/auth';
import multer from 'multer';
import natural from 'natural';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

// Initialize GoogleGenerativeAI
let genAI: GoogleGenerativeAI;
let model: any;

// Initialize AI model if API key is available
if (process.env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// Apply authentication middleware to all routes
router.use(protect);

// Parse and analyze resume - now protected by auth middleware
router.post('/parse', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        details: "Please ensure you are sending a file in the request",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const fileType = req.file.mimetype;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(415).json({
        error: "Invalid file type",
        details: "Only PDF and Word documents are supported",
      });
    }

    // Extract text from the resume
    const extractedText = await extractText(req.file.buffer, fileType);

    // Create a new resume record with the authenticated user ID
    const newResume = new Resume({
      userId: userId,
      title: `Resume ${new Date().toLocaleDateString()}`,
      fileName: req.file.originalname,
      fileType: fileType,
      fileData: req.file.buffer,
      rawText: extractedText,
      wordCount: countWords(extractedText),
      hasAnalysis: false
    });

    const savedResume = await newResume.save();
    
    // Process with AI and save analysis if API key is available
    if (model) {
      try {
        const analysisResult = await analyzeWithAI(extractedText);
        
        // Update resume with analysis data
        await Resume.findByIdAndUpdate(
          savedResume._id,
          { 
            basicInfo: analysisResult.basicInfo,
            skills: analysisResult.skills,
            courseRecommendations: analysisResult.courseRecommendations,
            appreciation: analysisResult.appreciation,
            resumeTips: analysisResult.resumeTips,
            atsScore: analysisResult.atsScore,
            aiResumeSummary: analysisResult.aiResumeSummary,
            matchingJobRoles: analysisResult.matchingJobRoles,
            atsKeywords: analysisResult.atsKeywords,
            projectSuggestions: analysisResult.projectSuggestions,
            relevantSkillsScore: analysisResult.relevantSkillsScore,
            jobLevelScore: analysisResult.jobLevelScore,
            careerGrowthTrajectory: analysisResult.careerGrowthTrajectory,
            hasAnalysis: true,
            analysisVersion: 1
          }
        );

        return res.json({
          success: true,
          resumeId: savedResume.id,
          atsScore: analysisResult.atsScore,
          keywords: analysisResult.atsKeywords,
          skills: analysisResult.skills.currentSkills,
          saved: true,
          resumeUrl: `/resumes/${savedResume.id}`
        });
      } catch (aiError) {
        logger.error("AI analysis failed:", aiError);
      }
    }

    // Return basic response if AI analysis failed or not available
    return res.json({
      success: true,
      resumeId: savedResume.id,
      atsScore: 0,
      keywords: [],
      skills: [],
      saved: true,
      resumeUrl: `/resumes/${savedResume.id}`,
    });
    
  } catch (error: any) {
    logger.error("Resume parse failed:", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Failed to parse resume",
      details: error.message,
    });
  }
});

// Get all resumes for logged-in user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// Get single resume by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// Get resume file content
router.get('/:id/file', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    res.setHeader('Content-Type', resume.fileType);
    res.setHeader('Content-Disposition', `attachment; filename=${resume.fileName}`);
    res.send(resume.fileData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resume file" });
  }
});

// Update resume title
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const resume = await Resume.findByIdAndUpdate(
      id, 
      { title }, 
      { new: true }
    );
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: "Failed to update resume" });
  }
});

// Delete resume
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find and delete the resume
    await Resume.findByIdAndDelete(id);
    
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

// Add analysis-related routes
router.get('/:id/analysis', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    
    if (!resume.hasAnalysis) {
      return res.status(404).json({ error: "Analysis not found for this resume" });
    }
    
    res.json({
      keywordsDensity: analyzeKeywords(resume.rawText || ''),
      suggestions: resume.resumeTips || generateSuggestions(resume.rawText || '')
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Job match analysis
router.post('/:id/job-match', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { jobDescription } = req.body;
    
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resumeText = resume.rawText || '';
    
    return res.json({
      matchScore: calculateMatchScore(resumeText, jobDescription),
      missingKeywords: findMissingKeywords(resumeText, jobDescription),
      suggestions: generateJobMatchSuggestions(resumeText, jobDescription)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User statistics
router.get('/stats/user', async (req: Request, res: Response) => {
  try {
    const resumes = await Resume.find({ userId: req.user!.id });
    
    res.json({
      totalResumes: resumes.length,
      averageScore: calculateAverageScore(resumes),
      applicationSuccess: await getApplicationSuccess(req.user!.id)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions (moved from services)
async function extractText(file: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType.includes("pdf")) {
      const pdfData = await pdf(file);
      return pdfData.text;
    } else if (fileType.includes("word")) {
      const { value } = await mammoth.extractRawText({ buffer: file });
      return value;
    }
    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error: any) {
    logger.error("Text extraction failed:", {
      error: error.message,
      fileType,
    });
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

async function analyzeWithAI(text: string): Promise<any> {
  const prompt = `
    You are an expert resume analyzer. You must produce valid JSON output and ensure all URLs are valid and relevant to the recommended courses. Additionally, you must tailor job roles to the candidate's experience level. For example, if the resume indicates an entry-level or student background, include junior- or intern-level job roles (e.g., 'Data Science Intern', 'Junior Data Scientist', 'Machine Learning Intern') rather than exclusively senior positions.

Evaluation Criteria for Resume Score:
- Formatting and structure (clear sections, bullet points)
- ATS Optimization (use of industry-relevant keywords)
- Content Quality (clarity, conciseness, grammar)
- Relevance (matching skills and experience)
- Readability and presentation

Return the JSON structure as follows:
{
  "basicInfo": {
    "name": string,
    "email": string,
    "mobile": string,
    "address": string
  },
  "skills": {
    "currentSkills": list of at least 5 key skills,
    "recommendedSkills": list of at least 5 skills for improvement
  },
  "courseRecommendations": list of at least 5 courses with details as:
  {
    "platform": string,
    "course_name": string,
    "link": valid URL (ensure this is an active youtube url, relevant course URL)
  },
  "appreciation": list of at least 5 personalized positive comments,
  "resumeTips": list of at least 5 suggestions for improvement,
  "atsScore": number (score out of 100 in integer format),
  "aiResumeSummary": string (a concise summary for ATS optimization),
  "matchingJobRoles": list of 2-3 job roles specifically relevant to the candidate's experience level,
  "atsKeywords": list of at least 5 industry-relevant keywords,
  "projectSuggestions": {
    "improvementTips": list of 2-3 tips to enhance existing projects,
    "newProjectRecommendations": list of 2-3 suggested projects
  },
  "relevantSkillsScore": [
    {
      "skill": string,
      "score": number (0-100)
    }
  ],
  "jobLevelScore": [
    {
      "level": string,
      "score": number (0-100)
    }
  ],
  "careerGrowthTrajectory": [
    {
      "currentRole": string,
      "nextRole": string,
      "futureRoles": array of strings,
      "suggestions": array of strings
    }
  ]
}

Ensure the JSON is valid before outputting.
    Resume Text:
    ${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Clean up the response text by removing any markdown formatting
    const cleanJson = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsedResult = JSON.parse(cleanJson);
    
    // Fix any missing fields with defaults
    return {
      basicInfo: parsedResult.basicInfo || {
        name: "",
        email: "",
        mobile: "",
        address: "",
      },
      skills: parsedResult.skills || {
        currentSkills: [],
        recommendedSkills: [],
      },
      courseRecommendations: parsedResult.courseRecommendations || [],
      appreciation: parsedResult.appreciation || [],
      resumeTips: parsedResult.resumeTips || [],
      atsScore: parsedResult.atsScore || 0,
      aiResumeSummary: parsedResult.aiResumeSummary || "",
      matchingJobRoles: parsedResult.matchingJobRoles || [],
      atsKeywords: parsedResult.atsKeywords || [],
      projectSuggestions: parsedResult.projectSuggestions || {
        improvementTips: [],
        newProjectRecommendations: [],
      },
      relevantSkillsScore: parsedResult.relevantSkillsScore || [],
      jobLevelScore: parsedResult.jobLevelScore || [],
      careerGrowthTrajectory: parsedResult.careerGrowthTrajectory || []
    };
  } catch (error) {
    logger.error("AI analysis failed:", error);
    throw error;
  }
}

// Add analysis helper functions
function countWords(text: string): number {
  return text.split(/\s+/).length;
}

function analyzeKeywords(text: string) {
  // Simple implementation of keyword analysis
  const words = text.toLowerCase().split(/\s+/);
  const keywordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) { // Ignore short words
      keywordCounts[word] = (keywordCounts[word] || 0) + 1;
    }
  });
  
  return keywordCounts;
}

function generateSuggestions(text: string) {
  // Simple implementation of suggestions generation
  const suggestions = [];
  
  if (text.length < 1000) {
    suggestions.push('Consider adding more content to your resume');
  }
  
  if (!text.toLowerCase().includes('experience')) {
    suggestions.push('Add your work experience details');
  }
  
  if (!text.toLowerCase().includes('education')) {
    suggestions.push('Include your educational background');
  }
  
  return suggestions;
}

function calculateMatchScore(resume: string, jobDescription: string) {
  // Simple implementation of matching score calculation
  const resumeWords = new Set(resume.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  const jobWords = new Set(jobDescription.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  
  let matchCount = 0;
  jobWords.forEach(word => {
    if (resumeWords.has(word)) matchCount++;
  });
  
  return Math.round((matchCount / jobWords.size) * 100);
}

function findMissingKeywords(resume: string, jobDescription: string) {
  // Simple implementation of missing keywords detection
  const resumeWords = new Set(resume.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  const jobWords = jobDescription.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !["the", "and", "for", "with", "that", "this"].includes(word));
  
  // Find common words in job descriptions that might be keywords
  const wordFrequency: Record<string, number> = {};
  jobWords.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Get top keywords that are missing from the resume
  return Object.entries(wordFrequency)
    .filter(([word]) => !resumeWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function generateJobMatchSuggestions(resume: string, jobDescription: string) {
  // Simple implementation of job match suggestions
  const missingKeywords = findMissingKeywords(resume, jobDescription);
  
  return [
    `Consider adding these keywords to your resume: ${missingKeywords.slice(0, 5).join(', ')}`,
    'Tailor your experience section to better match the job requirements',
    'Highlight relevant projects that demonstrate required skills'
  ];
}

function calculateAverageScore(resumes: any[]) {
  if (resumes.length === 0) return 0;
  
  const totalScore = resumes.reduce((sum, resume) => {
    return sum + (resume.atsScore || 0);
  }, 0);
  
  return Math.round(totalScore / resumes.length);
}

async function getApplicationSuccess(userId: string) {
  // Placeholder for application success rate calculation
  // In a real implementation, this would query an applications collection
  return 65; // Return placeholder value of 65%
}

export default router;