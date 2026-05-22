import { createMiddleware } from 'hono/factory';
import type { AppVariables } from '../types/app';
import type { Env } from '../types/env';
import type { UserRole } from '../types/user.type';
import { forbidden } from '../utils/error';

export function requireRoles(...roles: UserRole[]) {
  return createMiddleware<{ Bindings: Env; Variables: AppVariables }>(async (c, next) => {
    const user = c.get('authUser');

    if (!roles.includes(user.role)) {
      throw forbidden(`Required role: ${roles.join(', ')}`);
    }

    await next();
  });
}
