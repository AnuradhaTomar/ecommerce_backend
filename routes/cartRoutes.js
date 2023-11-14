const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, cartController.getUserCart);

router.post('/', auth, cartController.addToCart);

router.delete('/:productId', auth, cartController.removeFromCart);

module.exports = router;
