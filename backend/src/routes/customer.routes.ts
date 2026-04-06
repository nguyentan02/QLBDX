import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { validate } from '../middlewares/validate';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/', auth, (req, res) => customerController.findAll(req, res));
router.get('/:id', auth, (req, res) => customerController.findById(req, res));
router.post('/', auth, validate(createCustomerSchema), (req, res) => customerController.create(req, res));
router.put('/:id', auth, validate(updateCustomerSchema), (req, res) => customerController.update(req, res));
router.delete('/:id', auth, (req, res) => customerController.delete(req, res));

export default router;
