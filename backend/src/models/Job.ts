import mongoose, { Schema, Document } from 'mongoose';

const JobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: { 
      type: String, 
      required: true 
    },
    company: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String, 
      default: 'Remote' 
    },
    description: { 
      type: String, 
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    externalJobId: { 
      type: String, 
      required: false 
    },
    source: {
      type: String,
      default: 'external'
    }
  },
  {
    timestamps: true
  }
);

export interface JobData {
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location?: string;
  description: string;
  url: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  externalJobId?: string;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type JobDocument = Document & JobData;
export const Job = mongoose.model<JobDocument>("Job", JobSchema);
