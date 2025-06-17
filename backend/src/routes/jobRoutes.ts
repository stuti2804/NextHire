import express, { Request, Response } from 'express';
import { protect as authenticate } from '../middleware/auth';
import { Resume } from '../models/Resume';
import { Job } from '../models/Job';
import axios from 'axios';

const router = express.Router();

// Search for jobs using external API
router.post('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: 'Keywords array is required' });
    }
    
    const jobs = await searchExternalJobs(keywords);
    res.json(jobs);
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Server error while searching jobs' });
  }
});

// Get saved jobs
router.get('/saved', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    const savedJobs = await Job.find({ userId });
    res.json(savedJobs);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Server error while fetching saved jobs' });
  }
});

// Save a job
router.post('/save', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const jobData = req.body;
    
    // Check if job already saved
    const existingJob = await Job.findOne({ 
      userId, 
      externalJobId: jobData.id || jobData.externalJobId 
    });

    if (existingJob) {
      return res.status(409).json({ 
        message: 'Job already saved',
        job: existingJob 
      });
    }

    // Create a new job entry
    const newJob = new Job({
      userId,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location || 'Remote',
      description: jobData.description,
      url: jobData.url,
      salary: jobData.salary,
      externalJobId: jobData.id || jobData.externalJobId,
      source: jobData.source || 'external'
    });
    
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ message: 'Server error while saving job' });
  }
});

// Delete a saved job
router.delete('/saved/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const jobId = req.params.id;
    
    const deletedJob = await Job.findOneAndDelete({ _id: jobId, userId });
    
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found or not owned by user' });
    }
    
    res.status(200).json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ message: 'Server error while removing saved job' });
  }
});

// Get recommended jobs based on resume keywords
router.get('/recommended/:resumeId', authenticate, async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Find the resume
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Extract keywords from resume or its analysis
    const keywords = extractKeywordsFromResume(resume);
    
    if (keywords.length === 0) {
      return res.json([]);
    }
    
    // Search for jobs using the keywords
    const jobs = await searchExternalJobs(keywords);
    
    // Return jobs sorted by match score with a recommended flag
    const sortedJobs = jobs
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 10)
      .map(job => ({
        ...job,
        recommended: true
      }));
    
    res.json(sortedJobs);
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({ message: 'Server error while fetching job recommendations' });
  }
});

// Helper function to extract keywords from a resume - Updated for direct resume model access
function extractKeywordsFromResume(resume: any): string[] {
  let keywords: string[] = [];
  
  // Try to get keywords from the resume itself since analysis is now stored there
  if (resume.hasAnalysis) {
    // Use ATS keywords from resume if available
    if (resume.atsKeywords && resume.atsKeywords.length) {
      return resume.atsKeywords;
    }
    
    // Use current skills if available
    if (resume.skills && resume.skills.currentSkills && resume.skills.currentSkills.length) {
      return resume.skills.currentSkills;
    }
  }
  
  // If no keywords found, try other sources
  if (resume.keywords && Array.isArray(resume.keywords)) {
    keywords = resume.keywords;
  } else if (resume.rawText) {
    // Simple extraction from raw text - extract words that are likely skills
    const skillPattern = /\b([A-Za-z]{3,}(?:\s[A-Za-z]+)?)\b/g;
    const text = resume.rawText.toLowerCase();
    const matches = [...text.matchAll(skillPattern)].map(match => match[0]);
    const uniqueMatches = Array.from(new Set(matches));
    keywords = uniqueMatches
      .filter(word => !['the', 'and', 'for', 'with', 'that', 'this'].includes(word))
      .slice(0, 10);
  }
  
  // If still no keywords found, use default technology keywords
  if (keywords.length === 0) {
    keywords = ["javascript", "react", "node", "typescript", "python"];
  }
  
  return keywords;
}

// Helper function to search for jobs using external API
async function searchExternalJobs(keywords: string[]): Promise<any[]> {
  try {
    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaApiKey = process.env.ADZUNA_API_KEY;
    
    if (!adzunaAppId || !adzunaApiKey) {
      console.error('Adzuna API credentials missing');
      return getMockedJobs(keywords);
    }
    
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1`;
    const response = await axios.get(url, {
      params: {
        app_id: adzunaAppId,
        app_key: adzunaApiKey,
        what_or: keywords.join(" "),
        results_per_page: 20
      }
    });
    
    if (!response.data.results) {
      return [];
    }
    
    return response.data.results.map((job: any) => ({
      id: job.id || String(Math.random()),
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      description: job.description,
      url: job.redirect_url,
      salary: {
        min: job.salary_min || 0,
        max: job.salary_max || 0,
        currency: 'USD'
      },
      matchScore: calculateMatchScore(job.description, keywords)
    }));
  } catch (error) {
    console.error('Error searching external jobs:', error);
    return getMockedJobs(keywords);
  }
}

// Calculate matching score between job description and keywords
function calculateMatchScore(description: string, keywords: string[]): number {
  if (!description || !keywords.length) return 0;
  
  const descriptionLower = description.toLowerCase();
  let matchCount = 0;
  
  keywords.forEach(keyword => {
    if (descriptionLower.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });
  
  return Math.round((matchCount / keywords.length) * 100);
}

// Fallback function to get mocked jobs when API fails
function getMockedJobs(keywords: string[]): any[] {
  return [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      description: `We're looking for a frontend developer with experience in ${keywords.slice(0, 3).join(', ')}.`,
      url: 'https://example.com/job/1',
      salary: { min: 80000, max: 120000, currency: 'USD' },
      matchScore: 85
    },
    {
      id: '2',
      title: 'Backend Engineer',
      company: 'Digital Innovations',
      location: 'San Francisco, CA',
      description: `Backend role requiring skills in ${keywords.slice(0, 2).join(', ')} and database management.`,
      url: 'https://example.com/job/2',
      salary: { min: 90000, max: 130000, currency: 'USD' },
      matchScore: 75
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      company: 'Growth Startup',
      location: 'New York, NY',
      description: `Full stack position working with ${keywords.slice(0, 4).join(', ')} in an agile environment.`,
      url: 'https://example.com/job/3',
      salary: { min: 95000, max: 140000, currency: 'USD' },
      matchScore: 90
    }
  ];
}

export default router;
