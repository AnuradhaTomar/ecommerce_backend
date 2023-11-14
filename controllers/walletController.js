const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Cart = require("../models/Cart")

const sendSuccessResponse = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({ message, data });
};

const sendErrorResponse = (res, statusCode = 500, message = 'Server Error') => {
  res.status(statusCode).json({ message });
};

const topUp = async (req, res) => {
  const { description, amount } = req.body;
 const userId = req.user.id;
  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return sendErrorResponse(res, 404, 'Wallet not found');
    }
    console.log("req.body",req.body)
    wallet.amount += amount;
    await wallet.save();
    const transaction = new Transaction({
        user:userId,
        amount:amount,
        type:"credit",
        description:description
    })
    await transaction.save()
    wallet.transactions.push(transaction._id); 

    await wallet.save();

    sendSuccessResponse(res, { newBalance: wallet.amount }, 200, 'Top-up successful');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const withdraw = async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return sendErrorResponse(res, 404, 'Wallet not found');
    }

    if (wallet.amount < amount) {
      return sendErrorResponse(res, 400, 'Insufficient funds');
    }

    wallet.amount -= amount;
    await wallet.save();

    sendSuccessResponse(res, { newBalance: wallet.amount }, 200, 'Withdrawal successful');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const makeTransaction = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return sendErrorResponse(res, 404, 'Cart not found');
    }

    if (cart.totalAmount <= 0) {
      return sendErrorResponse(res, 400, 'Total amount is not valid for transaction');
    }

    const transaction = new Transaction({
      user:userId,
      amount: cart.totalAmount,
      description: 'Payment for products',
      type:"debit"
    });

   

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return sendErrorResponse(res, 404, 'Wallet not found');
    }

    if (wallet.amount < cart.totalAmount) {
      return sendErrorResponse(res, 400, 'Insufficient funds');
    }
    wallet.amount -= cart.totalAmount;
    await transaction.save();
    wallet.transactions.push(transaction._id); 
    await wallet.save();
    
    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();

    sendSuccessResponse(res, transaction, 200, 'Transaction successful');
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const balance = async (req, res) => {
    const user = req.user;
    console.log("user",user)
    try {
      const wallet = await Wallet.findOne({ user: user.id });
  
      if (!wallet) {
        return sendErrorResponse(res, 404, 'Wallet not found');
      }
  
    //   wallet.amount += amount;
    //   await wallet.save();
  
      sendSuccessResponse(res, {  wallet }, 200, 'successful');
    } catch (err) {
      console.error(err.message);
      sendErrorResponse(res);
    }
}

const transactions = async (req, res) => {
    const user = req.user;
    console.log("user",user)
    try {
      const wallet = await Wallet.findOne({ user: user.id }).populate('transactions');
  
      if (!wallet) {
        return sendErrorResponse(res, 404, 'Wallet not found');
      }
      const transactions = wallet.transactions;
    //   wallet.amount += amount;
    //   await wallet.save();
  
      sendSuccessResponse(res, {  transactions }, 200, 'successful');
    } catch (err) {
      console.error(err.message);
      sendErrorResponse(res);
    }
}
module.exports = {
  topUp,
  withdraw,
  makeTransaction,
  balance,
  transactions
};
