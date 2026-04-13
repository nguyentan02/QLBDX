import { Router } from 'express';
import { vehicleTypeController } from '../controllers/vehicleType.controller';
import { validate } from '../middlewares/validate';
import { createVehicleTypeSchema, updateVehicleTypeSchema } from '../validators/vehicleType.validator';
import { auth, adminOnly } from '../middlewares/auth';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

router.get('/', auth, (req, res) => vehicleTypeController.findAll(req, res));
router.post('/', auth, adminOnly, activityLogger('VehicleTypes'), validate(createVehicleTypeSchema), (req, res) => vehicleTypeController.create(req, res));
router.put('/:id', auth, adminOnly, activityLogger('VehicleTypes'), validate(updateVehicleTypeSchema), (req, res) => vehicleTypeController.update(req, res));
router.delete('/:id', auth, adminOnly, activityLogger('VehicleTypes'), (req, res) => vehicleTypeController.delete(req, res));

export default router;
