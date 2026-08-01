const express = require("express");

const createTicketController = require("../controllers/ticket.controller");

module.exports = (db, verifyToken) => {
  const router = express.Router();

  const ticketController = createTicketController(db);

  router.get("/", ticketController.getAllTickets);
  router.get("/:ticketId", ticketController.getTicketById);

  router.post("/", verifyToken, ticketController.createTicket);

  router.patch("/:ticketId", verifyToken, ticketController.updateTicket);

  return router;
};