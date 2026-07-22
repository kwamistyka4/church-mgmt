const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', ''],
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', ''],
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  baptismDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);