const connectDB = require("../config/db");

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }
    next();
  };
};