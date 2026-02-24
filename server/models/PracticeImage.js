const mongoose = require('mongoose');

const practiceImageSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        referencePrompt: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        tags: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model('PracticeImage', practiceImageSchema);
