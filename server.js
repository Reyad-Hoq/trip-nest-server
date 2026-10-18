require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const ticketRoutes = require("./routes/ticket.routes");
const bookingRoutes = require("./routes/booking.routes");
const userRoutes = require("./routes/user.routes");
const paymentRoutes = require("./routes/payment.route");

const verifyToken = require("./middleware/verifyToken");

const app = express();

app.use(cors());
app.use(express.json());

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    const db = await connectDB();

    app.use("/api/tickets", ticketRoutes(db, verifyToken));
    app.use("/api/bookings", bookingRoutes(db, verifyToken));
    app.use("/api/users", userRoutes(db, verifyToken));
    app.use("/api/payments", paymentRoutes(db, verifyToken));

    app.get("/", (req, res) => {
      res.send(
        `<h1 style="color: blue; text-align: center;">Welcome to the TripNest API!</h1>
        <p style="text-align: center;">Explore our API endpoints to manage tickets, bookings, users, and payments.</p> <br> <p style="text-align: center;">Developed By Reyad Hoq</p>`,
      );
    });

    app.post("/api/send-email", (req, res) => {
      const { email, name } = req.query;
      console.log(`Email: ${email}, Name: ${name}`);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to TripNest!",
        html: `<h2>Hello ${name}!</h2><p>Thank you for joining TripNest! We're excited to have you on board.</p><p>Best regards,<br>The TripNest Team</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          res.status(500).send("Error sending email");
        } else {
          console.log("Email sent:", info.response);
          res.send("Email sent successfully!");
        }
      });
    });

    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
