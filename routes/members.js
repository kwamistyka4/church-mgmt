const router = require('express').Router();
const Member = require('../models/Member');
const { isAuthenticated } = require('../middleware/auth');

// GET all members (dashboard)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { search, department, page = 1 } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    const total = await Member.countDocuments(filter);
    const members = await Member.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render('members/index', {
      members,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      search: search || '',
      department: department || ''
    });
  } catch (err) {
    console.error('Fetch members error:', err);
    req.session.error = 'Failed to load members.';
    res.render('members/index', {
      members: [],
      currentPage: 1,
      totalPages: 0,
      search: '',
      department: ''
    });
  }
});

// GET create member form
router.get('/create', isAuthenticated, (req, res) => {
  res.render('members/create');
});

// POST create member
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const member = new Member({
      ...req.body,
      createdBy: req.session.user.id
    });
    await member.save();
    req.session.success = 'Member added successfully!';
    res.redirect('/members');
  } catch (err) {
    console.error('Create member error:', err);
    req.session.error = 'Failed to create member.';
    res.redirect('/members/create');
  }
});

// GET edit member form
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      req.session.error = 'Member not found.';
      return res.redirect('/members');
    }
    res.render('members/edit', { member });
  } catch (err) {
    console.error('Edit member error:', err);
    req.session.error = 'Failed to load member.';
    res.redirect('/members');
  }
});

// POST update member
router.post('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    await Member.findByIdAndUpdate(req.params.id, req.body);
    req.session.success = 'Member updated successfully!';
    res.redirect('/members');
  } catch (err) {
    console.error('Update member error:', err);
    req.session.error = 'Failed to update member.';
    res.redirect(`/members/${req.params.id}/edit`);
  }
});

// POST delete member
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    req.session.success = 'Member deleted successfully!';
    res.redirect('/members');
  } catch (err) {
    console.error('Delete member error:', err);
    req.session.error = 'Failed to delete member.';
    res.redirect('/members');
  }
});

// GET view single member
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      req.session.error = 'Member not found.';
      return res.redirect('/members');
    }
    res.render('members/view', { member });
  } catch (err) {
    console.error('View member error:', err);
    req.session.error = 'Failed to load member.';
    res.redirect('/members');
  }
});

module.exports = router;