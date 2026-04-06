import { Router } from 'express';
import { parkingZoneController } from '../controllers/parkingZone.controller';
import { validate } from '../middlewares/validate';
import { createParkingZoneSchema, updateParkingZoneSchema } from '../validators/parkingZone.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => parkingZoneController.findAll(req, res));
router.post('/', auth, validate(createParkingZoneSchema), (req, res) => parkingZoneController.create(req, res));
router.put('/:id', auth, validate(updateParkingZoneSchema), (req, res) => parkingZoneController.update(req, res));
router.delete('/:id', auth, (req, res) => parkingZoneController.delete(req, res));

export default router;
