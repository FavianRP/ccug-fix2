// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ccug')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const hashedPassword = await bcrypt.hash('ccugSecretAdmin', 10);
    
    const admin = new User({
      username: 'adminCCUG',
      email: 'admin@cybercomug.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created!');
    console.log('Email: admin@cybercomug.com');
    console.log('Password: ccugSecretAdmin');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });