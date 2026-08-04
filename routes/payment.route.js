const express = require("express");
const createPaymentController = require("../controllers/payment.controller");

module.exports = (db, verifyToken) => {
  const router = express.Router();

  const paymentController = createPaymentController(db);

  router.post(
    "/create-checkout-session",
    verifyToken,
    paymentController.createCheckoutSession
  );
  router.get(
    "/verify/:sessionId",
    verifyToken,
    paymentController.createPaymentVerification
  );
  router.get(
    "/transactions",
    verifyToken,
    paymentController.getUserTransactions
  );
  router.get(
    "/vendor/revenue",
    verifyToken,
    paymentController.getVendorRevenue
  );
  return router;
};