import express from 'express';
import userController from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';
import { validateAddress } from '../validators/address.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

router.get('/addresses', userController.getAddresses);
router.post('/addresses', validateAddress, userController.addAddress);
router.put('/addresses/:addressId', validateAddress, userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

export default router;
