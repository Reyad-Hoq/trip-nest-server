const connectDB = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const db = await connectDB();

    const sessionCollection = db.collection("session");
    const userCollection = db.collection("user");

    if (req.user?.role !== 'user') {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }
    console.log(req.user);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};