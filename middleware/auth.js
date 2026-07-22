module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.session.error = 'Please log in first.';
    res.redirect('/auth/login');
  },

  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.session.error = 'Access denied. Admin only.';
    res.redirect('/members');
  }
};