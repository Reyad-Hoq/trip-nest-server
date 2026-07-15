const express = require("express");

const createTicketController = require("../controllers/ticket.controller");

module.exports = (db) => {
  const router = express.Router();

  const ticketController = createTicketController(db);

  router.get("/", ticketController.getAllTickets);
  router.get("/:ticketId", ticketController.getTicketById);

  router.post("/", ticketController.createTicket)

  return router;
};