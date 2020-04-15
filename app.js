const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log('user connected');
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});