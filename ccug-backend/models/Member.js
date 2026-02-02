const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  avatar: {
    type: String,
    default: ''
  },
  blog: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', memberSchema);