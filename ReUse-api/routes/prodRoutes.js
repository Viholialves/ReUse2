const express = require('express');
const router = express.Router();
const ProdController = require('../controllers/prodController');
const authMiddleware = require("../middlewares/authMiddleware");

const prodController = new ProdController();

router.get('/', authMiddleware, prodController.list.bind(prodController));

router.get('/filter', authMiddleware, prodController.filter.bind(prodController));

router.get('/prod/:id', authMiddleware, prodController.prodById.bind(prodController));

router.post('/create', authMiddleware, prodController.createProd.bind(prodController));

router.get('/prod/user/:user_id', authMiddleware, prodController.getProdAvByUser.bind(prodController));

module.exports = router;