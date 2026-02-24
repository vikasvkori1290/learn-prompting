import { useEffect, useState } from 'react';

const T = { black: '#1a1a1a', gray1: '#5a5a5a', gray2: '#888888', gray4: '#eeeeee', beige: '#f3f2ee', blue: '#2196f3' };

const THEMES = {
    excellent: { stroke: '#16a34a', text: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Excellent! 🎉' },
    good: { stroke: T.blue, text: T.blue, bg: '#e3f2fd', border: '#90caf9', label: 'Good work! 💪' },
    fair: { stroke: '#d97706', text: '#b45309', bg: '#fffbeb', border: '#fde68a', label: 'Keep refining ✏️' },
    poor: { stroke: '#dc2626', text: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: 'Try again! 🔄' },
};

function getTheme(score) {
    if (score >= 80) return THEMES.excellent;
    if (score >= 60) return THEMES.good;
    if (score >= 40) return THEMES.fair;
    return THEMES.poor;
}

export default function ScoreDisplay({ score, feedback }) {
    const [animScore, setAnimScore] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const duration = 1200;
        const raf = () => {
            const t = Math.min((Date.now() - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setAnimScore(Math.round(ease * score));
            if (t < 1) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }, [score]);

    const theme = getTheme(score);
    const r = 50;
    const circ = 2 * Math.PI * r;
    const offset = circ - (animScore / 100) * circ;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', animation: 'fadeInUp 0.4s ease forwards' }}>

            {/* Ring */}
            <div style={{ position: 'relative', width: 124, height: 124 }}>
                <svg width="124" height="124" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="62" cy="62" r={r} fill="none" stroke={T.gray4} strokeWidth="9" />
                    <circle cx="62" cy="62" r={r} fill="none"
                        stroke={theme.stroke} strokeWidth="9" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 26, fontWeight: 900, color: theme.text, lineHeight: 1 }}>
                        {animScore}%
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.gray2, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>match</span>
                </div>
            </div>

            {/* Label badge */}
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, padding: '4px 14px', borderRadius: 4, background: theme.bg, border: `1px solid ${theme.border}` }}>
                {theme.label}
            </span>

            {/* Feedback */}
            {feedback && (
                <div style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: theme.bg, border: `1px solid ${theme.border}`, fontSize: 13, color: T.gray1, lineHeight: 1.65, textAlign: 'left' }}>
                    {feedback}
                </div>
            )}
        </div>
    );
}
