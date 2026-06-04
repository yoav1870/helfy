import express from 'express';
import authController from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import { validateSignup, validateLogin } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
