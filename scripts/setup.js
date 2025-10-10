// Database setup script - Run this to create demo users
// Usage: node scripts/setup.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple User model for setup
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

async function setupDatabase() {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtime-analytics';
    console.log('Connecting to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Hide credentials
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create demo users
    const demoUsers = [
      {
        username: 'admin',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'viewer',
        email: 'viewer@demo.com',
        password: 'viewer123',
        role: 'viewer'
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\nDemo Login Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Viewer: viewer@demo.com / viewer123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📝 Disconnected from MongoDB');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };