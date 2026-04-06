import { Router } from 'express';
import { packageController } from '../controllers/package.controller';
import { validate } from '../middlewares/validate';
import { createPackageSchema, updatePackageSchema } from '../validators/package.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => packageController.findAll(req, res));
router.post('/', auth, validate(createPackageSchema), (req, res) => packageController.create(req, res));
router.put('/:id', auth, validate(updatePackageSchema), (req, res) => packageController.update(req, res));
router.delete('/:id', auth, (req, res) => packageController.delete(req, res));

export default router;
