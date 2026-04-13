import { Router } from 'express';
import { packageController } from '../controllers/package.controller';
import { validate } from '../middlewares/validate';
import { createPackageSchema, updatePackageSchema } from '../validators/package.validator';
import { auth, adminOnly } from '../middlewares/auth';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

router.get('/', auth, (req, res) => packageController.findAll(req, res));
router.post('/', auth, adminOnly, activityLogger('ParkingPackages'), validate(createPackageSchema), (req, res) => packageController.create(req, res));
router.put('/:id', auth, adminOnly, activityLogger('ParkingPackages'), validate(updatePackageSchema), (req, res) => packageController.update(req, res));
router.delete('/:id', auth, adminOnly, activityLogger('ParkingPackages'), (req, res) => packageController.delete(req, res));

export default router;
