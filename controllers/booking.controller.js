module.exports = (db) => {

  const bookingCollection = db.collection("bookings");

  return {
    async createBooking(req, res) {
      try {
        const {
          ticketId,
          ticketQuantity,
          userId,
          userName,
          userEmail,
        } = req.body;

        const quantity = Number(ticketQuantity);

        // Find Ticket

        const ticket = await ticketCollection.findOne({
          _id: new ObjectId(ticketId),
        });

        if (!ticket) {
          return res.status(404).send({
            success: false,
            message: "Ticket not found",
          });
        }

        // Departure Check

        if (new Date(ticket.departure) <= new Date()) {
          return res.status(400).send({
            success: false,
            message: "Departure time has already passed.",
          });
        }

        // Quantity Check

        if (quantity <= 0) {
          return res.status(400).send({
            success: false,
            message: "Invalid ticket quantity.",
          });
        }

        // Seat Check

        if (quantity > ticket.availableSeats) {
          return res.status(400).send({
            success: false,
            message: "Not enough available seats.",
          });
        }

        // Booking Object

        const booking = {
          ticketId: ticket._id,
          ticketNo: ticket.ticketNo,

          title: ticket.title,
          transport: ticket.transport,
          operator: ticket.operator,
          image: ticket.image,

          from: ticket.from,
          to: ticket.to,

          departure: ticket.departure,
          arrival: ticket.arrival,

          seatType: ticket.seatType,

          quantity,

          price: ticket.price,
          totalPrice: ticket.price * quantity,

          vendorId: ticket.vendorId,
          vendorName: ticket.vendorName,

          userId,
          userName,
          userEmail,

          status: "Pending",
          paymentStatus: "Unpaid",

          bookedAt: new Date(),
        };

        // Save booking

        await bookingCollection.insertOne(booking);

        // Update seats

        await ticketCollection.updateOne(
          { _id: ticket._id },
          {
            $inc: {
              availableSeats: -quantity,
            },
          }
        );

        res.send({
          success: true,
          message: "Booking Successful",
        });
      } catch (err) {
        console.log(err);

        res.status(500).send({
          success: false,
          message: err.message,
        });
      }
    },
    async getBookings(req, res) {
      const { userId } = req.query;

      const query = {};
      if (userId) {
        query.userId = userId;
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    }
  }
}