import type { UserRole } from './user.type';

export type AuthUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  organizationIds: string[];
};

export type AppVariables = {
  authUser: AuthUser;
};
