const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const gameController = require('./controllers/gameController.js')
const { handleUpgrade } = require('./lib/ws.js');
const logger = require('./utils/logger.js');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/v1/game', gameController);
app.get('/ping', (req, res) => {
    logger.info(`Received a ping request - Hostname: ${req.hostname}, IP: ${req.ip}`);
    res.send('pong');
});

// Upgrade HTTP request to WebSocket connection based on URL
server.on('upgrade', (request, socket, head) => {
    handleUpgrade(request, socket, head);
});

server.listen(5000, () => {
    logger.info('server listening on port 5000');
});


