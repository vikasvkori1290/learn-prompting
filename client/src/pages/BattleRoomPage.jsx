import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socket } from './ArenaPage';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Users, Loader2, Send, CheckCircle, ShieldAlert, Award, Share2, Info } from 'lucide-react';

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
    green: '#4caf50',
    red: '#f44336',
    yellow: '#ff9800',
    purple: '#9c27b0'
};


export default function BattleRoomPage() {
    const { battleId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [battle, setBattle] = useState(null);
    const [promptText, setPromptText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchBattle = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/api/battles/${battleId}`);
            if (res.data.success) {
                setBattle(res.data.battle);
            }
        } catch (err) {
            toast.error('Failed to load battle data');
            navigate('/arena');
        } finally {
            setLoading(false);
        }
    }, [battleId, navigate]);

    useEffect(() => {
        fetchBattle();

        // Socket join
        socket.connect();
        socket.emit('join_room', battleId);

        socket.on('battle_update', (updatedBattle) => {
            setBattle(updatedBattle);
        });

        // Polling fallback every 3s as requested "auto-refresh"
        const interval = setInterval(fetchBattle, 3000);

        return () => {
            socket.off('battle_update');
            clearInterval(interval);
        };
    }, [battleId, fetchBattle]);

    const handleSubmit = async () => {
        if (!promptText.trim()) return toast.error('Enter a prompt first!');
        setSubmitting(true);
        try {
            const res = await axiosInstance.post(`/api/battles/${battleId}/submit`, { prompt: promptText.trim() });
            if (res.data.success) {
                toast.success('Prompt submitted! Waiting for opponent...');
                setBattle(res.data.battle);
                socket.emit('submit_prompt', { roomId: battleId });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLinkedInShare = () => {
        const battleUrl = window.location.href;
        const score = isP1 ? battle.player1.score : battle.player2.score;
        const text = `🔥 I just scored ${score} in a Prompt Battle Arena! Think you can beat me? ⚔️🚀\n\nChallenge me here: ${battleUrl}`;
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(battleUrl)}`;
        window.open(shareUrl, '_blank');
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={40} className="animate-spin" color={T.blue} />
        </div>
    );

    if (!battle) return null;

    const isP1 = battle.player1?.id?.toString() === (user?.id || user?._id)?.toString();
    const isP2 = battle.player2?.id?.toString() === (user?.id || user?._id)?.toString();
    const myData = isP1 ? battle.player1 : (isP2 ? battle.player2 : null);
    const oppData = isP1 ? battle.player2 : battle.player1;
    const isFinished = battle.status === 'completed';

    const getWinnerLabel = () => {
        if (battle.winner === 'draw') return "It's a Draw!";
        if ((battle.winner === 'player1' && isP1) || (battle.winner === 'player2' && isP2)) return "🏆 You Won!";
        return "You Lost!";
    };

    return (
        <div style={{ minHeight: '100vh', background: T.white, color: T.black, fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 40px' }}>

                {/* Image Section */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'inline-block', position: 'relative' }}>
                        <img src={battle.targetImageUrl} style={{ width: '100%', maxHeight: 400, borderRadius: 16, border: `2px solid ${T.gray4}`, objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: -15, left: '50%', transform: 'translateX(-50%)', background: T.black, color: T.white, padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Info size={14} /> Target Image
                        </div>
                    </div>
                </div>

                {/* Duel Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>

                    {/* Player 1 Col (You if P1) */}
                    <div style={{ padding: 24, borderRadius: 16, background: isP1 ? '#f0f9ff' : T.beige, border: `1px solid ${isP1 ? '#bae6fd' : T.gray4}` }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} /> {isP1 ? "Your Terminal (Player 1)" : `${battle.player1.name} (Player 1)`}
                            {battle.player1.prompt && <CheckCircle size={16} color={T.green} />}
                        </h3>

                        {(isP1 && !battle.player1.prompt && !isFinished) ? (
                            <>
                                <textarea
                                    value={promptText}
                                    onChange={e => setPromptText(e.target.value)}
                                    placeholder="Describe the image..."
                                    style={{ width: '100%', minHeight: 180, borderRadius: 12, border: `1px solid ${T.gray3}`, padding: 16, fontSize: 14, marginBottom: 16, outline: 'none' }}
                                />
                                <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: 14, borderRadius: 10, background: T.black, color: T.white, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {submitting ? 'Submitting...' : 'Submit Prompt'} <Send size={16} />
                                </button>
                            </>
                        ) : (
                            <div style={{ background: T.white, padding: 16, borderRadius: 12, border: `1px solid ${T.gray3}`, minHeight: 180 }}>
                                {battle.player1.prompt ? (
                                    <>
                                        <p style={{ fontSize: 13, color: T.gray1, fontStyle: 'italic' }}>"{battle.player1.prompt}"</p>
                                        {isFinished && (
                                            <div style={{ marginTop: 20, borderTop: `1px solid ${T.gray4}`, paddingTop: 12, textAlign: 'center' }}>
                                                <div style={{ fontSize: 32, fontWeight: 900, color: T.blue }}>{battle.player1.score}%</div>
                                                <div style={{ fontSize: 12, color: T.gray2, fontWeight: 600, textTransform: 'uppercase' }}>Accuracy Score</div>
                                            </div>
                                        )}
                                    </>
                                ) : <div style={{ color: T.gray2, fontSize: 13 }}>Waiting for submission...</div>}
                            </div>
                        )}
                    </div>

                    {/* Player 2 Col (You if P2) */}
                    <div style={{ padding: 24, borderRadius: 16, background: isP2 ? '#f0f9ff' : T.beige, border: `1px solid ${isP2 ? '#bae6fd' : T.gray4}` }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} /> {isP2 ? "Your Terminal (Player 2)" : (battle.player2 ? `${battle.player2.name} (Player 2)` : "Waiting for Player 2...")}
                            {battle.player2?.prompt && <CheckCircle size={16} color={T.green} />}
                        </h3>

                        {(isP2 && !battle.player2?.prompt && !isFinished) ? (
                            <>
                                <textarea
                                    value={promptText}
                                    onChange={e => setPromptText(e.target.value)}
                                    placeholder="Describe the image..."
                                    style={{ width: '100%', minHeight: 180, borderRadius: 12, border: `1px solid ${T.gray3}`, padding: 16, fontSize: 14, marginBottom: 16, outline: 'none' }}
                                />
                                <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: 14, borderRadius: 10, background: T.black, color: T.white, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {submitting ? 'Submitting...' : 'Submit Prompt'} <Send size={16} />
                                </button>
                            </>
                        ) : (
                            <div style={{ background: T.white, padding: 16, borderRadius: 12, border: `1px solid ${T.gray3}`, minHeight: 180 }}>
                                {battle.player2?.prompt ? (
                                    <>
                                        <p style={{ fontSize: 13, color: T.gray1, fontStyle: 'italic' }}>"{battle.player2.prompt}"</p>
                                        {isFinished && (
                                            <div style={{ marginTop: 20, borderTop: `1px solid ${T.gray4}`, paddingTop: 12, textAlign: 'center' }}>
                                                <div style={{ fontSize: 32, fontWeight: 900, color: T.blue }}>{battle.player2.score}%</div>
                                                <div style={{ fontSize: 12, color: T.gray2, fontWeight: 600, textTransform: 'uppercase' }}>Accuracy Score</div>
                                            </div>
                                        )}
                                    </>
                                ) : <div style={{ color: T.gray2, fontSize: 13 }}>{battle.player2 ? "Waiting for submission..." : "Waiting for join..."}</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Results Banner */}
                {isFinished && (
                    <div style={{ marginTop: 48, background: T.black, color: T.white, padding: 40, borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <Award size={48} color={T.yellow} style={{ marginBottom: 16 }} />
                            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>{getWinnerLabel()}</h2>
                            {battle.matchAnalysis && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12, margin: '20px auto', maxWidth: 700, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <div style={{ color: T.blue, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>Judge's Analysis</div>
                                    <p style={{ color: T.gray3, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{battle.matchAnalysis}</p>
                                </div>
                            )}
                            <p style={{ color: T.gray3, marginBottom: 32 }}>Great combat! Share your score to LinkedIn to challenge others.</p>

                            <button onClick={handleLinkedInShare} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0a66c2', color: T.white, padding: '14px 32px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                <Share2 size={18} /> Share Result to LinkedIn
                            </button>
                        </div>
                        {/* Background flare */}
                        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(33,150,243,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
}
