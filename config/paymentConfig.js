const axios = require('axios');

const PAYMOB_API_URL = 'https://accept.paymob.com/api';
const API_KEY = process.env.API_KEY_PAYMOB; // Ensure this is set correctly

const apiClient = axios.create({
  baseURL: PAYMOB_API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`, // Ensure the API key is correctly set
    'Content-Type': 'application/json'
  }
});

module.exports = { apiClient };