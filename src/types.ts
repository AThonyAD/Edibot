export interface User {
  id: number;
  email: string;
  role: 'publisher' | 'client' | 'admin';
  name: string;
  is_active?: boolean | number;
}

export interface MediaTitle {
  id: number;
  publisher_id: number;
  organization_id?: number;
  name: string;
  type?: string;
  contact: string;
  default_price?: number;
  default_reach?: number;
  default_target_audience?: string;
  default_collaboration_type?: string;
  topic_count?: number;
  website?: string;
}

export interface Topic {
  id: number;
  publisher_id: number;
  media_title_id?: number;
  media_name: string;
  title: string;
  description: string;
  publication_date: string;
  deadline_date: string;
  price: number;
  format: string;
  collaboration_type: string;
  contact: string;
  target_audience: string;
  reach: number;
  labels?: string[];
}

export type OpportunityType =
  | 'media'
  | 'media_topic'
  | 'conference'
  | 'event'
  | 'outdoor'
  | 'indoor'
  | 'digital'
  | 'webinar'
  | 'sponsorship'
  | 'newsletter'
  | 'podcast'
  | 'award'
  | 'trade_fair'
  | 'other';

export interface Organization {
  id: number;
  name: string;
  type: string;
  website?: string;
  contact_email?: string;
  owner_user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Opportunity {
  id: number;
  parent_opportunity_id?: number;
  owner_user_id: number;
  organization_id?: number;
  media_title_id?: number;
  title: string;
  description?: string;
  type: OpportunityType;
  category?: string;
  audience?: string;
  location?: string;
  reach?: number;
  price?: number;
  format?: string;
  collaboration_type?: string;
  contact?: string;
  website?: string;
  source_topic_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OpportunityListItem extends Opportunity {
  parent_opportunity_title?: string;
  organization_name?: string;
  organization_type?: string;
  media_title_name?: string;
  occurrence_id?: number;
  publication_date?: string;
  start_date?: string;
  end_date?: string;
  deadline_id?: number;
  deadline_type?: string;
  deadline_date?: string;
  tags?: string[];
}

export interface OpportunityOccurrence {
  id: number;
  opportunity_id: number;
  publication_date?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Deadline {
  id: number;
  opportunity_occurrence_id: number;
  deadline_type: string;
  deadline_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaxonomyItem {
  id: number;
  value: string;
  label: string;
  description?: string;
  is_active: number | boolean;
  sort_order: number;
}

export interface OpportunityOptions {
  types: TaxonomyItem[];
  channels: TaxonomyItem[];
  categories: TaxonomyItem[];
}
