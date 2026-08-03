const connectDB = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const db = await connectDB();

    const sessionCollection = db.collection("session");
    const userCollection = db.collection("user");

    const authHeader = req.headers?.authorization;

    if (!authHeader) {
      return res.status(401).send({
        message: "Unauthorized Access",
      });
    }

    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        message: "Unauthorized Access",
      });
    }
    const query = { token: token };
    const session = await sessionCollection.findOne(query);
    if (!session) {
      return res.status(401).send({
        message: "Invalid Token",
      });
    }
    const userId = session.userId;
    console.log(userId);

    const userQuery = { _id: userId };
    const user = await userCollection.findOne(userQuery);
    if (!user) {
      return res.status(401).send({
        message: "Invalid User",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};