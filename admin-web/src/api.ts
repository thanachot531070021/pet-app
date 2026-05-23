import type {
  AdminMembership,
  ActivityLog,
  ApiResponse,
  AuthUser,
  Banner,
  BookingItem,
  DashboardStats,
  ListResult,
  NewsItem,
  LoginResult,
  Organization,
  OrganizationStatus,
  ReviewItem,
  ServiceItem,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/api';

type RequestOptions = {
  token?: string | null;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}

export type OrganizationPayload = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  status?: OrganizationStatus;
};

export type SignedUploadPayload = {
  folder: 'organizations' | 'banners' | 'news' | 'services';
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
};

export type SignedUploadResult = {
  bucket: string;
  path: string;
  token: string | null;
  signedUrl: string | null;
  publicUrl: string;
  contentType: string;
  size?: number;
};

export const api = {
  baseUrl: API_BASE_URL,
  health: () => request<{ status: string; service: string; environment: string }>('/health'),
  databaseHealth: () => request<{ status: string }>('/health/db'),
  login: (email: string, password: string) =>
    request<LoginResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  me: (token: string) => request<AuthUser>('/auth/me', { token }),
  dashboard: (token: string) => request<DashboardStats>('/super-admin/dashboard', { token }),
  shops: (token: string) =>
    request<ListResult<Organization>>('/super-admin/shops?page=1&perPage=50', { token }),
  clinics: (token: string) =>
    request<ListResult<Organization>>('/super-admin/clinics?page=1&perPage=50', { token }),
  createShop: (token: string, body: OrganizationPayload) =>
    request<Organization>('/super-admin/shops', { token, method: 'POST', body }),
  createClinic: (token: string, body: OrganizationPayload) =>
    request<Organization>('/super-admin/clinics', { token, method: 'POST', body }),
  updateShop: (token: string, id: string, body: Partial<OrganizationPayload>) =>
    request<Organization>(`/super-admin/shops/${id}`, { token, method: 'PATCH', body }),
  updateClinic: (token: string, id: string, body: Partial<OrganizationPayload>) =>
    request<Organization>(`/super-admin/clinics/${id}`, { token, method: 'PATCH', body }),
  deleteShop: (token: string, id: string) =>
    request<{ deleted: true }>(`/super-admin/shops/${id}`, { token, method: 'DELETE' }),
  deleteClinic: (token: string, id: string) =>
    request<{ deleted: true }>(`/super-admin/clinics/${id}`, { token, method: 'DELETE' }),
  admins: (token: string) =>
    request<ListResult<AdminMembership>>('/super-admin/admins?page=1&perPage=50', { token }),
  createAdmin: (
    token: string,
    body: {
      email: string;
      password: string;
      fullName: string;
      phone?: string | null;
      role: 'shop_admin' | 'clinic_admin';
      organizationId: string;
      organizationRole: 'owner' | 'manager' | 'staff';
    },
  ) => request('/super-admin/admins', { token, method: 'POST', body }),
  deactivateAdmin: (token: string, id: string) =>
    request<{ deactivated: true }>(`/super-admin/admins/${id}`, { token, method: 'DELETE' }),
  news: (token: string) => request<ListResult<NewsItem>>('/news?page=1&perPage=50', { token }),
  createNews: (
    token: string,
    body: {
      organizationId?: string | null;
      title: string;
      content: string;
      coverImage?: string | null;
      type: 'global' | 'shop' | 'clinic' | 'promotion' | 'announcement';
      status: 'draft' | 'published' | 'archived';
      publishedAt?: string | null;
    },
  ) => request<NewsItem>('/news', { token, method: 'POST', body }),
  updateNews: (
    token: string,
    id: string,
    body: {
      organizationId?: string | null;
      title?: string;
      content?: string;
      coverImage?: string | null;
      type?: 'global' | 'shop' | 'clinic' | 'promotion' | 'announcement';
      status?: 'draft' | 'published' | 'archived';
      publishedAt?: string | null;
    },
  ) => request<NewsItem>(`/news/${id}`, { token, method: 'PATCH', body }),
  deleteNews: (token: string, id: string) =>
    request<{ deleted: true }>(`/news/${id}`, { token, method: 'DELETE' }),
  banners: (token: string) =>
    request<ListResult<Banner>>('/super-admin/banners?page=1&perPage=50', { token }),
  createBanner: (
    token: string,
    body: {
      title: string;
      imageUrl: string;
      linkType?: string | null;
      linkValue?: string | null;
      position: number;
      status: 'active' | 'inactive';
    },
  ) => request<Banner>('/super-admin/banners', { token, method: 'POST', body }),
  updateBanner: (
    token: string,
    id: string,
    body: {
      title?: string;
      imageUrl?: string;
      linkType?: string | null;
      linkValue?: string | null;
      position?: number;
      status?: 'active' | 'inactive';
    },
  ) => request<Banner>(`/super-admin/banners/${id}`, { token, method: 'PATCH', body }),
  deleteBanner: (token: string, id: string) =>
    request<{ deleted: true }>(`/super-admin/banners/${id}`, { token, method: 'DELETE' }),
  activityLogs: (token: string) =>
    request<ListResult<ActivityLog>>('/super-admin/activity-logs?page=1&perPage=50', { token }),
  createSignedUploadUrl: (token: string, body: SignedUploadPayload) =>
    request<SignedUploadResult>('/uploads/signed-url', { token, method: 'POST', body }),
  uploadAsset: async (token: string, folder: SignedUploadPayload['folder'], file: File) => {
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/uploads/direct`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const payload = (await response.json()) as ApiResponse<SignedUploadResult>;
    if (!payload.ok) {
      throw new Error(payload.error.message);
    }

    return payload.data;
  },
  adminDashboard: (token: string) => request<{ organizationIds: string[] }>('/admin/dashboard', { token }),
  adminProfile: (token: string) => request<Organization>('/admin/profile', { token }),
  updateAdminProfile: (token: string, body: OrganizationPayload) =>
    request<Organization>('/admin/profile', { token, method: 'PATCH', body }),
  adminServices: (token: string) =>
    request<ListResult<ServiceItem>>('/admin/services?page=1&perPage=50', { token }),
  createAdminService: (
    token: string,
    body: {
      name: string;
      description?: string | null;
      price?: number | null;
      durationMinutes?: number | null;
      imageUrl?: string | null;
      status: 'draft' | 'published' | 'archived';
    },
  ) => request<ServiceItem>('/admin/services', { token, method: 'POST', body }),
  updateAdminService: (
    token: string,
    id: string,
    body: {
      name?: string;
      description?: string | null;
      price?: number | null;
      durationMinutes?: number | null;
      imageUrl?: string | null;
      status?: 'draft' | 'published' | 'archived';
    },
  ) => request<ServiceItem>(`/admin/services/${id}`, { token, method: 'PATCH', body }),
  deleteAdminService: (token: string, id: string) =>
    request<{ deleted: true }>(`/admin/services/${id}`, { token, method: 'DELETE' }),
  adminReviews: (token: string) =>
    request<ListResult<ReviewItem>>('/admin/reviews?page=1&perPage=50', { token }),
  updateReviewStatus: (token: string, id: string, status: ReviewItem['status']) =>
    request<ReviewItem>(`/admin/reviews/${id}`, { token, method: 'PATCH', body: { status } }),
  adminBookings: (token: string) =>
    request<ListResult<BookingItem>>('/admin/bookings?page=1&perPage=50', { token }),
  updateBookingStatus: (token: string, id: string, status: BookingItem['status']) =>
    request<BookingItem>(`/admin/bookings/${id}`, { token, method: 'PATCH', body: { status } }),
};
