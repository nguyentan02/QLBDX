import { Router } from 'express';
import { parkingZoneController } from '../controllers/parkingZone.controller';
import { validate } from '../middlewares/validate';
import { createParkingZoneSchema, updateParkingZoneSchema } from '../validators/parkingZone.validator';
import { auth, adminOnly } from '../middlewares/auth';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

router.get('/', auth, (req, res) => parkingZoneController.findAll(req, res));
router.post('/', auth, adminOnly, activityLogger('ParkingZones'), validate(createParkingZoneSchema), (req, res) => parkingZoneController.create(req, res));
router.put('/:id', auth, adminOnly, activityLogger('ParkingZones'), validate(updateParkingZoneSchema), (req, res) => parkingZoneController.update(req, res));
router.delete('/:id', auth, adminOnly, activityLogger('ParkingZones'), (req, res) => parkingZoneController.delete(req, res));

export default router;
