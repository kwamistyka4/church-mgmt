require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const path = require('path');

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const settingsRoutes = require('./routes/settings');

const app = express();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/church_management',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Global middleware - make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = req.session.error || null;
  res.locals.success = req.session.success || null;
  delete req.session.error;
  delete req.session.success;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/members', memberRoutes);
app.use('/settings', settingsRoutes);

// Home redirect
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/members');
  }
  res.redirect('/auth/login');
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/church_management')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });