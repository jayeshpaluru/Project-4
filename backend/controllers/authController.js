/* eslint-disable import/extensions */
import bcrypt from 'bcrypt';

import User from '../schema/user.js';
import { mapUserDetail } from './userController.js';

export async function getCurrentUser(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).send('Not logged in');
    }

    const user = await User.findById(req.session.userId, {
      first_name: 1,
      last_name: 1,
      location: 1,
      description: 1,
      occupation: 1,
    }).lean();

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).send('Not logged in');
    }

    return res.json(mapUserDetail(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function login(req, res) {
  try {
    const { login_name: loginName, password } = req.body;

    if (!loginName || !password) {
      return res.status(400).send('Invalid login');
    }

    const user = await User.findOne({ login_name: loginName });
    if (!user) {
      return res.status(400).send('Invalid login');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_digest);
    if (!passwordMatches) {
      return res.status(400).send('Invalid login');
    }

    req.session.userId = user._id.toString();
    return res.json(mapUserDetail(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export function logout(req, res) {
  if (!req.session.userId) {
    return res.status(400).send('No user is currently logged in');
  }

  return req.session.destroy((err) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    return res.sendStatus(200);
  });
}
