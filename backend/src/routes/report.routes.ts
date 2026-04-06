import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/dashboard', auth, (req, res) => reportController.getDashboard(req, res));
router.get('/revenue', auth, (req, res) => reportController.getRevenue(req, res));
router.get('/vehicle-stats', auth, (req, res) => reportController.getVehicleStats(req, res));
router.get('/hourly-stats', auth, (req, res) => reportController.getHourlyStats(req, res));

export default router;
