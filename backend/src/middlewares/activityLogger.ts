import { Request, Response, NextFunction } from 'express';
import { logActivity } from '../services/activityLog.service';

const METHOD_TO_ACTION: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? null;
}

export const activityLogger = (entity: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      const action = METHOD_TO_ACTION[req.method];
      if (!action) return;
      if (res.statusCode >= 400) return;

      const rawId = req.params?.id;
      const entityId = rawId ? parseInt(rawId, 10) : null;

      logActivity({
        userId: req.user?.id ?? null,
        username: req.user?.username ?? 'anonymous',
        action,
        entity,
        entityId: entityId && !isNaN(entityId) ? entityId : null,
        ipAddress: getClientIp(req),
        statusCode: res.statusCode,
      });
    });

    next();
  };
};
