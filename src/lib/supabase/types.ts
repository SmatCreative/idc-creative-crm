export type DealStage =
  | 'lead_captured'
  | 'discovery_scoping'
  | 'proposal_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export type ProjectType =
  | 'Branding'
  | 'Web Design'
  | 'Campaign'
  | 'Retainer'
  | 'Social Media'
  | 'Video Production'
  | 'Photography'
  | 'Copywriting'
  | 'Strategy'
  | 'Other';

export type ActivityType =
  | 'Email'
  | 'Call'
  | 'Pitch Meeting'
  | 'Review'
  | 'Note'
  | 'Task Completed';

export interface Account {
  id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  total_lifetime_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  account_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  account?: Account;
}

export interface Deal {
  id: string;
  deal_name: string;
  account_id: string | null;
  project_type: ProjectType;
  estimated_value: number;
  stage: DealStage;
  target_launch_date: string | null;
  closed_lost_reason: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  account?: Account;
}

export interface Activity {
  id: string;
  type: ActivityType;
  notes: string | null;
  deal_id: string | null;
  contact_id: string | null;
  created_at: string;
  contact?: Contact;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deal_id: string | null;
  contact_id: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deal?: Deal;
  contact?: Contact;
}

export const DEAL_STAGES: { key: DealStage; label: string; description: string; color: string }[] = [
  { key: 'lead_captured', label: 'Lead Captured', description: 'Inbound inquiries & RFPs', color: 'slate' },
  { key: 'discovery_scoping', label: 'Discovery & Scoping', description: 'Understanding project briefs', color: 'blue' },
  { key: 'proposal_sent', label: 'Proposal Sent', description: 'Pitch deck & pricing delivered', color: 'violet' },
  { key: 'negotiation', label: 'Negotiation', description: 'Contracting & scope tweaks', color: 'amber' },
  { key: 'closed_won', label: 'Closed Won', description: 'Deposit paid — in production', color: 'emerald' },
  { key: 'closed_lost', label: 'Closed Lost', description: 'Archived with reason', color: 'red' },
];

export const PROJECT_TYPES: ProjectType[] = [
  'Branding', 'Web Design', 'Campaign', 'Retainer',
  'Social Media', 'Video Production', 'Photography',
  'Copywriting', 'Strategy', 'Other',
];

export const ACTIVITY_TYPES: ActivityType[] = [
  'Email', 'Call', 'Pitch Meeting', 'Review', 'Note', 'Task Completed',
];
