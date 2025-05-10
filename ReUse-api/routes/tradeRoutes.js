const express = require('express');
const router = express.Router();
const TradeController = require('../controllers/tradeController');
const authMiddleware = require("../middlewares/authMiddleware");

const tradeController = new TradeController();

router.post('/propose', authMiddleware, tradeController.createTradeProposal.bind(tradeController));

router.get('/', authMiddleware, tradeController.getAll.bind(tradeController));

router.post('/cancel', authMiddleware, tradeController.cancelTrade.bind(tradeController));

router.post('/reject', authMiddleware, tradeController.rejectTrade.bind(tradeController));

router.post('/accept', authMiddleware, tradeController.acceptTrade.bind(tradeController));

module.exports = router;