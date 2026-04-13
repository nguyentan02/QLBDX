import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { auth, adminOnly } from '../middlewares/auth';

const router = Router();

router.get('/', auth, adminOnly, (req, res) => paymentController.findAll(req, res));

export default router;
