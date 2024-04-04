// webSocketHandler.js
const WebSocket = require('ws');
const { onGameEventPublish } = require('../services/gameService');
const { wssManager } = require('../utils/ws');

function handleGameConnection(ws, gameId) {
    console.log(`Game WebSocket connection established for game ID: ${gameId}`);

        ws.on('message', async (message) => {
        console.log(`Received message from game ID ${gameId}: ${message}`);
        try {
            const data = JSON.parse(message);
            onGameEventPublish(gameId, data);
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`WebSocket connection closed for game ID: ${gameId}`);
    });
}

function handleUpgrade(request, socket, head) {
    const url = request.url;
    console.log("Received upgrade request", { url })

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
            console.log('connection established with user', {ip})
            ws.on('error', console.error);
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
