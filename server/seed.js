require('dotenv').config();
const mongoose = require('mongoose');
const PracticeImage = require('./models/PracticeImage');

const seedImages = [
    {
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        referencePrompt: 'dramatic mountain landscape at golden hour with snow-capped peaks reflected in a calm alpine lake, cinematic photography',
        difficulty: 'medium',
        tags: ['landscape', 'mountains', 'nature'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',
        referencePrompt: 'a cute golden retriever puppy sitting in a green meadow with bokeh background, soft natural lighting, portrait photography',
        difficulty: 'easy',
        tags: ['animals', 'dog', 'cute'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
        referencePrompt: 'futuristic city skyline at night with neon lights reflecting on wet streets, cyberpunk aesthetic, rain, dramatic atmosphere',
        difficulty: 'hard',
        tags: ['city', 'night', 'cyberpunk'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1490750967868-88df5691cc9e?w=800&q=80',
        referencePrompt: 'vibrant sunflower field under clear blue sky, bright sunny day, macro photography, high saturation',
        difficulty: 'easy',
        tags: ['flowers', 'nature', 'summer'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&q=80',
        referencePrompt: 'serene Japanese zen garden with raked sand patterns, cherry blossom trees, traditional stone lanterns, misty morning atmosphere',
        difficulty: 'hard',
        tags: ['japanese', 'garden', 'zen'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        referencePrompt: 'dense green forest with sunbeams breaking through tall trees, foggy morning, ethereal atmosphere, wide angle shot',
        difficulty: 'medium',
        tags: ['forest', 'nature', 'light'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=800&q=80',
        referencePrompt: 'aerial view of tropical beach with turquoise water, white sand, palm trees, and coral reef visible underwater',
        difficulty: 'medium',
        tags: ['beach', 'tropical', 'aerial'],
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
        referencePrompt: 'colorful hot air balloons floating over Cappadocia valleys at sunrise, golden light, stunning landscape',
        difficulty: 'medium',
        tags: ['balloons', 'travel', 'cappadocia'],
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await PracticeImage.deleteMany({});
        console.log('🗑️  Cleared existing practice images');

        const inserted = await PracticeImage.insertMany(seedImages);
        console.log(`✅ Seeded ${inserted.length} practice images`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
