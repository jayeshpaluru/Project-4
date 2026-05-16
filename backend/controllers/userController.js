/* eslint-disable import/extensions */
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import User from '../schema/user.js';

const SALT_ROUNDS = 10;

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function mapUserListItem(user) {
  return {
    _id: user._id.toString(),
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

export function mapUserDetail(user) {
  return {
    _id: user._id.toString(),
    first_name: user.first_name,
    last_name: user.last_name,
    location: user.location,
    description: user.description,
    occupation: user.occupation,
  };
}

export async function listUsers(req, res) {
  try {
    const users = await User.find({}, {
      first_name: 1,
      last_name: 1,
    }).lean();

    return res.json(users.map(mapUserListItem));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const user = await User.findById(userId, {
      first_name: 1,
      last_name: 1,
      location: 1,
      description: 1,
      occupation: 1,
    }).lean();

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.json(mapUserDetail(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function registerUser(req, res) {
  try {
    const {
      login_name: loginName,
      password,
      first_name: firstName,
      last_name: lastName,
      location = '',
      description = '',
      occupation = '',
    } = req.body;

    if (!loginName || !loginName.trim()) {
      return res.status(400).send('login_name is required');
    }

    if (!password || !password.trim()) {
      return res.status(400).send('password is required');
    }

    if (!firstName || !firstName.trim()) {
      return res.status(400).send('first_name is required');
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).send('last_name is required');
    }

    const normalizedLoginName = loginName.trim();
    const existingUser = await User.findOne({ login_name: normalizedLoginName }).lean();
    if (existingUser) {
      return res.status(400).send('login_name already exists');
    }

    const passwordDigest = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      login_name: normalizedLoginName,
      password_digest: passwordDigest,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      location,
      description,
      occupation,
    });

    return res.json({
      ...mapUserDetail(user),
      login_name: user.login_name,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send('login_name already exists');
    }

    return res.status(500).send(err.message);
  }
}
