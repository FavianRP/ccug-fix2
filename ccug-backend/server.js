require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Member = require('./models/Member');
const Contest = require('./models/Contest');
const Post = require('./models/Post');
const User = require('./models/User');
const { authenticateToken, requireAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
app.set('trust proxy', 1);

// Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://ccug.gunadarma.ac.id'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Ambil dari environment variable yang dikirim Docker Compose
const mongoURI = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB...');

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error details:');
    console.error('Error:', err.message);
  });

// ============= AUTH ROUTES =============

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password, identifier } = req.body;
    const loginId = identifier || email || username;

    // Validasi
    if (!loginId || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    // Cari user berdasarkan email atau username
    const user = await User.findOne({
      $or: [
        { email: loginId.trim().toLowerCase() },
        { username: loginId.trim() }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Buat token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// ============= MEMBERS ROUTES =============

// Get all members (public)
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
});

// Get single member (public)
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

// Create new member (ADMIN ONLY)
app.post('/api/members', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, tags, avatar, joinDate, github, linkedin, ctftime, blog } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const member = new Member({
      name,
      description,
      tags: tags || [],
      avatar: avatar || '',
      joinDate: joinDate || '',
      github: github || '',
      linkedin: linkedin || '',
      ctftime: ctftime || '',
      blog: Boolean(blog)
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ message: 'Error creating member', error: error.message });
  }
});

// Update member (ADMIN ONLY)
app.put('/api/members/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, tags, avatar, joinDate, github, linkedin, ctftime, blog } = req.body;
    
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        tags: tags || [],
        avatar: avatar || '',
        joinDate: joinDate || '',
        github: github || '',
        linkedin: linkedin || '',
        ctftime: ctftime || '',
        blog: Boolean(blog)
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

// Delete member (ADMIN ONLY)
app.delete('/api/members/:id', authenticateToken, requireAdmin, async (req, res) => {
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

// ============= CONTESTS ROUTES =============

// Get all contests (public)
app.get('/api/contests', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const contests = await Contest.find()
      .sort({ year: -1, place: 1 })
      .limit(limit);
    res.json(contests);
  } catch (error) {
    console.error('Fetch contests error:', error);
    res.status(500).json({ message: 'Error fetching contests', error: error.message });
  }
});

// Get single contest (public)
app.get('/api/contests/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest);
  } catch (error) {
    console.error('Fetch contest error:', error);
    res.status(500).json({ message: 'Error fetching contest', error: error.message });
  }
});

// Create new contest (ADMIN ONLY)
app.post('/api/contests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { place, event, year, rating, ctfPoints } = req.body;
    
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
    console.error('Create contest error:', error);
    res.status(500).json({ message: 'Error creating contest', error: error.message });
  }
});

// Update contest (ADMIN ONLY)
app.put('/api/contests/:id', authenticateToken, requireAdmin, async (req, res) => {
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
    console.error('Update contest error:', error);
    res.status(500).json({ message: 'Error updating contest', error: error.message });
  }
});

// Delete contest (ADMIN ONLY)
app.delete('/api/contests/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json({ message: 'Contest deleted successfully', contest });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({ message: 'Error deleting contest', error: error.message });
  }
});

// ============= POSTS ROUTES =============

// Get all posts (public)
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get single post (public)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Fetch post error:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Create new post (ADMIN ONLY)
app.post('/api/posts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, category, author, date, description, url } = req.body;
    
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
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update post (ADMIN ONLY)
app.put('/api/posts/:id', authenticateToken, requireAdmin, async (req, res) => {
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
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post (ADMIN ONLY)
app.delete('/api/posts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully', post });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI}`);
});
