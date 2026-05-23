export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type UserRole = 'super_admin' | 'shop_admin' | 'clinic_admin' | 'user';
export type OrganizationType = 'shop' | 'clinic';
export type OrganizationStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type OrganizationAdminRole = 'owner' | 'manager' | 'staff';

export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  organizationIds: string[];
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  userId: string;
};

export type DashboardStats = {
  organizations: number;
  users: number;
  news: number;
};

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  latitude: number | null;
  longitude: number | null;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
};

export type ListResult<T> = {
  items: T[];
  count: number;
};

export type AdminMembership = {
  id: string;
  role: OrganizationAdminRole;
  created_at: string;
  organization_id: string;
  organizations: {
    id: string;
    name: string;
    type: OrganizationType;
    status: OrganizationStatus;
  } | null;
  users: {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  } | null;
};

export type NewsItem = {
  id: string;
  organization_id: string | null;
  title: string;
  content: string;
  cover_image: string | null;
  type: 'global' | 'shop' | 'clinic' | 'promotion' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Banner = {
  id: string;
  title: string;
  image_url: string;
  link_type: string | null;
  link_value: string | null;
  position: number;
  status: 'active' | 'inactive';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  action: string;
  module: string;
  description: string;
  ip_address: string | null;
  created_at: string;
  users: {
    email: string | null;
    full_name: string | null;
  } | null;
  organizations: {
    name: string;
    type: OrganizationType;
  } | null;
};

export type ServiceItem = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
};

export type ReviewItem = {
  id: string;
  user_id: string;
  organization_id: string;
  rating: number;
  comment: string | null;
  status: 'pending' | 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    email: string | null;
    full_name: string | null;
  } | null;
};

export type BookingItem = {
  id: string;
  user_id: string;
  organization_id: string;
  service_id: string | null;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  note: string | null;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
  } | null;
  services: {
    id: string;
    name: string;
    price: number | null;
    duration_minutes: number | null;
  } | null;
};
