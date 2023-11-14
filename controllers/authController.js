const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Wallet = require('../models/Wallet');

const sendSuccessResponse = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({ message, data });
};

const sendErrorResponse = (res, statusCode = 500, message = 'Server Error') => {
  res.status(statusCode).json({ message });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return sendErrorResponse(res, 400, 'User already exists');
    }

    user = new User({
      name,
      email,
      password
    });

    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log("user",user)
    const wallet = new Wallet({
        user:user._id
    })
    wallet.save()
    
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          return sendErrorResponse(res, 500, err.message);
        }
        sendSuccessResponse(res, { token, user }, 200, 'User registered successfully');
      }
    );
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return sendErrorResponse(res, 400, 'Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendErrorResponse(res, 400, 'Invalid Credentials');
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          return sendErrorResponse(res, 500, err.message);
        }
        sendSuccessResponse(res, { token, user }, 200, 'Sign in successful');
      }
    );
  } catch (err) {
    console.error(err.message);
    sendErrorResponse(res);
  }
};

const forgotPassword = async (req, res) => {
  
};

module.exports = {
  signup,
  signin,
  forgotPassword
};
