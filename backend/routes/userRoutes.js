/* eslint-disable import/extensions */
import express from 'express';

import requireLogin from '../middleware/requireLogin.js';
import {
  getUser,
  listUsers,
  registerUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.get('/list', requireLogin, listUsers);
router.get('/:id', requireLogin, getUser);

export default router;
