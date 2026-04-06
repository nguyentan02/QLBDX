import { Router } from 'express';
import { vehicleTypeController } from '../controllers/vehicleType.controller';
import { validate } from '../middlewares/validate';
import { createVehicleTypeSchema, updateVehicleTypeSchema } from '../validators/vehicleType.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => vehicleTypeController.findAll(req, res));
router.post('/', auth, validate(createVehicleTypeSchema), (req, res) => vehicleTypeController.create(req, res));
router.put('/:id', auth, validate(updateVehicleTypeSchema), (req, res) => vehicleTypeController.update(req, res));
router.delete('/:id', auth, (req, res) => vehicleTypeController.delete(req, res));

export default router;
