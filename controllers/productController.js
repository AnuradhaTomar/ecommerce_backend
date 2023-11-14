const Product = require('../models/Product');
const { getIo } = require('../socket');

const sendSuccessResponse = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({ message, data });
};

const sendErrorResponse = (res, statusCode = 500, message = 'Server Error') => {
  res.status(statusCode).json({ message });
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({isDeleted:false});
    sendSuccessResponse(res, products);
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const addProduct = async (req, res) => {
  const { name, description, price, quantity } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      quantity
    });

    await newProduct.save();
    getIo().emit('newProductAdded', newProduct);
    sendSuccessResponse(res, newProduct, 201, 'Product added successfully');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendErrorResponse(res, 404, 'Product not found');
    }

    sendSuccessResponse(res, product);
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const updateProduct = async (req, res) => {
  const { name, description, price, quantity } = req.body;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return sendErrorResponse(res, 404, 'Product not found');
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.quantity = quantity;


    await product.save();
    getIo().emit('productUpdated', product);
    sendSuccessResponse(res, product, 200, 'Product updated successfully');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendErrorResponse(res, 404, 'Product not found');
    }

    product.isDeleted = true;
    await product.save();
    getIo().emit('productDeleted', req.params.id);
    sendSuccessResponse(res, null, 200, 'Product removed successfully');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct
};
