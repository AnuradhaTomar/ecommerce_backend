const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware')

router.get('/', auth, productController.getAllProducts);
router.post('/', auth, productController.addProduct);
router.get('/:id', auth, productController.getProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
