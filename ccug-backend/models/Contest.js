const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  place: {
    type: Number,
    default: 0
  },
  rankTitle: {
    type: String,
    trim: true,
    default: 'Finalist'
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: String,
    trim: true,
    default: ''
  },
  year: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  ctfPoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contest', contestSchema);