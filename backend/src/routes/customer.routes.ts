import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { validate } from '../middlewares/validate';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';
import { auth, adminOnly } from '../middlewares/auth';
import { activityLogger } from '../middlewares/activityLogger';

const router = Router();

router.get('/', auth, (req, res) => customerController.findAll(req, res));
router.get('/:id', auth, (req, res) => customerController.findById(req, res));
router.post('/', auth, activityLogger('Customers'), validate(createCustomerSchema), (req, res) => customerController.create(req, res));
router.put('/:id', auth, activityLogger('Customers'), validate(updateCustomerSchema), (req, res) => customerController.update(req, res));
router.delete('/:id', auth, adminOnly, activityLogger('Customers'), (req, res) => customerController.delete(req, res));

export default router;
