require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const ticketRoutes = require("./routes/ticket.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    const db = await connectDB();

    app.use('/api/tickets', ticketRoutes(db));
    app.use('/api/bookings', bookingRoutes(db));

    app.get("/", (req, res) => {
      res.send("Welcome to the TripNest API!");
    });

    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();