const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, battleController.createBattle);
router.get('/waiting', protect, battleController.getWaitingBattles);
router.post('/join/:battleId', protect, battleController.joinBattle);
router.get('/:battleId', protect, battleController.getBattle);
router.post('/:battleId/submit', protect, battleController.submitPrompt);

module.exports = router;
