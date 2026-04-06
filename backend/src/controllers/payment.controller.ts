import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

export class PaymentController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { fromDate, toDate, paymentMethod } = req.query;
      const result = await paymentService.findAll(
        fromDate as string | undefined,
        toDate as string | undefined,
        paymentMethod as string | undefined,
      );
      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
    }
  }
}

export const paymentController = new PaymentController();
