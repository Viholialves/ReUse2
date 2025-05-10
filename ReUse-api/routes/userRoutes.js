const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require("../middlewares/authMiddleware");

const userController = new UserController();

router.get('/rating/:id', authMiddleware, userController.rating.bind(userController));

module.exports = router;