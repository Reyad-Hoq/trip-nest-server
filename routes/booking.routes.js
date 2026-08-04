const express = require("express");

const createBookingController = require("../controllers/booking.controller");
const verifyUser = require("../middleware/verifyUser");

module.exports = (db, verifyToken) => {

  const router = express.Router();

  const bookingController = createBookingController(db);

  router.post("/", bookingController.createBooking);

  router.get("/", verifyToken, verifyUser('user', 'vendor'), bookingController.getBookings);
  router.patch("/:bookingId", verifyToken, verifyUser('vendor'), bookingController.updateBooking);

  return router;

}