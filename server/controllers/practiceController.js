const axios = require('axios');
const PracticeImage = require('../models/PracticeImage');
const Session = require('../models/Session');
const User = require('../models/User');

// Picsum image categories (used to assign tags for display)
const SCENE_TAGS = [
    ['nature', 'landscape'],
    ['architecture', 'urban'],
    ['portrait', 'close-up'],
    ['abstract', 'texture'],
    ['travel', 'outdoor'],
    ['technology', 'modern'],
    ['wildlife', 'animals'],
    ['food', 'still-life'],
];

// Pick a difficulty based on image id parity
function pickDifficulty(id) {
    const n = parseInt(id, 10) % 3;
    return ['easy', 'medium', 'hard'][n];
}

// @desc  Get a random practice image (from Picsum Photos — no seeding required)
// @route GET /api/practice/image
const getRandomImage = async (req, res) => {
    try {
        // Pick a random page (1-10) and random item from 30 per page
        const page = Math.floor(Math.random() * 10) + 1;
        const limit = 30;

        const listRes = await axios.get(
            `https://picsum.photos/v2/list?page=${page}&limit=${limit}`,
            { timeout: 8000 }
        );

        const photos = listRes.data;
        if (!photos || photos.length === 0) {
            return res.status(503).json({ message: 'Could not fetch images from Picsum. Check internet connection.' });
        }

        const pick = photos[Math.floor(Math.random() * photos.length)];

        // Build a 900×600 download URL (static, no redirects)
        const imageUrl = `https://picsum.photos/id/${pick.id}/900/600`;
        const tags = SCENE_TAGS[parseInt(pick.id, 10) % SCENE_TAGS.length];

        // Return in the same shape the frontend expects
        res.json({
            image: {
                _id: pick.id,           // use picsum id as the "imageId"
                imageUrl,
                difficulty: pickDifficulty(pick.id),
                tags,
                author: pick.author,
                // referencePrompt intentionally omitted — user should guess!
            },
        });
    } catch (error) {
        console.error('Picsum fetch error:', error.message);
        // Fallback: try DB images
        try {
            const count = await PracticeImage.countDocuments();
            if (count > 0) {
                const random = Math.floor(Math.random() * count);
                const image = await PracticeImage.findOne().skip(random);
                return res.json({ image });
            }
        } catch (_) { /* ignore */ }
        res.status(503).json({ message: 'Failed to load image. Check your internet connection.' });
    }
};


// @desc  Evaluate user's prompt against image using Gemini
// @route POST /api/practice/evaluate
const evaluatePrompt = async (req, res) => {
    try {
        const { imageUrl, userPrompt, imageId } = req.body;

        if (!imageUrl || !userPrompt || !imageId) {
            return res.status(400).json({ message: 'imageUrl, userPrompt and imageId are required' });
        }

        // Fetch image and convert to base64
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(imageResponse.data).toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        // Call Gemini API
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

        const geminiPayload = {
            contents: [
                {
                    parts: [
                        {
                            text: `You are an AI image-prompt evaluator. 
              
A user was shown this image and asked to write the text prompt that could generate it.

Their prompt is: "${userPrompt}"

Please evaluate how accurately this prompt describes the image. Consider:
1. Subject matter accuracy
2. Visual style and mood
3. Important details (colors, composition, lighting)
4. Overall descriptive quality

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{"score": <number 0-100>, "feedback": "<one sentence explaining the score>"}`,
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image,
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 200,
            },
        };

        const geminiResponse = await axios.post(GEMINI_URL, geminiPayload, {
            headers: { 'Content-Type': 'application/json' },
        });

        const rawText = geminiResponse.data.candidates[0].content.parts[0].text.trim();

        // Parse JSON from Gemini response (strip possible markdown code fences)
        let parsed;
        try {
            const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = { score: 50, feedback: 'Could not parse Gemini response. Raw: ' + rawText.slice(0, 100) };
        }

        const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
        const feedback = parsed.feedback || 'Evaluation complete.';

        // Save session
        const session = await Session.create({
            userId: req.user._id,
            imageId,
            userPrompt,
            score,
            feedback,
        });

        // Update user stats
        const allSessions = await Session.find({ userId: req.user._id });
        const avg = allSessions.reduce((sum, s) => sum + s.score, 0) / allSessions.length;
        await User.findByIdAndUpdate(req.user._id, {
            totalSessions: allSessions.length,
            averageScore: Math.round(avg),
        });

        res.json({ score, feedback, sessionId: session._id });
    } catch (error) {
        console.error('Evaluation error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Evaluation failed: ' + error.message });
    }
};

// @desc  Get user's session history
// @route GET /api/practice/history
const getHistory = async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.user._id })
            .populate('imageId', 'imageUrl difficulty')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Generate a short keyword hint for an image using Gemini
// @route POST /api/practice/hint
const getHint = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
        const base64Image = Buffer.from(imageResponse.data).toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            contents: [{
                parts: [
                    { text: `Look at this image and give the user 3 very short keyword-style HINTS to help them describe it, without giving away the full answer. Each hint should be a single word or very short phrase (e.g. "golden light", "mountainous", "close-up face"). Format your answer as a single line: "Hint: [keyword1], [keyword2], [keyword3]"` },
                    { inline_data: { mime_type: mimeType, data: base64Image } },
                ],
            }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 60 },
        };

        const geminiRes = await axios.post(GEMINI_URL, payload, { headers: { 'Content-Type': 'application/json' } });
        const hint = geminiRes.data.candidates[0].content.parts[0].text.trim();
        res.json({ hint });
    } catch (error) {
        console.error('Hint error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Could not generate hint' });
    }
};

module.exports = { getRandomImage, evaluatePrompt, getHistory, getHint };

