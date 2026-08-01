const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const ticketCollection = db.collection("tickets");
  const userCollection = db.collection('user');

  return {
    async createTicket(req, res) {
      const vendor = await userCollection.findOne({
        _id: new ObjectId(req.body.vendorId),
      });
      if (vendor.status === "blocked") {
        return res.status(403).send({
          success: false,
          message: "Your account has been blocked. You cannot create tickets.",
        });
      }
      const totalTickets = await ticketCollection.countDocuments();

      const id = `TK${String(totalTickets + 1).padStart(4, "0")}`;
      const ticketNo = `TN-2026-${String(totalTickets + 1).padStart(4, "0")}`;
      let status = "pending"
      let featured = false;
      const ticket = {
        ...req.body,
        id,
        ticketNo,
        status,
        featured,
        price: Number(req.body.price),
        availableSeats: Number(req.body.availableSeats)
      };

      const result = await ticketCollection.insertOne(ticket);
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
          page = 1,
          limit = 9,
          vendorId,
          operator,
          status,
          featured,
          latest,
          from,
          to,
          transport,
          date,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 9);

        const query = {};

        if (status && status !== "all") {
          query.status = status;
        }

        const blockedVendors = await userCollection.find(
          {
            role: "vendor",
            status: "blocked",
          },
          {
            projection: { _id: 1 },
          }
        ).toArray();

        const blockedVendorIds = blockedVendors.map(v => v._id.toString());

        if (vendorId) {
          if (blockedVendorIds.includes(vendorId)) {
            return res.send([]);
          }

          query.vendorId = vendorId;
        } else {
          query.vendorId = {
            $nin: blockedVendorIds,
          };
        }

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
          query.featured = true;
        }

        // if (featured && featured !== "all") {
        //   query.featured = featured;
        // }
        let cursor = ticketCollection.find(query);

        let sortOption = {};

        if (latest === "true") {
          sortOption = { _id: -1 };
        } else {
          sortOption = {
            departure: 1,
            price: 1,
          };
        }

        const total = await ticketCollection.countDocuments(query);

        const result = await cursor
          .sort(sortOption)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .toArray();

        res.send({
          tickets: result,
          total,
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    },
    async updateTicket(req, res) {
      try {
        const { ticketId } = req.params;

        const result = await ticketCollection.updateOne({ _id: new ObjectId(ticketId) },
          {
            $set: req.body,
          });

        res.send(result)
      } catch (err) {
        console.log(err);

        res.status(500).send({
          success: false,
          message: err.message,
        });
      }
    }
  }
}