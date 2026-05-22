import { z } from 'zod';
import { organizationStatuses, organizationTypes } from '../types/organization.type';
import { organizationAdminRoles, userRoles } from '../types/user.type';

export const uuidSchema = z.string().uuid();

export const organizationTypeSchema = z.enum(organizationTypes);
export const organizationStatusSchema = z.enum(organizationStatuses);
export const userRoleSchema = z.enum(userRoles);
export const organizationAdminRoleSchema = z.enum(organizationAdminRoles);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export function rangeFromPagination(page: number, perPage: number): [number, number] {
  const from = (page - 1) * perPage;
  return [from, from + perPage - 1];
}
