/* eslint-disable import/extensions */
import Photo from '../schema/photo.js';
import User from '../schema/user.js';
import { isValidObjectId, mapUserListItem } from './userController.js';

function mapPhotoResponse(photo, userLookup = new Map()) {
  return {
    _id: photo._id.toString(),
    user_id: photo.user_id.toString(),
    file_name: photo.file_name,
    date_time: photo.date_time,
    comments: (photo.comments || []).map((comment) => ({
      _id: comment._id.toString(),
      comment: comment.comment,
      date_time: comment.date_time,
      user: userLookup.get(comment.user_id.toString()) || null,
    })),
  };
}

export async function getPhotosOfUser(req, res) {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).send('User not found');
    }

    const [photos, users] = await Promise.all([
      Photo.find({ user_id: userId }, {
        user_id: 1,
        file_name: 1,
        date_time: 1,
        comments: 1,
      }).lean(),
      User.find({}, {
        first_name: 1,
        last_name: 1,
      }).lean(),
    ]);

    const userLookup = new Map(
      users.map((user) => [user._id.toString(), mapUserListItem(user)]),
    );

    const response = photos.map((photo) => mapPhotoResponse(photo, userLookup));

    return res.json(response);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function createPhoto(req, res) {
  try {
    const trimmedUrl = req.body.url?.trim();

    if (!trimmedUrl) {
      return res.status(400).send('Photo URL is required');
    }

    const photo = await Photo.create({
      file_name: trimmedUrl,
      date_time: new Date(),
      user_id: req.session.userId,
      comments: [],
    });

    return res.status(201).json(mapPhotoResponse(photo));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function addCommentToPhoto(req, res) {
  try {
    const photoId = req.params.id;
    const { comment } = req.body;

    if (!isValidObjectId(photoId)) {
      return res.status(400).send('Invalid photo id');
    }

    if (!comment || !comment.trim()) {
      return res.status(400).send('Comment is required');
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    const newComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: req.session.userId,
    };

    photo.comments.push(newComment);
    await photo.save();

    const savedComment = photo.comments[photo.comments.length - 1];
    return res.json({
      _id: savedComment._id.toString(),
      comment: savedComment.comment,
      date_time: savedComment.date_time,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
