const express = require('express');
const router = express.Router();
const { getRandomImage, evaluatePrompt, getHistory, getHint } = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/image', protect, getRandomImage);
router.post('/evaluate', protect, evaluatePrompt);
router.post('/hint', protect, getHint);
router.get('/history', protect, getHistory);

module.exports = router;
