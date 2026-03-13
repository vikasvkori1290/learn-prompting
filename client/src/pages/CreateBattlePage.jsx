import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Plus, Loader2, ArrowRight } from 'lucide-react';

const T = {
    white: '#ffffff',
    beige: '#f3f2ee',
    beige2: '#e9e7e0',
    black: '#1a1a1a',
    gray1: '#5a5a5a',
    gray2: '#888888',
    gray3: '#cccccc',
    gray4: '#eeeeee',
    blue: '#2196f3',
};

export default function CreateBattlePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Fetch random images for selection
                const res = await axiosInstance.get('/api/practice/image');
                // We'll just get one for now or multiple if API supports
                // Assuming /api/practice/image returns { image: { _id, imageUrl, ... } }
                // Let's try to get a few by calling it multiple times or check if there's a gallery route
                setImages([res.data.image]);
            } catch (err) {
                toast.error('Failed to load images');
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    const handleCreate = async () => {
        if (!selectedImage) return toast.error('Please select an image first');

        setCreating(true);
        try {
            const res = await axiosInstance.post('/api/battles/create', {
                targetImageUrl: selectedImage.imageUrl,
                targetImageId: selectedImage._id
            });

            if (res.data.success) {
                toast.success('Battle created! Waiting for players...');
                navigate(`/battle/${res.data.battleId}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create battle');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: T.white, color: T.black, fontFamily: "'Inter',sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 40px' }}>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Create a Battle</h1>
                <p style={{ color: T.gray2, marginBottom: 40 }}>Select a target image for your duel. Your opponent will have to describe it as accurately as possible.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: 40 }}>
                            <Loader2 size={30} className="animate-spin" color={T.blue} />
                        </div>
                    ) : images.map((img, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedImage(img)}
                            style={{
                                borderRadius: 12, border: `2px solid ${selectedImage?._id === img._id ? T.blue : T.gray4}`,
                                overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <img src={img.imageUrl} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                            {selectedImage?._id === img._id && (
                                <div style={{ position: 'absolute', top: 10, right: 10, background: T.blue, color: T.white, borderRadius: '50%', padding: 4 }}>
                                    <Plus size={16} />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Simplified Refresh Image */}
                    {!loading && (
                        <div
                            onClick={() => window.location.reload()}
                            style={{
                                borderRadius: 12, border: `2px dashed ${T.gray3}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: 10, color: T.gray2, cursor: 'pointer'
                            }}
                        >
                            <Plus size={24} />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Get Different Image</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleCreate}
                        disabled={creating || !selectedImage}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '16px 40px', borderRadius: 8,
                            background: creating || !selectedImage ? T.gray3 : T.black,
                            color: T.white, fontSize: 16, fontWeight: 700,
                            cursor: creating || !selectedImage ? 'not-allowed' : 'pointer',
                            border: 'none', transition: 'background 0.2s'
                        }}
                    >
                        {creating ? 'Starting Battle...' : 'Launch Battle'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
}
