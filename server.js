const express = require('express');
const app = express();
const http = require('http').createServer(app);
const db = require('./config/db');
const cors = require('cors');
require('dotenv').config();
app.use(cors());
app.use(cors({ origin: '*' }));
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
const socketSetup = require('./socket');

app.use(express.json());

const socketServer = socketSetup.initSocket(http);

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoute');
const walletRoutes = require('./routes/walletRoutes');
const cartRoutes = require('./routes/cartRoutes');

app.get('/', (req, res) => {
  console.log('Welcome to ecommerce');
  res.status(200).send('Welcome to ecommerce');
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/wallet', walletRoutes);
app.use('/cart', cartRoutes);

const PORT = process.env.PORT || 3002;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = socketServer;