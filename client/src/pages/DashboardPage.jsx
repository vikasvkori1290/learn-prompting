import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Trophy, Target, BarChart2, Clock, Sparkles, ChevronRight, LogOut } from 'lucide-react';

const T = {
    white: '#ffffff', beige: '#f3f2ee', beige2: '#e9e7e0',
    black: '#1a1a1a', gray1: '#5a5a5a', gray2: '#888888',
    gray3: '#cccccc', gray4: '#eeeeee', blue: '#2196f3',
};

const card = {
    background: T.white,
    border: `1px solid ${T.gray4}`,
    borderRadius: 10,
};

function scoreColor(s) {
    if (s >= 80) return '#16a34a';
    if (s >= 60) return T.blue;
    if (s >= 40) return '#d97706';
    return '#dc2626';
}

function scoreBg(s) {
    if (s >= 80) return '#f0fdf4';
    if (s >= 60) return '#e3f2fd';
    if (s >= 40) return '#fffbeb';
    return '#fef2f2';
}

function scoreLabel(s) {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs work';
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/api/practice/history')
            .then(r => setSessions(r.data.sessions || []))
            .catch(() => setSessions([]))
            .finally(() => setLoading(false));
    }, []);

    const bestScore = sessions.length ? Math.max(...sessions.map(s => s.score)) : 0;
    const streak = (() => {
        let count = 0;
        const days = new Set(sessions.map(s => new Date(s.createdAt).toDateString()));
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            if (days.has(d.toDateString())) count++;
            else if (i > 0) break;
        }
        return count;
    })();

    const stats = [
        {
            icon: <Target size={20} color={T.blue} />,
            label: 'Total Sessions',
            value: user?.totalSessions ?? sessions.length,
            bg: '#e3f2fd',
        },
        {
            icon: <BarChart2 size={20} color="#16a34a" />,
            label: 'Average Score',
            value: user?.averageScore ? `${user.averageScore}%` : (sessions.length ? `${Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)}%` : '—'),
            bg: '#f0fdf4',
        },
        {
            icon: <Trophy size={20} color="#d97706" />,
            label: 'Best Score',
            value: bestScore ? `${bestScore}%` : '—',
            bg: '#fffbeb',
        },
        {
            icon: <Clock size={20} color="#9333ea" />,
            label: 'Day Streak',
            value: streak ? `${streak}d` : '—',
            bg: '#faf5ff',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: T.beige, fontFamily: "'Inter',sans-serif", color: T.black }}>
            <Navbar />

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '88px 24px 48px' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {user?.avatar
                                ? <img src={user.avatar} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${T.gray4}` }} />
                                : null}
                            <div>
                                <h1 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 22, fontWeight: 800, color: T.black }}>
                                    {user?.name}'s Dashboard
                                </h1>
                                <p style={{ fontSize: 13, color: T.gray2, marginTop: 2 }}>Your prompt engineering progress</p>
                            </div>
                        </div>
                        {/* Logout */}
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.gray3; e.currentTarget.style.color = T.gray1; }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                                background: T.white, border: `1px solid ${T.gray3}`,
                                color: T.gray1, fontSize: 13, fontWeight: 500,
                                fontFamily: "'Inter',sans-serif",
                                transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                            }}
                        >
                            <LogOut size={13} /> Logout
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
                    {stats.map(s => (
                        <div key={s.label} style={{ ...card, padding: '16px 18px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                {s.icon}
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk','Inter',sans-serif", color: T.black, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: T.gray2, marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Session history */}
                <div style={{ ...card, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 15, fontWeight: 700, color: T.black }}>
                            Session History
                        </h2>
                        <Link to="/practice" style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 12, color: T.blue, textDecoration: 'none', fontWeight: 600,
                        }}>
                            <Sparkles size={12} /> New Practice <ChevronRight size={12} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: T.gray2, fontSize: 13 }}>Loading history...</div>
                    ) : sessions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <p style={{ color: T.gray2, fontSize: 13, marginBottom: 14 }}>No sessions yet — start practicing!</p>
                            <Link to="/practice" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '9px 18px', borderRadius: 6, background: T.black,
                                color: T.white, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                            }}>
                                <Sparkles size={13} /> Start Practicing
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {sessions.map((s, i) => (
                                <div key={s._id || i} style={{
                                    display: 'grid', gridTemplateColumns: '52px 1fr auto',
                                    alignItems: 'center', gap: 14, padding: '12px 14px',
                                    borderRadius: 8, background: T.beige,
                                    border: `1px solid ${T.gray4}`,
                                }}>
                                    {/* Score badge */}
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 8,
                                        background: scoreBg(s.score),
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <span style={{ fontSize: 16, fontWeight: 900, color: scoreColor(s.score), lineHeight: 1, fontFamily: "'Space Grotesk','Inter',sans-serif" }}>
                                            {s.score}%
                                        </span>
                                        <span style={{ fontSize: 8, color: scoreColor(s.score), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {scoreLabel(s.score)}
                                        </span>
                                    </div>

                                    {/* Prompt + feedback */}
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 13, fontWeight: 500, color: T.black,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            "{s.userPrompt}"
                                        </div>
                                        {s.feedback && (
                                            <div style={{
                                                fontSize: 11, color: T.gray2, marginTop: 3,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {s.feedback}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div style={{ fontSize: 11, color: T.gray3, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        {formatDate(s.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
