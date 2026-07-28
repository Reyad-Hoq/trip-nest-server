const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const userCollection = db.collection('user');

  return {
    async getUsers(req, res) {
      const user = await userCollection.find({
        role: { $in: ['user', 'vendor'] }
      }).toArray();

      res.send(user);
    },
    async updateUser(req, res) {
      try {
        const { userId } = req.params;

        const result = await userCollection.updateOne({ _id: new ObjectId(userId) },
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