import { Request, Response } from 'express';
import { parkingService } from '../services/parking.service';

export class ParkingController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await parkingService.findAll(req.query.status as string | undefined);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async entry(req: Request, res: Response): Promise<void> {
    try {
      const result = await parkingService.entry(req.body, req.user!.id);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async exit(req: Request, res: Response): Promise<void> {
    try {
      const result = await parkingService.exit(req.body, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async preview(req: Request, res: Response): Promise<void> {
    try {
      const result = await parkingService.preview(Number(req.params.id));
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async history(req: Request, res: Response): Promise<void> {
    try {
      const { from, to, licensePlate } = req.query;
      const result = await parkingService.history(
        from as string | undefined,
        to as string | undefined,
        licensePlate as string | undefined,
      );
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }
}

export const parkingController = new ParkingController();
