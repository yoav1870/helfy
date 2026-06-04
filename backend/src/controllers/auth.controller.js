import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';

const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const user = await authService.signup({
        email,
        password,
        firstName,
        lastName,
      });
      const token = authService.generateToken(user.id);
      authService.setTokenCookie(res, token);

      res.status(201).json({
        success: true,
        data: { user },
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await authService.login(email, password);
      const token = authService.generateToken(user.id);
      authService.setTokenCookie(res, token);

      res.status(200).json({
        success: true,
        data: { user },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      authService.clearTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await userService.getProfile(req.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
