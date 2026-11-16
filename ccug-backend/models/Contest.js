const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  place: {
    type: Number,
    required: true
  },
  event: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  ctfPoints: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contest', contestSchema);