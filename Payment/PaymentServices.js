const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Cart = require('../models/CartModel');
const ConfirmedCart = require('../models/ConfirmedCartsModel');
const jwt = require('jsonwebtoken');

const PAYMOB_API_URL = 'https://accept.paymob.com/api';
const API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const apiClient = axios.create({
  baseURL: PAYMOB_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

exports.createPaymentLink = asyncHandler(async (req, res) => {
  const { cartId  } = req.params;
  const { baseFrontServer } = req.query;  // Retrieve baseFrontServer from the query parameters

  const {
    floor,
    street,
    building,
    city,
    last_name
}= req.body;

  if (!cartId) {
    return res.status(400).json({ error: 'Cart ID is required' });
  }

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const Name = decodedToken.name;
  const Email = decodedToken.email;
  const Phone = decodedToken.Phone;

  try {
    const cart = await Cart.findOne({ _id: cartId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const authResponse = await apiClient.post('/auth/tokens', { api_key: API_KEY });
    const authToken = authResponse.data.token;

    const orderResponse = await apiClient.post('/ecommerce/orders', {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: totalAmount * 100,
      currency: 'EGP',
      items: cart.items.map(item => ({
        name: item.product.Name,
        amount_cents: item.product.price * item.quantity * 100,
        quantity: item.quantity,
      })),
    });
    const orderId = orderResponse.data.id;

        // Update the cart with the orderId
        cart.orderId = orderId;
        cart.baseRedirectLink = baseFrontServer; // Set baseRedirectLink to baseFrontServer

        // Save the updated cart
        await cart.save();

    const paymentKeyResponse = await apiClient.post('/acceptance/payment_keys', {
      auth_token: authToken,
      amount_cents: totalAmount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: 'NA',
        email: Email,
        floor: floor || 'NA',
        first_name: Name || 'NA',
        street: street || 'NA',
        building: building || 'NA',
        phone_number: Phone || '+201000000000',
        shipping_method: 'NA',
        city: city || 'NA',
        last_name: last_name || 'NA',
        country: 'Egypt'
      },
      currency: 'EGP',
      integration_id: INTEGRATION_ID,
    });

    const paymentKey = paymentKeyResponse.data.token;

    const paymentLink = `https://accept.paymob.com/api/acceptance/iframes/862704?payment_token=${paymentKey}&iframe_close=true`;

    // Immediately send the payment link to the client while polling for status
    res.status(201).json({ paymentLink , status : "Success" });

  } catch (error) {
    console.error('Payment link creation failed:', error);
    res.status(500).json({ error: error.message, details: error.details});
  }
});

