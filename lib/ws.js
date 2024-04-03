// webSocketHandler.js
const WebSocket = require('ws');
const { onGameEventPublish } = require('../services/gameService');
const { wsManager } = require('../utils/ws');

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
        wsManager.delete(gameId)
    });
}

function handleUpgrade(request, socket, head) {
    const url = request.url;
    console.log("Received upgrade request", { url })

    if (url.startsWith('/game/')) {
        const gameId = url.split('/').pop();
        if (!wsManager.has(gameId)) {
            const ws = new WebSocket.Server({ noServer: true });
            wsManager.set(gameId, ws)
        }
        const wss = wsManager.get(gameId)
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
