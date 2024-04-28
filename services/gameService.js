// createGame.js
const { v4: uuidv4 } = require('uuid');
const { Constants } = require('../constants');
const { wsHelper } = require('../utils/ws');
const { redisClient } = require('../lib/redis');
const { sseHelper } = require('../utils/sse');
const { AiHelper } = require('../lib/ai');
const { default: axios } = require('axios');
const logger = require('../utils/logger');
//ActiveXObject
async function initializeGameState(gameId, creatorId) {
    const gameState = {
        id: gameId,
        board: Constants.EmptyBoard,
        creatorId,
        players: [],
        currentPlayer: 0,
        status: Constants.GameState.PENDING,
        winner: '',
    };
    await redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
    return gameState;
}

async function createGame(creatorId, useAiOpponent, logService = logger) {
    const gameId = uuidv4();
    logService.info(`Creating game with gameId: ${gameId}`)

    const gameState = await initializeGameState(gameId, creatorId);

    if (useAiOpponent){
        playWithAI(gameId, logService)
    }
    return gameState;
}

async function playWithAI(gameId, logService = logger){
    logService.info(`Initialising connection with AI with gameId: ${gameId}`);
    await AiHelper.playGame(gameId);
}


async function getGame(gameId) {
    const gameState = await redisClient.get(`game:${gameId}`);
    if (gameState) {
        return JSON.parse(gameState);
    }
    return null;
}

async function deleteGame(gameId) {
    const gameState = await redisClient.del(`game:${gameId}`);
    return gameState;
}

async function startGame(gameId, userId) {
    const gameState = await getGame(gameId);
    if (!gameState) return null;
    if (gameState.players.length >= 2) {
        return null;
    }
    if (gameState.players.includes(userId)) {
        return null;
    }


    gameState.players.push(userId);

    if (gameState.players.length === 1) {
        logger.info(`Starting game userId: ${userId}`)
        gameState['status'] = Constants.GameState.STARTED;
    } else {
        logger.info('Ready game', { userId })
        gameState['status'] = Constants.GameState.READY;
        gameState.players.reverse();
    }
   
    wsHelper.broadcast(gameId, { type: 'gameStateUpdate', gameState });
    sseHelper.broadcast(gameId, { type: 'gameStateUpdate', gameState });
    redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

    return gameState;

}

async function tileClick(gameId, player, row, col) {
    try {
        // Retrieve game state from Redis
        const gameState = await redisClient.get(`game:${gameId}`);
        if (!gameState) {
            logger.error(`Game state not found for gameId: ${gameId}`);
            return;
        }


        // Parse the JSON string into a JavaScript object
        const gameData = JSON.parse(gameState);

        if (![Constants.GameState.ONGOING, Constants.GameState.READY].includes(gameData['status'])) {
            logger.error(`Game not yet started ${gameId} status: ${gameData['status']}`);
            return;
        }

        if (gameData.players[gameData.currentPlayer] !== player) {
            logger.error(`Not your turn!  ${player} ${gameId}`);
            return;
        }

        if (gameData['status'] !== Constants.GameState.ONGOING) {
            gameData['status'] = Constants.GameState.ONGOING;
        }


        // Check if the tile is already occupied
        if (gameData.board[row][col] !== '') {
            logger.info('Tile already occupied');
            return;
        }

        // Update the game state with the player's move
        gameData.board[row][col] = gameData.players.indexOf(player) === 0 ? Constants.Tokens.Zero : Constants.Tokens.Cross;

        const winOrDraw = checkWinOrDraw(gameData.board);

        if (winOrDraw !== 0) {
            try{
               const res =  await axios.post('http://localhost:8081/api/game-stats', {
                    winner: player,
                    draw: winOrDraw === 2,
                    gameId: gameId,
                    loser: gameData.players[1 - gameData.players.indexOf(player)]
                })

                logger.info(`Reeived status  while saving game stats:: ${res.status}`)
            }catch(err){
                logger.info(`err while saving game stats: ${err.message}`)
            }
         
            if (winOrDraw === 1) {
                gameData['winner'] = player;
            } else {
                gameData['winner'] = 'N/A';
            }
            gameData['status'] = Constants.GameState.FINISHED;
        } else {
            // change the turn
            gameData['currentPlayer'] = Number(!gameData['currentPlayer'])
        }

        // Save the updated game state back to Redis
        await redisClient.set(`game:${gameId}`, JSON.stringify(gameData));

        // Broadcast the updated game state to all players
        wsHelper.broadcast(gameId, { type: 'gameStateUpdate', gameState: gameData })
        sseHelper.broadcast(gameId, { type: 'gameStateUpdate', gameState: gameData })

    } catch (error) {
        logger.error(`Error handling tile click: ${error.message}`);
    }
}


// 2D board 3x3 with 'X' and 'O'.
// return 
// Pending: 0
// Win: 1 
// Draw: 2
// todo optimise
function checkWinOrDraw(board) {
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== '') {
            return 1; // Win
        }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== '') {
            return 1; // Win
        }
    }

    // Check diagonals
    if ((board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '') ||
        (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '')) {
        return 1; // Win
    }

    // Check for draw
    let isDraw = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                isDraw = false;
                break;
            }
        }
        if (!isDraw) {
            break;
        }
    }
    if (isDraw) {
        return 2; // Draw
    }

    // If no win or draw, return pending
    return 0; // Pending
}


async function onGameEventPublish(gameId, data){
    if (data.type === 'tileClick') {
        await tileClick(gameId, data.player, data.row, data.col);
    }
}

module.exports = {
    getGame,
    createGame,
    startGame,
    deleteGame,
    onGameEventPublish,
}
