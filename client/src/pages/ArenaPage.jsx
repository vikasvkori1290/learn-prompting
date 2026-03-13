import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Users, Trophy, Zap, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const socket = io(API_URL, {
    autoConnect: false,
});

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

export default function ArenaPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [battles, setBattles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBattles = async () => {
        try {
            const res = await axiosInstance.get('/api/battles/waiting');
            if (res.data.success) {
                setBattles(res.data.battles);
            }
        } catch (err) {
            toast.error('Failed to load arena lobbies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/register');
            return;
        }
        fetchBattles();
        const interval = setInterval(fetchBattles, 5000); // Poll every 5s as bonus requirement
        return () => clearInterval(interval);
    }, [user, navigate]);

    const handleJoin = async (battleId) => {
        try {
            const res = await axiosInstance.post(`/api/battles/join/${battleId}`);
            if (res.data.success) {
                toast.success('Joined battle! Redirecting...');
                navigate(`/battle/${battleId}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join battle');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: T.white, color: T.black, fontFamily: "'Inter',sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800 }}>Battle Arena</h1>
                        <p style={{ color: T.gray2, marginTop: 4 }}>Join an active lobby or create your own duel.</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-battle')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 24px', borderRadius: 8,
                            background: T.blue, color: T.white, border: 'none',
                            fontSize: 14, fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        <Trophy size={18} />
                        Host a Battle
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                        <Loader2 size={40} className="animate-spin" color={T.blue} />
                    </div>
                ) : battles.length === 0 ? (
                    <div style={{
                        background: T.beige, padding: 80, borderRadius: 20,
                        textAlign: 'center', border: `1px solid ${T.beige2}`
                    }}>
                        <Zap size={48} color={T.gray3} style={{ marginBottom: 20 }} />
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: T.gray1 }}>No battles waiting...</h3>
                        <p style={{ color: T.gray2, marginBottom: 24 }}>Be the first to challenge someone!</p>
                        <button
                            onClick={() => navigate('/create-battle')}
                            style={{ background: T.black, color: T.white, border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                        >
                            Create New Lobby
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {battles.map(battle => (
                            <div
                                key={battle._id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 24,
                                    background: T.white, padding: '16px 20px', borderRadius: 12,
                                    border: `1px solid ${T.gray4}`, transition: 'box-shadow 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <img
                                    src={battle.targetImageUrl}
                                    style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', background: T.beige }}
                                />

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{battle.player1.name}'s Room</span>
                                        <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Waiting</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: T.gray2, fontSize: 13 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> 1/2 Players</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {new Date(battle.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleJoin(battle._id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '10px 20px', borderRadius: 6,
                                        background: T.black, color: T.white, border: 'none',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Join Battle
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
}
