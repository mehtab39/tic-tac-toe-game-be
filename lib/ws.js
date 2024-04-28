// webSocketHandler.js
const WebSocket = require('ws');
const { onGameEventPublish } = require('../services/gameService');
const { wssManager } = require('../utils/ws');
const logger = require('../utils/logger');

function handleGameConnection(ws, gameId) {
    logger.info(`Game WebSocket connection established for game ID: ${gameId}`);

        ws.on('message', async (message) => {
        logger.info(`Received message from game ID ${gameId}: ${message}`);
        try {
            const data = JSON.parse(message);
            onGameEventPublish(gameId, data);
        } catch (error) {
            logger.error('Error processing WebSocket message: ' + error.message);
        }
    });

    ws.on('close', () => {
        logger.info(`WebSocket connection closed for game ID: ${gameId}`);
    });
}

function handleUpgrade(request, socket, head) {
    const url = request.url;
    logger.info("Received upgrade request url: " + url)

    if (url.startsWith('/game/')) {
        const gameId = url.split('/').pop();
        if (!wssManager.has(gameId)) {
            const wss = new WebSocket.Server({ noServer: true });
            wss.on("close", () => {
                wssManager.delete(gameId);
            })
            wssManager.set(gameId, wss)
        }
        const wss = wssManager.get(gameId);
        wss.on('connection', (ws, req) => {
            const ip = req.socket.remoteAddress;
            logger.info('connection established with user ' + ip)
            ws.on('error: ' +  logger.error);
        })
        wss.handleUpgrade(request, socket, head, (ws) => {
            handleGameConnection(ws, gameId);
        });
    } else {
        socket.destroy();
    }
}


module.exports = {
    handleUpgrade,
};
