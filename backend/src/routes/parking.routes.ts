import { Router } from 'express';
import { parkingController } from '../controllers/parking.controller';
import { validate } from '../middlewares/validate';
import { parkingEntrySchema, parkingExitSchema } from '../validators/parking.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => parkingController.findAll(req, res));
router.post('/entry', auth, validate(parkingEntrySchema), (req, res) => parkingController.entry(req, res));
router.post('/exit', auth, validate(parkingExitSchema), (req, res) => parkingController.exit(req, res));
router.get('/:id/preview', auth, (req, res) => parkingController.preview(req, res));
router.get('/history', auth, (req, res) => parkingController.history(req, res));

export default router;
