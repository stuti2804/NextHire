import mongoose, { Schema, Document } from 'mongoose';

// Sub-schemas for analysis data
const BasicInfoSchema = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  mobile: { type: String, required: false },
  address: { type: String, required: false }
});

const SkillsSchema = new Schema({
  currentSkills: [String],
  recommendedSkills: [String]
});

const CourseRecommendationSchema = new Schema({
  platform: { type: String, required: true },
  course_name: { type: String, required: true },
  link: { type: String, required: true }
});

const RelevantSkillScoreSchema = new Schema({
  skill: { type: String, required: true },
  score: { type: Number, required: true }
});

const JobLevelScoreSchema = new Schema({
  level: { type: String, required: true },
  score: { type: Number, required: true }
});

const CareerGrowthSchema = new Schema({
  currentRole: { type: String, required: true },
  nextRole: { type: String, required: true },
  futureRoles: [String],
  suggestions: [String]
});

const ProjectSuggestionSchema = new Schema({
  improvementTips: [String],
  newProjectRecommendations: [String]
});

const ResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: "000000000000000000000000", // Default ObjectId for anonymous users
    },
    title: { 
      type: String, 
      required: true 
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true,
      enum: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    },
    fileData: {
      type: Buffer,
      required: true
    },
    rawText: {
      type: String,
      required: false
    },
    wordCount: {
      type: Number,
      default: 0
    },
    hasAnalysis: {
      type: Boolean,
      default: false
    },
    // Analysis fields
    basicInfo: { type: BasicInfoSchema, required: false },
    skills: { type: SkillsSchema, required: false },
    courseRecommendations: [CourseRecommendationSchema],
    appreciation: [String],
    resumeTips: [String],
    atsScore: { type: Number, default: 0 },
    aiResumeSummary: { type: String, required: false },
    matchingJobRoles: [String],
    atsKeywords: [String],
    projectSuggestions: { type: ProjectSuggestionSchema, required: false },
    relevantSkillsScore: [RelevantSkillScoreSchema],
    jobLevelScore: [JobLevelScoreSchema],
    careerGrowthTrajectory: [CareerGrowthSchema],
    analysisVersion: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove the file data from the JSON response
        delete ret.fileData;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove the file data from the object
        delete ret.fileData;
        return ret;
      }
    },
  }
);

// Auto-increment analysis version on update
ResumeSchema.pre("save", function (next) {
  if (this.isModified('basicInfo') || 
      this.isModified('skills') || 
      this.isModified('atsScore') ||
      this.isModified('courseRecommendations') ||
      this.isModified('resumeTips')) {
    this.analysisVersion += 1;
  }
  next();
});

export interface ResumeData {
  userId: mongoose.Types.ObjectId;
  title: string;
  fileName: string;
  fileType: string;
  fileData: Buffer;
  rawText?: string;
  wordCount?: number;
  hasAnalysis: boolean;
  // Analysis fields
  basicInfo?: {
    name: string;
    email: string;
    mobile: string;
    address: string;
  };
  skills?: {
    currentSkills: string[];
    recommendedSkills: string[];
  };
  courseRecommendations?: {
    platform: string;
    course_name: string;
    link: string;
  }[];
  appreciation?: string[];
  resumeTips?: string[];
  atsScore?: number;
  aiResumeSummary?: string;
  matchingJobRoles?: string[];
  atsKeywords?: string[];
  projectSuggestions?: {
    improvementTips: string[];
    newProjectRecommendations: string[];
  };
  relevantSkillsScore?: {
    skill: string;
    score: number;
  }[];
  jobLevelScore?: {
    level: string;
    score: number;
  }[];
  careerGrowthTrajectory?: {
    currentRole: string;
    nextRole: string;
    futureRoles: string[];
    suggestions: string[];
  }[];
  analysisVersion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResumeDocument = Document & ResumeData;
export const Resume = mongoose.model<ResumeDocument>("Resume", ResumeSchema);