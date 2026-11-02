export type DealStage =
  | 'enquiry'
  | 'quote_sent'
  | 'deposit_paid'
  | 'in_production'
  | 'ready'
  | 'delivered'
  | 'lost';

export type ServiceType =
  | 'Physical Branding'
  | 'Social Media'
  | 'Digital Marketing'
  | 'One-Off Design'
  | 'Bundle'
  | 'Other';

export type ActivityType =
  | 'WhatsApp'
  | 'Call'
  | 'Meeting'
  | 'Email'
  | 'Note'
  | 'Update';

export type DeliverableStatus = 'pending' | 'in_progress' | 'done';

export interface Account {
  id: string;
  company_name: string;
  contact_person: string | null;
  industry: string | null;
  website: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
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
  whatsapp: string | null;
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
  service_type: ServiceType;
  estimated_value: number;
  stage: DealStage;
  goal: string | null;
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

export interface Deliverable {
  id: string;
  deal_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: DeliverableStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  company_name: string;
  contact_person: string | null;
  whatsapp: string | null;
  email: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_name: string;
  category: string | null;
  unit: string;
  cost_price: number;
  markup_percent: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export const DEAL_STAGES: {
  key: DealStage;
  label: string;
  description: string;
  color: string;
}[] = [
  { key: 'enquiry',       label: 'Enquiry',         description: 'New enquiry received via WhatsApp or email', color: 'gray' },
  { key: 'quote_sent',    label: 'Quote Sent',       description: 'Quote/proposal sent to client',              color: 'blue' },
  { key: 'deposit_paid',  label: 'Deposit Paid',     description: '50% deposit received, design started',       color: 'amber' },
  { key: 'in_production', label: 'In Production',    description: 'Job is being produced/manufactured',         color: 'orange' },
  { key: 'ready',         label: 'Ready',            description: 'Ready for delivery or collection',           color: 'teal' },
  { key: 'delivered',     label: 'Delivered',        description: 'Delivered/installed, balance outstanding',   color: 'emerald' },
  { key: 'lost',          label: 'Lost',             description: 'Deal lost',                                  color: 'red' },
];

export const SERVICE_TYPES: ServiceType[] = [
  'Physical Branding',
  'Social Media',
  'Digital Marketing',
  'One-Off Design',
  'Bundle',
  'Other',
];

export const ACTIVITY_TYPES: ActivityType[] = [
  'WhatsApp',
  'Call',
  'Meeting',
  'Email',
  'Note',
  'Update',
];
