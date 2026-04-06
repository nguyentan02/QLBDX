import { Router } from 'express';
import { parkingSpotController } from '../controllers/parkingSpot.controller';
import { validate } from '../middlewares/validate';
import { createParkingSpotSchema, updateParkingSpotSchema } from '../validators/parkingSpot.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => parkingSpotController.findAll(req, res));
router.post('/', auth, validate(createParkingSpotSchema), (req, res) => parkingSpotController.create(req, res));
router.put('/:id', auth, validate(updateParkingSpotSchema), (req, res) => parkingSpotController.update(req, res));
router.delete('/:id', auth, (req, res) => parkingSpotController.delete(req, res));

export default router;
