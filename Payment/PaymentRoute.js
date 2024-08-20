const express = require('express');


const { createPaymentLink } = require('../Payment/PaymentServices'); // createPaymentLink = require('../Payment/PaymentServices');

const router = express.Router();

router.post("/:cartId", createPaymentLink);

module.exports = router;



