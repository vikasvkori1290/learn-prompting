const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageId: {
            type: String,        // supports both Picsum IDs ("42") and MongoDB ObjectIds
            required: true,
        },
        userPrompt: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
        },
        feedback: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
