const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
// const ApiError = require('../utils/apiError');
// const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');

const User = require('../models/UserModel');

// @desc    Signup
// @route   Post /api/v1/auth/signup
// @access  Public
exports.Signup = asyncHandler(async (req, res, next) => {
    const { Email } = req.body;
  
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ Email });
  
    if (existingUser) {
      // If the email already exists, return an error
      return res.status(400).json({ error: 'Email already in use' });
    }
  
    // If the email is unique, create the new user
    const user = await User.create(req.body);
  
    res.status(201).json({ data: user, message : "user created successfully" });
  });
  
// @desc    Login
// @route   Post /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {

    const { Email } = req.body;

    // 1) check if password and email in the body (validation)
    // 2) check if user exist & check if password is correct
    const user = await User.findOne({ Email });
  
    if (!user) {
       // If the email already exists, return an error
       return res.status(400).json({ error: 'invalid Email' });
    }

    // Compare the password
      const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid Password' });
      }

      const userObject = {
        sub : "Login Token",
        userId : user._id ,
        email : user.Email ,
        Name : user.Name,
        Phone : user.Phone
      }

    // 3) generate token
    const token = createToken(userObject);
  
    // Delete password from response
    delete user._doc.password;
    // 4) send response to client side
    res.status(200).json({ data: user, token , message : "user logged in successfully" });

  });

// @desc   get specific user
// @route   GET /api/v1/LoginUser
// @access  Private

exports.getUserData = asyncHandler(async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
  }

  try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID in token
      const user = await User.findById(decoded.userId);

      if (!user) {
          return res.status(404).json({ msg: 'No user found for this token' });
      }

      // Respond with user data
      res.status(200).json({ data: user });
  } catch (error) {
      res.status(401).json({ msg: 'Not authorized, token failed', details: error.message });
  }
});




