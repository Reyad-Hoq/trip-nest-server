const express = require('express');

const createUserController = require('../controllers/user.controller');

module.exports = (db) => {

  const router = express.Router();

  const userController = createUserController(db);

  router.get('/', userController.getUsers)

  return router;
}