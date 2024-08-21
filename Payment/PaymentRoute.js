const express = require('express');


const { createPaymentLink } = require('../Payment/PaymentServices'); // createPaymentLink = require('../Payment/PaymentServices');

const { paymentWebhook } = require('../Payment/PaymentHook');
const router = express.Router();

router.post("/:cartId", createPaymentLink);

router.get("/webhook" , paymentWebhook)

module.exports = router;



