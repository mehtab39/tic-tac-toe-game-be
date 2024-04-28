const axios = require('axios');
const logger = require('../utils/logger');
const baseURL = 'http://localhost:8080';
// Function to trigger a ping request to the server
async function pingServer() {
    try {
        const response = await axios.get(`${baseURL}/ping`);
        logger.info('Response from AI server:' + response.data);
        return response.data;
    } catch (error) {
        logger.error('Error while pinging server: ' +  error.message);
    }
}

async function playGame(gameId) {
    try {
        const response = await axios.get(`${baseURL}/play/${gameId}`);
        logger.info('Response from AI server: ' +  response.data);
        return response.data;
    } catch (error) {
        logger.error('Error while pinging server: ' +  error.message);
    }
}

const AiHelper = {
    pingServer,
    playGame
}

module.exports = {
    AiHelper
}