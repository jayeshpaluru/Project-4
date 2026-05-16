/* eslint-disable import/extensions */
import express from 'express';

import {
  getCurrentUser,
  login,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/me', getCurrentUser);
router.post('/login', login);
router.post('/logout', logout);

export default router;
