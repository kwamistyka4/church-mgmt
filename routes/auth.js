const router = require('express').Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// GET login page
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/members');
  res.render('login');
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      req.session.error = 'Invalid username or password.';
      return res.redirect('/auth/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.session.error = 'Invalid username or password.';
      return res.redirect('/auth/login');
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    };

    req.session.success = `Welcome back, ${user.fullName || user.username}!`;
    res.redirect('/members');
  } catch (err) {
    console.error('Login error:', err);
    req.session.error = 'Login failed. Please try again.';
    res.redirect('/auth/login');
  }
});

// GET register page
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/members');
  res.render('register');
});

// POST register
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      req.session.error = 'Username already taken.';
      return res.redirect('/auth/register');
    }

    const user = new User({
      username: username.toLowerCase().trim(),
      password,
      fullName,
      role: role || 'staff'
    });

    await user.save();

    req.session.success = 'Registration successful! Please log in.';
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Register error:', err);
    req.session.error = 'Registration failed. Please try again.';
    res.redirect('/auth/register');
  }
});

// GET logout
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;