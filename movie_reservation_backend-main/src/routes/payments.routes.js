const express= require('express');
const router=express.Router();
const paymentController =require('../controllers/payment.controller');

// Webhook route is now securely mounted in app.js
module.exports=router;