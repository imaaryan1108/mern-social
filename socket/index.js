const socketio = require('socket.io');
const express = require('express');
const http = require('http');
const app = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 8990;

const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://social-app-e0d7d.web.app/'],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
server.listen(PORT, () => {
  // Connection
  io.on('connection', (socket) => {
    // Take user from client
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', users);
    });

    // Send and recieve message
    socket.on('sendMessage', ({ senderId, recieverId, text }) => {
      const user = getUser(recieverId);
      io.to(user.socketId).emit('getMessage', {
        senderId,
        text,
      });
    });

    // Disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
      removeUser(socket.id);
      io.emit('getUsers', users);
    });
  });
});
