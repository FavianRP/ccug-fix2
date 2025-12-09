// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccug')
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Member Schema
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
  tags: [{
    type: String,
    trim: true
  }],
  avatar: {
    type: String,
    default: ''
  },
  blog: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Member = mongoose.model('Member', memberSchema);

// Routes

// Get all members
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
});

// Get single member
app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching member', error: error.message });
  }
});

// Create new member
app.post('/api/members', async (req, res) => {
  try {
    const { name, description, tags, avatar, blog } = req.body;
    
    // Validation
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const member = new Member({
      name,
      description,
      tags: tags || [],
      avatar: avatar || '',
      blog: blog || false
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ message: 'Error creating member', error: error.message });
  }
});

// Update member
app.put('/api/members/:id', async (req, res) => {
  try {
    const { name, description, tags, avatar, blog } = req.body;
    
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        tags: tags || [],
        avatar: avatar || '',
        blog: blog || false
      },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
});

// Delete member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully', member });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member', error: error.message });
  }
});

// ==================== CONTEST ROUTES ====================

const contestSchema = new mongoose.Schema({
  place: { type: Number, required: true },
  event: { type: String, required: true },
  year: { type: Number, required: true },
  rating: { type: Number, required: true },
  ctfPoints: { type: Number, required: true },
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);

// Get all contests
app.get('/api/contests', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const contests = await Contest.find()
      .sort({ rating: -1, place: 1 })
      .limit(limit);
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contests', error: error.message });
  }
});

// Get single contest
app.get('/api/contests/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contest', error: error.message });
  }
});

// Create new contest
app.post('/api/contests', async (req, res) => {
  try {
    const { place, event, year, rating, ctfPoints } = req.body;
    
    // Validation
    if (!place || !event || !year || rating === undefined || ctfPoints === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contest = new Contest({
      place,
      event,
      year,
      rating,
      ctfPoints
    });

    const savedContest = await contest.save();
    res.status(201).json(savedContest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contest', error: error.message });
  }
});

// Update contest
app.put('/api/contests/:id', async (req, res) => {
  try {
    const { place, event, year, rating, ctfPoints } = req.body;
    
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      {
        place,
        event,
        year,
        rating,
        ctfPoints
      },
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contest', error: error.message });
  }
});

// Delete contest
app.delete('/api/contests/:id', async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json({ message: 'Contest deleted successfully', contest });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contest', error: error.message });
  }
});

// ===== POST ROUTES =====

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, default: '' },
  url: { type: String, default: '' }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, category, author, date, description, url } = req.body;
    
    // Validation
    if (!title || !category || !author) {
      return res.status(400).json({ message: 'Title, category, and author are required' });
    }

    const post = new Post({
      title,
      category,
      author,
      date: date || new Date().toISOString().split('T')[0],
      description: description || '',
      url: url || ''
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, category, author, date, description, url } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        author,
        date,
        description: description || '',
        url: url || ''
      },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});