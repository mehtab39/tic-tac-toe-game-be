const logger = require("./logger");

const sseManager = new Map();

function broadcast(gameId, payload) {
    if (!sseManager.has(gameId)) {
        logger.error('sse not available');
        return;
    }
    const clients = sseManager.get(gameId);
    logger.info("broadcasting to " + clients.size)
    const formattedMessage = typeof payload === 'object' ? `data: ${JSON.stringify(payload)}\n\n` : `data: ${payload}\n\n`;
    try{
        clients.forEach((client) => {
            client.write(formattedMessage);
        });
    }catch(err){
        logger.error(err.message)
    }
   
}

const sseHelper = {
    broadcast
}

module.exports = {
    sseHelper,
    sseManager
}