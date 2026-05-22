import { HTTPException } from 'hono/http-exception';

export function badRequest(message: string, details?: unknown): HTTPException {
  return new HTTPException(400, { message, cause: details });
}

export function unauthorized(message = 'Authentication required'): HTTPException {
  return new HTTPException(401, { message });
}

export function forbidden(message = 'Permission denied'): HTTPException {
  return new HTTPException(403, { message });
}

export function notFound(message = 'Resource not found'): HTTPException {
  return new HTTPException(404, { message });
}

export function conflict(message: string): HTTPException {
  return new HTTPException(409, { message });
}
