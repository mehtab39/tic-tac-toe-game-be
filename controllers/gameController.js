
const express = require('express');
const gameService = require('../services/gameService');

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const userId = req.body.userId;
        const game = await gameService.createGame(userId);
        res.json({ game });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/start/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const gameState = await gameService.startGame(gameId, req.body.userId);
        res.json({ game: gameState });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const gameState = await gameService.getGame(gameId);
        res.json(gameState);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const gameState = await gameService.deleteGame(gameId);
        res.json(gameState);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
