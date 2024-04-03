const { WebSocket } = require("ws");
const wsManager = new Map();
function broadcast(gameId, payload ){
    if (!wsManager.has(gameId)){
        console.error('ws not available');
        return;
    }
    wsManager.get(gameId).clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    });
}

const wsHelper = {
    broadcast
}

module.exports = {
    wsHelper,
    wsManager
}

