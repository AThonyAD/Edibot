export interface User {
  id: number;
  email: string;
  role: 'publisher' | 'client' | 'admin';
  name: string;
  is_active?: boolean | number;
  token?: string;
}

export interface MediaTitle {
  id: number;
  publisher_id: number;
  name: string;
  contact: string;
  default_price?: number;
  default_reach?: number;
  default_target_audience?: string;
  default_collaboration_type?: string;
  topic_count?: number;
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
