import { Router } from 'express';
import { parkingSpotController } from '../controllers/parkingSpot.controller';
import { validate } from '../middlewares/validate';
import { createParkingSpotSchema, updateParkingSpotSchema } from '../validators/parkingSpot.validator';
import { auth, adminOnly } from '../middlewares/auth';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

router.get('/', auth, (req, res) => parkingSpotController.findAll(req, res));
router.post('/', auth, adminOnly, activityLogger('ParkingSpots'), validate(createParkingSpotSchema), (req, res) => parkingSpotController.create(req, res));
router.put('/:id', auth, adminOnly, activityLogger('ParkingSpots'), validate(updateParkingSpotSchema), (req, res) => parkingSpotController.update(req, res));
router.delete('/:id', auth, adminOnly, activityLogger('ParkingSpots'), (req, res) => parkingSpotController.delete(req, res));

export default router;
