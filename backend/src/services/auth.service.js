import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors.js';

const authService = {
  async signup(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    return user;
  },

  async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Remove password from response
    delete user.password_hash;

    return user;
  },

  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  },

  setTokenCookie(res, token) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  },

  clearTokenCookie(res) {
    res.clearCookie('token');
  },
};

export default authService;
