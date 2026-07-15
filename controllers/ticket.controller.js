const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const ticketCollection = db.collection("tickets");

  return {
    async createTicket(req, res) {
      const result = await ticketCollection.insertOne(req.body);
      res.send(result);
    },

    async getTicketById(req, res) {
      const { ticketId } = req.params;

      if (!ObjectId.isValid(ticketId)) {
        return res.status(400).send({
          message: "Invalid Ticket ID"
        });
      }

      const ticket = await ticketCollection.findOne({
        _id: new ObjectId(ticketId)
      });

      if (!ticket) {
        return res.status(404).send({
          message: "Ticket Not Found"
        });
      }
      res.send(ticket);
    },

    async getAllTickets(req, res) {

      try {
        const { operator, status, featured, latest, limit } = req.query;

        const query = {};
        let cursor = ticketCollection.find(query);

        if (operator) query.operator = operator;
        if (status) query.status = status;

        // Featured tickets (admin approved)
        if (featured === "true") {
          query.isFeatured = true;
        }


        // Latest tickets
        if (latest === "true") {
          cursor = cursor.sort({ _id: -1 });
        }

        // Limit
        if (limit) {
          cursor = cursor.limit(Number(limit));
        }

        const result = await cursor.toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    }
  }
}