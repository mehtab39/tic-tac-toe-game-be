const sseManager = new Map();

function broadcast(gameId, payload) {
    if (!sseManager.has(gameId)) {
        console.error('see not available');
        return;
    }
    const clients = sseManager.get(gameId);
    console.log("broadcasting to", clients.size)
    const formattedMessage = typeof payload === 'object' ? `data: ${JSON.stringify(payload)}\n\n` : `data: ${payload}\n\n`;
    try{
        clients.forEach((client) => {
            client.write(formattedMessage);
        });
    }catch(err){
        console.error('err', err.message)
    }
   
}

const sseHelper = {
    broadcast
}

module.exports = {
    sseHelper,
    sseManager
}