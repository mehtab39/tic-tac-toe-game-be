const axios = require('axios');
const logger = require('../utils/logger');
const baseURL = 'http://localhost:8080';
const aiLogger = logger.child({childService: 'ai-logger'})
// Function to trigger a ping request to the server
async function pingServer() {
    try {
        const response = await axios.get(`${baseURL}/ping`);
        aiLogger.info('Response from AI server:' + response.data);
        return response.data;
    } catch (error) {
        aiLogger.error('Error while pinging server: ' +  error);
    }
}

async function playGame(gameId) {
    try {
        const response = await axios.get(`${baseURL}/play/${gameId}`);
        aiLogger.info('Response from AI server: ' +  response.data);
        return response.data;
    } catch (error) {
        aiLogger.error(`Error while playGame api code: ${error.code}`);
    }
}

const AiHelper = {
    pingServer,
    playGame
}

module.exports = {
    AiHelper
}