/* eslint-disable no-console */
/* eslint-disable import/extensions */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import crypto from 'crypto';

import authRoutes from './routes/authRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1/project4';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000/index.html';
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const isProduction = process.env.NODE_ENV === 'production';

// Enable CORS for frontend running on a different port
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  },
}));

app.get('/', (req, res) => {
  res.redirect(frontendUrl);
});

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/admin', authRoutes);
app.use('/user', userRoutes);
app.use('/', photoRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
