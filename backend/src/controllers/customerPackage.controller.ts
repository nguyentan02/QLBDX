import { Request, Response } from 'express';
import { customerPackageService } from '../services/customerPackage.service';

export class CustomerPackageController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.query.customerId ? Number(req.query.customerId) : undefined;
      const status = req.query.status as string | undefined;
      const result = await customerPackageService.findAll(customerId, status);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await customerPackageService.create(req.body, req.user!.id);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const result = await customerPackageService.update(Number(req.params.id), req.body);
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const result = await customerPackageService.delete(Number(req.params.id));
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }

  async checkActivePackage(req: Request, res: Response): Promise<void> {
    try {
      const result = await customerPackageService.checkActivePackage(Number(req.params.vehicleId));
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }
}

export const customerPackageController = new CustomerPackageController();
