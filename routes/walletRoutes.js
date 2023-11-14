const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/authMiddleware')

router.post('/topup', auth, walletController.topUp);
router.post('/withdraw', auth, walletController.withdraw);
router.post('/transactions', auth, walletController.makeTransaction);
router.get('/balance', auth, walletController.balance);
router.get('/transactions', auth, walletController.transactions);



module.exports = router;
