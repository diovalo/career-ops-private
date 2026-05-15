export interface Application {
  num: number;
  date: string;
  company: string;
  role: string;
  score: number;
  status: string;
  pdf: string; // ✅ or ❌
  report: string; // report link like [011](reports/...)
  notes: string;
  cvFile?: string; // extracted from notes, e.g. "cover-acme-dev-2026-05-05.pdf"
}

export interface AppContext {
  notes?: string;
  companyUrl?: string;
  contactName?: string;
  contactLinkedIn?: string;
  followUpDate?: string;    // ISO date "YYYY-MM-DD"
  salaryRange?: string;
  plannedMode?: string;     // career-ops mode: "contacto", "deep", "apply", etc.
  plannedNote?: string;
  updatedAt: string;
}

export type AppContextMap = Record<string, AppContext>;

// Kept for backward compat with existing KV route
export interface Insight {
  text: string;
  applyAngle?: string;
  updatedAt: string;
}

export type Status =
  | 'Evaluated'
  | 'Applied'
  | 'Responded'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Discarded'
  | 'SKIP';

export const StatusColors: Record<Status, string> = {
  'Evaluated': 'bg-blue-100 text-blue-800 border-blue-300',
  'Applied': 'bg-purple-100 text-purple-800 border-purple-300',
  'Responded': 'bg-teal-100 text-teal-800 border-teal-300',
  'Interview': 'bg-orange-100 text-orange-800 border-orange-300',
  'Offer': 'bg-green-100 text-green-800 border-green-300',
  'Rejected': 'bg-red-100 text-red-800 border-red-300',
  'Discarded': 'bg-gray-100 text-gray-800 border-gray-300',
  'SKIP': 'bg-gray-50 text-gray-600 border-gray-200',
};
