export interface FileMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  userId: string;
}

export interface ParsedDocument {
  text: string;
  metadata: FileMetadata;
  sections?: {
    education?: string[];
    experience?: string[];
    skills?: string[];
  };
}

export interface DocumentStorageOptions {
  prefix?: string;
  maxSize?: number;
  allowedTypes?: string[];
}
