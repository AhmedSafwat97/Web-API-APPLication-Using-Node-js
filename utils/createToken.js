const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET; 

const expiresIn = '20h';

const createToken = (payload) =>
  jwt.sign( payload , secretKey , { expiresIn });

module.exports = createToken;

