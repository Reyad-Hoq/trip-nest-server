const express = require('express');

const createUserController = require('../controllers/user.controller');

module.exports = (db, verifyToken) => {

  const router = express.Router();

  const userController = createUserController(db);

  router.get('/', verifyToken, userController.getUsers)
  router.patch('/:userId', verifyToken, userController.updateUser)
  return router;
}