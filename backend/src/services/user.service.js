import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Address from '../models/Address.model.js';
import { NotFoundError, UnauthorizedError, ConflictError } from '../utils/errors.js';

const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  async updateProfile(userId, userData) {
    const { firstName, lastName, email } = userData;

    // Check if email is taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Email already in use');
      }
    }

    return User.update(userId, { firstName, lastName, email });
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByEmail((await User.findById(userId)).email);

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, passwordHash);
  },

  async getAddresses(userId) {
    return Address.findByUserId(userId);
  },

  async addAddress(userId, addressData) {
    return Address.create(userId, addressData);
  },

  async updateAddress(userId, addressId, addressData) {
    const address = await Address.findById(addressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundError('Address not found');
    }
    return Address.update(addressId, userId, addressData);
  },

  async deleteAddress(userId, addressId) {
    const address = await Address.findById(addressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundError('Address not found');
    }
    await Address.delete(addressId, userId);
  },
};

export default userService;
