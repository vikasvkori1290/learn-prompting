const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema(
    {
        targetImageUrl: {
            type: String,
            required: true,
        },
        targetImageId: {
            type: String,
            required: true,
        },
        player1: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            prompt: { type: String, default: "" },
            score: { type: Number, default: null }
        },
        player2: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            prompt: { type: String, default: "" },
            score: { type: Number, default: null }
        },
        status: {
            type: String,
            enum: ['waiting', 'active', 'completed'],
            default: 'waiting',
        },
        winner: {
            type: String,
            enum: ['player1', 'player2', 'draw', null],
            default: null,
        },
        matchAnalysis: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Battle', battleSchema);
