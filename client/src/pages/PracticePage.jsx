import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ScoreDisplay from '../components/ScoreDisplay';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Sparkles, RefreshCw, Send, Lightbulb, Clock, Trophy, Loader2, ImageOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const T = { white: '#ffffff', beige: '#f3f2ee', beige2: '#e9e7e0', black: '#1a1a1a', gray1: '#5a5a5a', gray2: '#888888', gray3: '#cccccc', gray4: '#eeeeee', blue: '#2196f3' };

const card = { background: T.white, border: `1px solid ${T.gray4}`, borderRadius: 10 };

const DIFF = {
    easy: { label: 'Easy', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    medium: { label: 'Medium', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    hard: { label: 'Hard', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function PracticePage() {
    const { user } = useAuth();
    const [image, setImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [hintText, setHintText] = useState('');
    const [hintLoading, setHintLoading] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [timeStart, setTimeStart] = useState(null);

    useEffect(() => {
        if (!timeStart || result) return;
        const t = setInterval(() => setElapsed(Math.floor((Date.now() - timeStart) / 1000)), 1000);
        return () => clearInterval(t);
    }, [timeStart, result]);

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const fetchHint = async (img) => {
        if (!img) return;
        setHintLoading(true); setHintText('');
        try {
            const res = await axiosInstance.post('/api/practice/hint', { imageUrl: img.imageUrl });
            setHintText(res.data.hint);
        } catch {
            // fallback to tags if hint API fails
            setHintText(img.tags ? `Category: ${img.tags.join(', ')}` : 'No hint available');
        } finally { setHintLoading(false); }
    };

    const fetchImage = useCallback(async () => {
        setImageLoading(true); setResult(null); setPrompt('');
        setAttempts([]); setShowHint(false); setHintText(''); setElapsed(0);
        try {
            const res = await axiosInstance.get('/api/practice/image');
            setImage(res.data.image);
            setTimeStart(Date.now());
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load image. Run: node seed.js');
        } finally { setImageLoading(false); }
    }, []);

    useEffect(() => { fetchImage(); }, [fetchImage]);

    const handleEvaluate = async () => {
        if (!prompt.trim() || prompt.trim().length < 5) return toast.error('Write a more detailed prompt');
        if (!image) return;
        setEvaluating(true);
        try {
            const res = await axiosInstance.post('/api/practice/evaluate', { imageUrl: image.imageUrl, userPrompt: prompt.trim(), imageId: image._id });
            const { score, feedback } = res.data;
            setResult({ score, feedback });
            setAttempts(p => [{ prompt: prompt.trim(), score }, ...p]);
            if (score >= 80) toast.success(`${score}% — Excellent! 🎉`, { duration: 4000 });
            else if (score >= 60) toast.success(`${score}% — Good work!`);
            else toast(`${score}% — Keep refining!`, { icon: '✏️' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Evaluation failed');
        } finally { setEvaluating(false); }
    };

    const bestScore = attempts.length ? Math.max(...attempts.map(a => a.score)) : null;
    const diff = image ? (DIFF[image.difficulty] || DIFF.medium) : null;

    return (
        <div style={{ minHeight: '100vh', background: T.beige, fontFamily: "'Inter',sans-serif", color: T.black }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 40px' }}>

                {/* Top bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 22, fontWeight: 800, color: T.black }}>Practice Prompting</h1>
                        <p style={{ fontSize: 13, color: T.gray2, marginTop: 3 }}>Describe the image on the left as precisely as possible</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {diff && <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: diff.color, background: diff.bg, border: `1px solid ${diff.border}` }}>{diff.label}</span>}
                        {timeStart && !imageLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: T.white, border: `1px solid ${T.gray4}`, fontSize: 12, color: T.gray1 }}>
                                <Clock size={12} color={T.gray2} /> {fmt(elapsed)}
                            </div>
                        )}
                        {bestScore !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: T.white, border: `1px solid ${T.gray4}`, fontSize: 12 }}>
                                <Trophy size={12} color="#d97706" />
                                <span style={{ color: '#d97706', fontWeight: 600 }}>Best: {bestScore}%</span>
                            </div>
                        )}
                        <button onClick={fetchImage} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
                            background: T.white, border: `1px solid ${T.gray3}`, cursor: 'pointer',
                            color: T.black, fontSize: 13, fontWeight: 500, fontFamily: "'Inter',sans-serif",
                            transition: 'background .18s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = T.beige}
                            onMouseLeave={e => e.currentTarget.style.background = T.white}
                        >
                            <RefreshCw size={13} /> New Image
                        </button>
                    </div>
                </div>

                {/* Two panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, minHeight: 520 }}>

                    {/* LEFT: Image */}
                    <div style={{ ...card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                            {imageLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: T.gray2 }}>
                                    <Loader2 size={30} style={{ animation: 'spin 0.8s linear infinite', color: T.blue }} />
                                    <span style={{ fontSize: 13 }}>Loading image...</span>
                                </div>
                            ) : image ? (
                                <img src={image.imageUrl} alt="Practice reference"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, maxHeight: 380 }}
                                    onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: T.gray2 }}>
                                    <ImageOff size={30} />
                                    <span style={{ fontSize: 13 }}>No image — run: node seed.js</span>
                                </div>
                            )}
                        </div>

                        {image && (
                            <div style={{ padding: '0 14px 14px' }}>
                                <button onClick={() => {
                                    const next = !showHint;
                                    setShowHint(next);
                                    if (next && !hintText) fetchHint(image);
                                }} style={{
                                    width: '100%', padding: '9px 14px', borderRadius: 6, cursor: 'pointer',
                                    background: '#fffbeb', border: '1px solid #fde68a',
                                    color: '#92400e', fontSize: 12, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    fontFamily: "'Inter',sans-serif",
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Lightbulb size={13} /> {showHint ? 'Hide hint' : 'Show hint'}
                                    </span>
                                    <span>{showHint ? '▲' : '▼'}</span>
                                </button>
                                {showHint && (
                                    <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 6, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                                        {hintLoading
                                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating hint...</span>
                                            : <span>💡 {hintText}</span>
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Prompt + Score */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: T.gray1, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Sparkles size={13} color={T.blue} /> Your Prompt
                                </span>
                                <span style={{ fontSize: 11, color: T.gray2 }}>{prompt.length} chars · Ctrl+Enter to submit</span>
                            </div>

                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleEvaluate(); }}
                                placeholder={'Describe the image as if instructing an AI image generator...\n\ne.g. "a mountain lake at golden hour with snow-capped peaks, cinematic photography"'}
                                disabled={evaluating}
                                style={{
                                    width: '100%', boxSizing: 'border-box', minHeight: 200,
                                    padding: '12px', borderRadius: 6, resize: 'vertical',
                                    background: T.white, border: `1px solid ${T.gray3}`,
                                    color: T.black, fontSize: 13, lineHeight: 1.65,
                                    fontFamily: "'Inter',sans-serif", transition: 'border-color .18s',
                                }}
                                onFocus={e => { e.target.style.borderColor = T.blue; e.target.style.boxShadow = '0 0 0 3px rgba(33,150,243,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = T.gray3; e.target.style.boxShadow = 'none'; }}
                            />

                            <button onClick={handleEvaluate} disabled={evaluating || !prompt.trim() || imageLoading} style={{
                                width: '100%', padding: '12px', borderRadius: 6,
                                background: T.black, color: T.white,
                                fontSize: 14, fontWeight: 600, border: 'none',
                                cursor: (evaluating || !prompt.trim() || imageLoading) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                opacity: (evaluating || !prompt.trim() || imageLoading) ? 0.45 : 1,
                                fontFamily: "'Inter',sans-serif", transition: 'background .18s',
                            }}
                                onMouseEnter={e => { if (!evaluating && prompt.trim()) e.currentTarget.style.background = '#333'; }}
                                onMouseLeave={e => e.currentTarget.style.background = T.black}
                            >
                                {evaluating
                                    ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Evaluating...</>
                                    : <><Send size={14} /> Evaluate My Prompt</>
                                }
                            </button>
                        </div>

                        {result && (
                            <div style={{ ...card, padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                                <ScoreDisplay score={result.score} feedback={result.feedback} />
                                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                    <button onClick={() => { setResult(null); setPrompt(''); }} style={{
                                        flex: 1, padding: '9px', borderRadius: 6, cursor: 'pointer',
                                        background: T.white, border: `1px solid ${T.gray3}`,
                                        color: T.black, fontSize: 13, fontWeight: 500, fontFamily: "'Inter',sans-serif",
                                        transition: 'background .18s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.beige}
                                        onMouseLeave={e => e.currentTarget.style.background = T.white}
                                    >
                                        Try Again
                                    </button>
                                    <button onClick={fetchImage} style={{
                                        flex: 1, padding: '9px', borderRadius: 6, cursor: 'pointer',
                                        background: T.black, border: 'none',
                                        color: T.white, fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif",
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                    }}>
                                        <RefreshCw size={13} /> Next Image
                                    </button>
                                </div>
                            </div>
                        )}

                        {attempts.length > 1 && (
                            <div style={{ ...card, padding: 14 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: T.gray2, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Attempt History</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 130, overflowY: 'auto' }}>
                                    {attempts.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                                            <span style={{ fontWeight: 700, minWidth: 34, textAlign: 'right', color: a.score >= 70 ? '#16a34a' : a.score >= 45 ? '#d97706' : '#dc2626' }}>{a.score}%</span>
                                            <span style={{ color: T.gray2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.prompt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {user?.totalSessions > 0 && (
                    <div style={{ marginTop: 14, ...card, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 20, fontSize: 12 }}>
                        <span style={{ color: T.gray2 }}>Your stats:</span>
                        <span style={{ color: T.gray1 }}><span style={{ color: T.black, fontWeight: 600 }}>{user.totalSessions}</span> sessions</span>
                        <span style={{ color: T.gray1 }}>Avg: <span style={{ color: T.black, fontWeight: 600 }}>{user.averageScore}%</span></span>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
