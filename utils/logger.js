const winston = require('winston');
const { combine, timestamp, json } = winston.format;
const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        service: 'node-game-be',
    },
    format: combine(timestamp(), json()),
    transports: [new winston.transports.Console(), new winston.transports.File({
        filename: 'combined.log',
    }),],
});

module.exports = logger;

