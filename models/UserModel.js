
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    Email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      validate: {
        validator: function (value) {
          // Use a regular expression to check if the email contains the "@" symbol
          return /\S+@\S+\.\S+/.test(value);
        },
        message: 'Invalid email format. Email must contain "@" symbol.',
      },
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [8, 'Too short password'],
      required: [true, 'password required'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
      ],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    FName: {
      type: String,
      minlength: [3, 'Too short Name'],
      max: [100, 'Too long Name'],
      required: [true, 'Name is required'],
    },  
    LName: {
      type: String,
      minlength: [3, 'Too short Name'],
      max: [100, 'Too long Name'],
      required: [true, 'Name is required'],
    },
    Address: {
      type: String,
    },
    Phone: {
      type: String,
      required: [true, 'Phone number is required'],},

    // verificationCode : String,
  } , { timestamps: true });


  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });

// Export the User schema
module.exports = mongoose.model('User', userSchema);