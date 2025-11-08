// models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // For Google OAuth
  googleId: {
    type: String,
    sparse: true, // Allows null for non-Google users
    unique: true,
  },

  // For traditional signup
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v),
      message: props => `${props.value} is not a valid Gmail address!`
    }
  },

  password: {
    type: String,
    // Not required for Google OAuth users
    required: function () {
      return !this.googleId;
    },
    minlength: 6,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },



  emailVerified: {
    type: Boolean,
    default: false,
  },

  authProvider: {
    type: String,
    enum: ['google', 'local'],
    default: 'local',
  },


  lastLogin: {
    type: Date,
    default: Date.now,
  },

}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('No password set for this user');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// // Method to get public profile
// userSchema.methods.toJSON = function() {
//   const user = this.toObject();
//   delete user.password;
//   delete user.__v;
//   return user;
// };

const User = mongoose.model('User', userSchema);

export default User;