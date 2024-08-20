const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Cart = require('../models/CartModel');

// Define Paymob credentials
const PAYMOB_API_URL = 'https://accept.paymob.com/api';
const API_KEY = process.env.PAYMOB_API_KEY; // Your Paymob API key
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID; // Your Paymob integration ID

// Create an Axios instance for API calls
const apiClient = axios.create({
  baseURL: PAYMOB_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// @desc    Create Paymob Payment Link
// @route   POST /api/v1/paymob/:cartId
// @access  Private
exports.createPaymentLink = asyncHandler(async (req, res) => {
  const { cartId } = req.params;

  if (!cartId) {
    return res.status(400).json({ error: 'Cart ID is required' });
  }

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    const cart = await Cart.findOne({ _id: cartId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    console.log('Total Amount:', totalAmount);

    // Step 1: Authenticate with Paymob to get a payment token
    const authResponse = await apiClient.post('/auth/tokens', { api_key: API_KEY });
    const authToken = authResponse.data.token;

    if (!authToken) {
      throw new Error('Failed to authenticate with Paymob');
    }

    // Step 2: Create an order
    const orderResponse = await apiClient.post('/ecommerce/orders', {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: totalAmount * 100, // Convert to cents
      currency: 'EGP',
      items: cart.items.map(item => ({
        name: item.product.Name,
        amount_cents: item.product.price * item.quantity * 100, // Convert to cents
        quantity: item.quantity,
      })),
    });
    const orderId = orderResponse.data.id;

    if (!orderId) {
      throw new Error('Failed to create order with Paymob');
    }

    // Step 3: Generate a payment key
    const paymentKeyResponse = await apiClient.post('/acceptance/payment_keys', {
      auth_token: authToken,
      amount_cents: totalAmount * 100, // Convert to cents
      expiration: 3600, // 1 hour expiration
      order_id: orderId,
      billing_data: {
        apartment: "NA", // Required fields by Paymob, adjust as necessary
        email: "email@example.com", // Replace with actual data
        floor: "NA",
        first_name: "NA",
        street: "NA",
        building: "NA",
        phone_number: "+201000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "NA",
        last_name: "NA",
        state: "NA"
      },
      currency: 'EGP',
      integration_id: INTEGRATION_ID,
    });
    const paymentKey = paymentKeyResponse.data.token;

    if (!paymentKey) {
      throw new Error('Failed to generate payment key with Paymob');
    }

    // Step 4: Generate payment link using iframe with a redirect URL
    const paymentLink = `https://accept.paymob.com/api/acceptance/iframes/862705?payment_token=${paymentKey}&iframe_close=true`;

    res.status(201).json({
      paymentLink, // Return the payment link to the client
    });
  } catch (error) {
    console.error('Payment link creation failed:', error);

    // Sending back a more detailed error response
    res.status(500).json({
      error: error.message,
      details: error.response ? error.response.data : null,
    });
  }
}); 