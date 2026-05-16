/* eslint-disable import/extensions */
import express from 'express';

import {
  addCommentToPhoto,
  createPhoto,
  getPhotosOfUser,
  togglePhotoLike,
} from '../controllers/photoController.js';
import requireLogin from '../middleware/requireLogin.js';

const router = express.Router();

router.post('/photos', requireLogin, createPhoto);
router.post('/photos/:photoId/like', requireLogin, togglePhotoLike);
router.get('/photosOfUser/:id', requireLogin, getPhotosOfUser);
router.post('/commentsOfPhoto/:id', requireLogin, addCommentToPhoto);

export default router;
