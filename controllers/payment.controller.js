const { ObjectId } = require("mongodb");
const stripe = require("../config/stripe");

module.exports = (db) => {
  const bookingCollection = db.collection("bookings");
  const ticketCollection = db.collection("tickets");
  const transactionCollection = db.collection("transactions");

  return {
    async createCheckoutSession(req, res) {
      try {
        const { bookingId } = req.body;

        const booking = await bookingCollection.findOne({
          _id: new ObjectId(bookingId),
        });

        if (!booking) {
          return res.status(404).json({
            message: "Booking not found",
          });
        }

        if (booking.userEmail !== req.user.email) {
          return res.status(403).json({
            message: "Unauthorized",
          });
        }

        const ticket = await ticketCollection.findOne({
          _id: new ObjectId(booking.ticketId),
        });

        if (!ticket) {
          return res.status(404).json({
            message: "Ticket not found",
          });
        }

        const totalAmount =
          ticket.price * booking.quantity;

        const session = await stripe.checkout.sessions.create({
          mode: "payment",

          payment_method_types: ["card"],

          line_items: [
            {
              price_data: {
                currency: "bdt",

                product_data: {
                  name: ticket.title,
                },

                unit_amount: totalAmount * 100,
              },

              quantity: 1,
            },
          ],
          metadata: {
            bookingId: booking._id.toString(),
            userId: booking.userId,
            ticketId: booking.ticketId.toString(),
          },
          success_url: `${process.env.CLIENT_URL}/dashboard/user/bookings/success?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url: `${process.env.CLIENT_URL}/dashboard/user/bookings`,
        });
        res.json({
          url: session.url,
        });
      } catch (error) {
        console.error("Stripe Error:", error);

        res.status(500).json({
          message: error.message,
          type: error.type,
          code: error.code,
          raw: error.raw,
        });
      }
    },
    async createPaymentVerification(req, res) {
      try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
          return res.status(400).json({
            success: false,
            message: "Payment not completed",
          });
        }

        const bookingId = session.metadata.bookingId;
        

        const booking = await bookingCollection.findOne({
          _id: new ObjectId(bookingId),
        });

        if (!booking) {
          return res.status(404).json({
            success: false,
            message: "Booking not found",
          });
        }

        const result = await bookingCollection.updateOne(
          {
            _id: new ObjectId(bookingId),
          },
          {
            $set: {
              paymentStatus: "paid",
              status: "paid",
              paidAt: new Date(),
              stripeSessionId: session.id,
              paymentIntentId: session.payment_intent,
            },
          }
        );
        const exists = await transactionCollection.findOne({
          stripeSessionId: session.id,
        });

        if (!exists) {
          await transactionCollection.insertOne({
            bookingId: booking._id,
            ticketId: booking.ticketId,
            ticketNo: booking.ticketNo,

            userId: booking.userId,
            userName: booking.userName,
            userEmail: booking.userEmail,

            vendorId: booking.vendorId,
            vendorName: booking.vendorName,

            title: booking.title,

            amount: session.amount_total / 100,
            currency: session.currency,

            stripeSessionId: session.id,
            paymentIntentId: session.payment_intent,

            paymentMethod: "card",
            paymentStatus: "paid",

            createdAt: new Date(),
          });
        }

        return res.json({
          success: true,
          message: "Payment verified successfully",
        });
      } catch (error) {
        console.error(error);

        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    },
    async getUserTransactions(req, res) {
      const transactions = await transactionCollection
        .find({
          userEmail: req.user.email,
        })
        .sort({ createdAt: -1 })
        .toArray();

      res.json(transactions);
    },
    async getVendorRevenue(req, res) {
      try {
       
        const vendorId = req.user._id.toString();
       
        const transactions = await transactionCollection
          .find({
            vendorId,
            paymentStatus: "paid",
          })
          .toArray();

        const totalRevenue = transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        res.json({
          totalRevenue,
          totalTransactions: transactions.length,
          transactions,
        });

      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    }
  };
};