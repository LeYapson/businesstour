const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import cors

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend to connect
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const players = [];
let currentPlayerIndex = 0;

const rollDice = () => Math.floor(Math.random() * 6) + 1;

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Handle new player joining
    socket.on('join', (name) => {
        const newPlayer = { id: socket.id, name, position: 0, money: 1500 };
        players.push(newPlayer);
        io.emit('updatePlayers', players);
    });

    // Handle dice roll
    socket.on('rollDice', () => {
        const roll = rollDice();
        const player = players[currentPlayerIndex];
        player.position = (player.position + roll) % 40; // Update position

        io.emit('playerMoved', { player, roll }); // Notify all clients about the player's move

        // Advance to the next player
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    });

    // Handle player disconnecting
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        const playerIndex = players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            players.splice(playerIndex, 1);
        }
        io.emit('updatePlayers', players);
    });
});

server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
