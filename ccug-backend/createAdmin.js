require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ccug';

const username = process.argv[2] || 'CCUG';
const email = (process.argv[3] || 'admin@ccug.gunadarma.ac.id').toLowerCase();
const password = process.argv[4] || 'ctf_pasti_bisa';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      existing.username = username;
      existing.email = email;
      existing.password = hashedPassword;
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Admin user updated successfully:');
    } else {
      const admin = new User({
        username,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created successfully:');
    }

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Role: admin');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });
