require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();

    const database = client.db('tripnest_db');

    const ticketCollection = database.collection('tickets');
    const bookingCollection = database.collection("bookings");

    app.post('/api/tickets', async (req, res) => {
      const ticket = req.body;
      const result = await ticketCollection.insertOne(ticket);
      res.send(result)
    })

    app.get("/api/tickets/:ticketId", async (req, res) => {
      const { ticketId } = req.params;

      if (!ObjectId.isValid(ticketId)) {
        return res.status(400).send({
          message: "Invalid Ticket ID",
        });
      }

      const result = await ticketCollection.findOne({
        _id: new ObjectId(ticketId),
      });

      if (!result) {
        return res.status(404).send({
          message: "Ticket not found",
        });
      }

      res.send(result);
    });

    app.get("/api/tickets", async (req, res) => {
      try {
        const { operator, status, featured, latest, limit } = req.query;

        const query = {};

        if (operator) query.operator = operator;
        if (status) query.status = status;

        // Featured tickets (admin approved)
        if (featured === "true") {
          query.isFeatured = true; // অথবা query.featured = true
        }

        let cursor = ticketCollection.find(query);

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
    });

    app.post("/api/bookings", async (req, res) => {
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
    });
    app.get("/api/bookings", async (req, res) => {
      const { userId } = req.query;

      const query = {};
      if (userId) {
        query.userId = userId;
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  console.log('params', req.params)
  res.send('Hello World! This is Tripnest server running on port 8000')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})