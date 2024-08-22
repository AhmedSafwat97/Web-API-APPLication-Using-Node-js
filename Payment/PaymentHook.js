const ConfirmedCart = require('../models/ConfirmedCartsModel');
const Cart = require('../models/CartModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Webhook to handle Paymob payment status
// @route   POST /api/v1/paymob/webhook
// @access  Public (Called by Paymob)
exports.paymentWebhook = asyncHandler(async (req, res) => {
  const { success, order, amount_cents } = req.query;

  console.log('Incoming request query:', req.query);

  if (!success || !order || !amount_cents) {
    return res.status(400).json({ error: 'Required parameters are missing' });
  }

  try {
    console.log('Received order ID:', order);

    // Assuming `order` corresponds to a field `orderId` in your Cart model


    if (success === 'true') {

        const cart = await Cart.findOne({ orderId: order });

        if (!cart) {
          return res.status(404).json({ error: 'Cart not found' });
        }

      const confirmedCart = new ConfirmedCart({
        user: cart.user,
        items: cart.items,
        totalAmount: amount_cents / 100,
        createdAt: cart.createdAt
      });

      await confirmedCart.save();
      await Cart.findOneAndDelete({ orderId: order });

      // Redirect to success page
      return res.redirect(`${process.env.REDIRECT_LINK}`);
    } else {
      // Redirect to failure page
      return res.redirect(`https://accept.paymobsolutions.com/api/acceptance/post_pay`);
    }
  } catch (error) {
    console.error('Webhook handling failed:', error);
    return res.status(500).json({ error: error.message });
  }
});