export const organizationTypes = ['shop', 'clinic'] as const;
export type OrganizationType = (typeof organizationTypes)[number];

export const organizationStatuses = ['active', 'inactive', 'pending', 'suspended'] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];
