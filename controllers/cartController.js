const Cart = require('../models/Cart');
const Product = require('../models/Product');

const sendSuccessResponse = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({ message, data });
};

const sendErrorResponse = (res, statusCode = 500, message = 'Server Error') => {
  res.status(statusCode).json({ message });
};

const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart) {
      return sendSuccessResponse(res, [], 200, 'Cart is empty');
    }

    sendSuccessResponse(res, cart);
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const addToCart = async (req, res) => {
  const { _id, quantity } = req.body;
  const productId = _id;
  const userId = req.user.id;

  try {
      let cart = await Cart.findOne({ userId });

      if (!cart) {
          cart = new Cart({ userId, products: [], totalAmount: 0 });
      }

      const existingProductIndex = cart.products.findIndex(product => product.productId.equals(productId));

      if (existingProductIndex !== -1) {
          cart.products[existingProductIndex].quantity += quantity;
      } else {
          cart.products.push({ productId, quantity });
      }

      
      cart.totalAmount = await calculateTotalAmount(cart.products);
      console.log(cart.totalAmount);

      await cart.save();
      sendSuccessResponse(res, cart.products, 200, 'Product added to cart successfully');
  } catch (err) {
      console.error(err.message);
      sendErrorResponse(res);
  }
};

const calculateTotalAmount = async (products) => {
  console.log("products", products);

  let totalAmount = 0;

  for (const item of products) {
    try {
      const product = await Product.findById(item.productId);

      if (!product) {
        console.error(`Product with ID ${item.productId} not found`);
        continue;
      }

      totalAmount += product.price * item.quantity;
      console.log("totalAmount", totalAmount);
    } catch (error) {
      console.error(error.message);
    }
  }

  return totalAmount;
};


const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    const removedProduct = cart.products.find(product => product._id.equals(productId));

    if (!cart || !removedProduct) {
      return sendErrorResponse(res, 404, 'Product not found in the cart');
    }

    const deduction = removedProduct.productId.price * removedProduct.quantity;
    cart.totalAmount -= deduction;

    cart.products.pull({ _id: productId });

    const updatedCart = await cart.save();

    sendSuccessResponse(res, updatedCart, 200, 'Product removed from the cart');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};


module.exports = {
  getUserCart,
  addToCart,
  removeFromCart
};
