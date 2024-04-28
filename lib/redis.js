// redis.js
const redis = require('redis');
const logger = require('../utils/logger');
// Create Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
})
redisClient.connect();

redisClient.on('connect', () => {
    logger.info('Connected to Redis server');
});

redisClient.on('error', (err) => {
    logger.error('Redis error:' +  err.message);
});

module.exports = { redisClient };