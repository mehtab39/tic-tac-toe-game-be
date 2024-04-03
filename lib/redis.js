// redis.js
const redis = require('redis');
// Create Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
})
redisClient.connect();

redisClient.on('connect', () => {
    console.log('Connected to Redis server');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});




module.exports = { redisClient };