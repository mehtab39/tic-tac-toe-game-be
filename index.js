const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const gameController = require('./controllers/gameController.js')
const { handleUpgrade } = require('./lib/ws.js');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/v1/game', gameController);
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Upgrade HTTP request to WebSocket connection based on URL
server.on('upgrade', (request, socket, head) => {
    handleUpgrade(request, socket, head);
});

server.listen(5000, () => {
    console.log('server listening on port 5000');
});


