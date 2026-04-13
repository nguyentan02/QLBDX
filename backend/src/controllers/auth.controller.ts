import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { logActivity } from '../services/activityLog.service';

function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? null;
}

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const ip = getClientIp(req);
    const username: string = req.body?.username ?? 'unknown';
    try {
      const result = await authService.login(req.body);
      logActivity({
        userId: result.user.id,
        username: result.user.username,
        action: 'LOGIN',
        ipAddress: ip,
        statusCode: 200,
      });
      res.json(result);
    } catch (err: any) {
      logActivity({
        userId: null,
        username,
        action: 'LOGIN_FAILED',
        details: err.message,
        ipAddress: ip,
        statusCode: err.status ?? 500,
      });
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.getProfile(req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.updateProfile(req.user!.id, req.body);
      logActivity({
        userId: req.user!.id,
        username: req.user!.username,
        action: 'UPDATE',
        entity: 'Users',
        entityId: req.user!.id,
        ipAddress: getClientIp(req),
        statusCode: 200,
      });
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }
}

export const authController = new AuthController();
