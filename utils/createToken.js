const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET; 

const expiresIn = '1000h';

const createToken = (payload) =>
  jwt.sign( payload , secretKey , { expiresIn });

module.exports = createToken;

