const socketIO = require('socket.io');

let io;

function initSocket(httpServer) {
  io = socketIO(httpServer, {
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', handleConnection);

  return io;
}

function handleConnection(socket) {
  console.log('New client connected');

  socket.on('newProductAdded', handleNewProductAdded);

  socket.on('productUpdated', handleProductUpdated);

  socket.on('productDeleted', handleProductDeleted);

  socket.on('disconnect', handleDisconnect);
}

function handleNewProductAdded(message) {
  io.emit('newProductAlert', message);
}

function handleProductUpdated(updatedProduct) {
  io.emit('productUpdatedAlert', updatedProduct);
}

function handleProductDeleted(productId) {
  io.emit('productDeletedAlert', productId);
}

function handleDisconnect() {
  console.log('Client disconnected');
}

module.exports = {
  initSocket,
  getIo: () => io,
};
