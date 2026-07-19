const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const ticketCollection = db.collection("tickets");

  return {
    async createTicket(req, res) {

      const totalTickets = await ticketCollection.countDocuments();

      const id = `TK${String(totalTickets + 1).padStart(4, "0")}`;
      const ticketNo = `TN-2026-${String(totalTickets + 1).padStart(4, "0")}`;

      const ticket = {
        ...req.body,
        id,
        ticketNo,
      };

      const result = await ticketCollection.insertOne(ticket);
      console.log(result)
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
        const {
          operator,
          status,
          featured,
          latest,
          limit,
          from,
          to,
          transport,
          date,
        } = req.query;

        const query = {};

        if (from) {
          query.from = {
            $regex: `^${from}$`,
            $options: "i",
          };
        }

        if (to) {
          query.to = {
            $regex: `^${to}$`,
            $options: "i",
          };
        }

        if (transport) {
          query.transport = {
            $regex: `^${transport}$`,
            $options: "i",
          };
        }

        if (date) {
          query.departure = {
            $regex: `^${date}`,
          };
        }
        if (operator) { query.operator = operator }
        if (featured === "true") {
          query.isFeatured = true;
        }


        let cursor = ticketCollection.find(query);

        if (latest === "true") {
          cursor = cursor.sort({ _id: -1 });
        }

        if (limit) {
          cursor = cursor.limit(Number(limit));
        }
        const result = await cursor.sort({ departure: -1, price: 1 }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  }
}