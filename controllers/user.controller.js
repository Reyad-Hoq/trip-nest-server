
module.exports = (db) => {
  const userCollection = db.collection('user');

  return {
    async getUsers(req, res) {
      const user = await userCollection.find({
        role: { $in: ['user', 'vendor'] }
      }).toArray();

      res.send(user);
    }
  }
}