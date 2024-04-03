
const express = require('express');
const gameService = require('../services/gameService');
const { sseManager, sseHelper } = require('../utils/sse');

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

router.post('/play/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        gameService.onGameEventPublish(gameId, req.body);
        res.status(200).json({success: true});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/observe/:gameId', (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const { gameId } = req.params;
    console.log('Client added');
    const clients = sseManager.get(gameId) || new Set();

    clients.add(res);

    sseManager.set(gameId, clients)

    sseHelper.broadcast(gameId, {type: 'welcome'})

    // Handle client disconnect
    req.on('close', () => {
        clients.delete(res);
        sseManager.set(gameId, clients)
        console.log('Client disconnected');
    });
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
