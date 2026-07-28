const express = require("express");

const createBookingController = require("../controllers/booking.controller")

module.exports = (db) => {

  const router = express.Router();

  const bookingController = createBookingController(db);

  router.post("/", bookingController.createBooking);

  router.get("/", bookingController.getBookings);
  router.patch("/:bookingId", bookingController.updateBooking);

  return router;

}