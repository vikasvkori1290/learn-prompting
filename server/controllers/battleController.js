const Battle = require('../models/Battle');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.createBattle = async (req, res) => {
    try {
        const { targetImageUrl, targetImageId } = req.body;
        const battle = await Battle.create({
            targetImageUrl,
            targetImageId,
            player1: {
                id: req.user._id,
                name: req.user.name,
                prompt: "",
                score: null
            },
            status: 'waiting'
        });
        res.status(201).json({ success: true, battleId: battle._id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getWaitingBattles = async (req, res) => {
    try {
        const battles = await Battle.find({ status: 'waiting' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, battles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.joinBattle = async (req, res) => {
    try {
        const battle = await Battle.findById(req.params.battleId);
        if (!battle) return res.status(404).json({ success: false, message: 'Battle not found' });
        if (battle.status !== 'waiting') return res.status(400).json({ success: false, message: 'Battle already started or finished' });
        if (battle.player1.id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You are already Player 1' });
        }

        battle.player2 = {
            id: req.user._id,
            name: req.user.name,
            prompt: "",
            score: null
        };
        battle.status = 'active';
        await battle.save();

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getBattle = async (req, res) => {
    try {
        const battle = await Battle.findById(req.params.battleId);
        if (!battle) return res.status(404).json({ success: false, message: 'Battle not found' });
        res.status(200).json({ success: true, battle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.submitPrompt = async (req, res) => {
    try {
        const { prompt } = req.body;
        const battle = await Battle.findById(req.params.battleId);
        if (!battle) return res.status(404).json({ success: false, message: 'Battle not found' });

        const isP1 = battle.player1.id.toString() === req.user._id.toString();
        const isP2 = battle.player2?.id.toString() === req.user._id.toString();

        if (!isP1 && !isP2) return res.status(403).json({ success: false, message: 'Not a player in this battle' });

        if (isP1) {
            if (battle.player1.prompt) return res.status(400).json({ success: false, message: 'Already submitted' });
            battle.player1.prompt = prompt;
        } else {
            if (battle.player2.prompt) return res.status(400).json({ success: false, message: 'Already submitted' });
            battle.player2.prompt = prompt;
        }

        await battle.save();

        // Check if both submitted
        if (battle.player1.prompt && battle.player2.prompt) {
            // Trigger Gemini Scoring
            await evaluateBattle(battle);
        }

        res.status(200).json({ success: true, battle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

async function evaluateBattle(battle) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const promptText = `
You are an expert AI judge evaluating how accurately two prompts describe a target image.

Target Image URL: ${battle.targetImageUrl}
Player 1 Prompt: "${battle.player1.prompt}"
Player 2 Prompt: "${battle.player2.prompt}"

Return ONLY valid JSON:
{
  "player1": { "score": number },
  "player2": { "score": number },
  "winner": "player1" | "player2" | "draw",
  "analysis": "Short 1-sentence summary"
}
`;

        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);

            battle.player1.score = data.player1.score;
            battle.player2.score = data.player2.score;
            battle.winner = data.winner;
            battle.matchAnalysis = data.analysis;
            battle.status = 'completed';
            await battle.save();
        }
    } catch (err) {
        console.error("Judge Error:", err);
        battle.status = 'completed';
        battle.winner = 'draw';
        await battle.save();
    }
}
