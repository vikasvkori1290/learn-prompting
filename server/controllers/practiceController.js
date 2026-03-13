const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PracticeImage = require('../models/PracticeImage');
const Session = require('../models/Session');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

function pickDifficulty(id) {
    const n = parseInt(id, 10) % 3;
    return ['easy', 'medium', 'hard'][n];
}


// ─── GET RANDOM IMAGE ────────────────────────────────────────────────────────

const getRandomImage = async (req, res) => {
    try {
        const page = Math.floor(Math.random() * 10) + 1;
        const listRes = await axios.get(
            `https://picsum.photos/v2/list?page=${page}&limit=30`,
            { timeout: 8000 }
        );

        const photos = listRes.data;
        if (!photos || photos.length === 0) {
            return res.status(503).json({ message: 'Could not fetch images from Picsum.' });
        }

        const pick = photos[Math.floor(Math.random() * photos.length)];
        const imageUrl = `https://picsum.photos/id/${pick.id}/900/600`;
        const tags = SCENE_TAGS[parseInt(pick.id, 10) % SCENE_TAGS.length];

        res.json({
            image: {
                _id: pick.id,
                imageUrl,
                difficulty: pickDifficulty(pick.id),
                tags,
                author: pick.author,
            },
        });
    } catch (error) {
        console.error('Picsum fetch error:', error.message);
        try {
            const count = await PracticeImage.countDocuments();
            if (count > 0) {
                const image = await PracticeImage.findOne().skip(Math.floor(Math.random() * count));
                return res.json({ image });
            }
        } catch (_) { /* ignore */ }
        res.status(503).json({ message: 'Failed to load image.' });
    }
};

// ─── EVALUATE PROMPT ─────────────────────────────────────────────────────────

const evaluatePrompt = async (req, res) => {
    try {
        const { imageUrl, userPrompt, imageId } = req.body;

        if (!imageUrl || !userPrompt || !imageId) {
            return res.status(400).json({ message: 'imageUrl, userPrompt and imageId are required' });
        }

        // Fetch image server-side (axios follows 302 redirects; Groq cannot)
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
        const base64Image = Buffer.from(imgRes.data).toString('base64');
        const mimeType = (imgRes.headers['content-type'] || 'image/jpeg').split(';')[0];

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            {
                text: `You are a strict image-prompt evaluator. A user was shown an image and wrote a prompt to describe it.

User's prompt: "${userPrompt}"

Score this prompt against the image using this exact rubric:
- Subject accuracy (0-30 pts): Does the prompt correctly identify the main subject(s) visible?
- Visual details (0-25 pts): Are specific colors, textures, lighting conditions described correctly?
- Mood & atmosphere (0-20 pts): Does the prompt capture the emotional tone and feel of the image?
- Composition & framing (0-15 pts): Are spatial layout, perspective, and framing addressed?
- Language precision (0-10 pts): Is the language specific and detailed rather than generic?

Steps:
1. Study the image carefully
2. Score EACH criterion strictly based only on what the user's prompt mentions vs what you actually see
3. Add the 5 sub-scores together for the total
4. Write exactly one sentence of feedback mentioning specific image elements the user got right and missed

Respond ONLY with this exact JSON (no markdown, no extra words):
{"score": <integer total>, "feedback": "<one specific sentence>"}`,
            },
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        const genResponse = await result.response;
        const rawText = genResponse.text();

        let parsed;
        try {
            const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            parsed = { score: 50, feedback: 'Could not parse response. Raw: ' + rawText.slice(0, 100) };
        }

        const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
        const feedback = parsed.feedback || 'Evaluation complete.';

        const session = await Session.create({ userId: req.user._id, imageId, userPrompt, score, feedback });

        const allSessions = await Session.find({ userId: req.user._id });
        const avg = allSessions.reduce((sum, s) => sum + s.score, 0) / allSessions.length;
        await User.findByIdAndUpdate(req.user._id, {
            totalSessions: allSessions.length,
            averageScore: Math.round(avg),
        });

        res.json({ score, feedback, sessionId: session._id });
    } catch (error) {
        console.error('Evaluation error:', error.message);
        res.status(500).json({ message: 'Evaluation failed: ' + error.message });
    }
};

// ─── GET HISTORY ─────────────────────────────────────────────────────────────

const getHistory = async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── GET HINT ─────────────────────────────────────────────────────────────────

const getHint = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

        // Fetch image server-side (axios follows 302 redirects; Groq cannot)
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
        const base64Image = Buffer.from(imgRes.data).toString('base64');
        const mimeType = (imgRes.headers['content-type'] || 'image/jpeg').split(';')[0];

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            {
                text: 'Look at this image and give the user 3 very short keyword-style HINTS to help them describe it, without giving away the full answer. Each hint should be a single word or very short phrase (e.g. "golden light", "mountainous", "close-up face"). Format your answer as a single line: "Hint: [keyword1], [keyword2], [keyword3]"',
            },
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        const genResponse = await result.response;
        const hint = genResponse.text().trim();
        res.json({ hint });
    } catch (error) {
        console.error('Hint error:', error.message);
        res.status(500).json({ message: 'Could not generate hint' });
    }
};

module.exports = { getRandomImage, evaluatePrompt, getHistory, getHint };
