
export enum UserType {
  CANDIDATE = 'CANDIDATE',
  COMPANY = 'COMPANY'
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  token?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  cvUrl: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  aiMatchScore?: number;
  aiFeedback?: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: string;
  cvUrl?: string;
}
