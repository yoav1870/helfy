import userService from '../services/user.service.js';

const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, email } = req.body;
      const user = await userService.updateProfile(req.userId, {
        firstName,
        lastName,
        email,
      });

      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(req.userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getAddresses(req, res, next) {
    try {
      const addresses = await userService.getAddresses(req.userId);

      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  },

  async addAddress(req, res, next) {
    try {
      const address = await userService.addAddress(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: address,
        message: 'Address added successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAddress(req, res, next) {
    try {
      const address = await userService.updateAddress(req.userId, req.params.addressId, req.body);

      res.status(200).json({
        success: true,
        data: address,
        message: 'Address updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAddress(req, res, next) {
    try {
      await userService.deleteAddress(req.userId, req.params.addressId);

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
