// Types for Directus CMS integration

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  education: string;
  description: string;
  image: string;
  services: string[];
  schedule: string;
  rating: number;
  reviews_count: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image: string;
  is_popular: boolean;
}

// Real API service types
export interface ApiService {
  id: number;
  kind: number;
  code: string;
  name: string;
  altcode: string;
  altname: string;
  barcode: string;
  info: string;
  group_name: string;
  group_id: number;
  mz_code: string;
  cito_cost: number;
  duration: number;
  base_cost: number;
  purchase_price: number;
  denomination: number;
  unit_id: number | null;
  unit: string | null;
}

export interface ServiceGroup {
  id: number;
  name: string;
  services: ApiService[];
}

// Archimed API types
export interface ArchimedDoctor {
  id: number;
  name: string;
  name1: string;
  name2: string;
  type: string;
  code: string;
  max_time: string;
  phone: string;
  snils: string;
  info: string;
  zone_id: number;
  zone: string;
  branch_id: number;
  branch: string;
  category_id: number;
  category: string;
  scientific_degree_id: number;
  scientific_degree: string;
  user_id: number;
  photo: string | null;
  address: string;
  building_name: string;
  building_web_name: string | null;
  primary_type_id: number;
  types: ArchimedDoctorType[];
  experienceStartYear?: number; // Automatically calculated from prodoctorov data
}

export interface ArchimedDoctorType {
  id: number;
  name: string;
}

export interface ArchimedZone {
  id: number;
  name: string;
}

export interface ArchimedBranch {
  id: number;
  name: string;
}

export interface ArchimedCategory {
  id: number;
  name: string;
}

export interface ArchimedScientificDegree {
  id: number;
  name: string;
}

// Appointment types
export interface AppointmentData {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  preferredDate?: string;
  preferredTime?: string;
  comments?: string;
  serviceId?: number;
  doctorId?: number;
}

export interface ArchimedAppointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  preferred_date?: string;
  preferred_time?: string;
  comments?: string;
  service_id?: number;
  doctor_id?: number;
  status_id: number;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStatus {
  id: number;
  name: string;
  description?: string;
}

export interface Review {
  id: string;
  patient_name: string;
  doctor_id?: string;
  service_id?: string;
  rating: number;
  comment: string;
  date: string;
  is_verified: boolean;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  tags: string[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  valid_until: string;
  image: string;
  conditions: string;
  is_active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface Contact {
  id: string;
  type: 'phone' | 'email' | 'address';
  value: string;
  label: string;
  is_primary: boolean;
}

export interface ClinicInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  working_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  logo: string;
  about_text: string;
  advantages: string[];
}

// API Response types
export interface DirectusResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export interface DirectusListResponse<T> {
  data: T[];
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

// User authentication types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'patient' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'patient' | 'staff';
  lastname?: string;
  firstname?: string;
  middlename?: string;
  country?: string;
  region?: string;
  city?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// Groupservices API types
export interface GroupServiceInfo {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface GroupServicesResponse {
  data: ApiService[];
  meta?: {
    pagination?: {
      page: number;
      pageCount: number;
      pageSize: number;
      total: number;
    };
  };
} 