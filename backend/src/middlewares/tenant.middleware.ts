import { createMiddleware } from 'hono/factory';
import type { AppVariables } from '../types/app';
import type { Env } from '../types/env';
import { badRequest } from '../utils/error';
import { forbidden } from '../utils/error';

export function requireOrganizationAccess(paramName = 'id') {
  return createMiddleware<{ Bindings: Env; Variables: AppVariables }>(async (c, next) => {
    const user = c.get('authUser');
    const organizationId = c.req.param(paramName);

    if (!organizationId) {
      throw badRequest(`Missing organization parameter: ${paramName}`);
    }

    if (user.role === 'super_admin' || user.organizationIds.includes(organizationId)) {
      await next();
      return;
    }

    throw forbidden('You cannot access another organization');
  });
}
