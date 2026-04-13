import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { validate } from '../middlewares/validate';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator';
import { auth, adminOnly } from '../middlewares/auth';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

router.get('/', auth, (req, res) => vehicleController.findAll(req, res));
router.get('/by-plate/:plate', auth, (req, res) => vehicleController.findByPlate(req, res));
router.get('/:id', auth, (req, res) => vehicleController.findById(req, res));
router.post('/', auth, activityLogger('Vehicles'), validate(createVehicleSchema), (req, res) => vehicleController.create(req, res));
router.put('/:id', auth, activityLogger('Vehicles'), validate(updateVehicleSchema), (req, res) => vehicleController.update(req, res));
router.delete('/:id', auth, adminOnly, activityLogger('Vehicles'), (req, res) => vehicleController.delete(req, res));

export default router;
