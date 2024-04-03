const { WebSocket } = require("ws");
const wssManager = new Map();

function broadcast(gameId, payload ){
    if (!wssManager.has(gameId)){
        console.error('ws not available');
        return;
    }
    wssManager.get(gameId).clients.forEach((client) => {
        // client !== wssManager.get(gameId)
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
    wssManager
}

