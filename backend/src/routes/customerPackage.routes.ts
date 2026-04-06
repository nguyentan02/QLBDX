import { Router } from 'express';
import { customerPackageController } from '../controllers/customerPackage.controller';
import { validate } from '../middlewares/validate';
import { createCustomerPackageSchema, updateCustomerPackageSchema } from '../validators/customerPackage.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => customerPackageController.findAll(req, res));
router.post('/', auth, validate(createCustomerPackageSchema), (req, res) => customerPackageController.create(req, res));
router.put('/:id', auth, validate(updateCustomerPackageSchema), (req, res) => customerPackageController.update(req, res));
router.delete('/:id', auth, (req, res) => customerPackageController.delete(req, res));
router.get('/check/:vehicleId', auth, (req, res) => customerPackageController.checkActivePackage(req, res));

export default router;
