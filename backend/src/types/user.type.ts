export const userRoles = ['super_admin', 'shop_admin', 'clinic_admin', 'user'] as const;

export type UserRole = (typeof userRoles)[number];

export const organizationAdminRoles = ['owner', 'manager', 'staff'] as const;

export type OrganizationAdminRole = (typeof organizationAdminRoles)[number];
