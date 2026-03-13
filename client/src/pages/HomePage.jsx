import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Sparkles, Eye, PenLine, Trophy, ArrowRight, Zap, Target, Star } from 'lucide-react';

/* ── tokens ── */
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

const steps = [
    { icon: <Eye size={24} color={T.black} />, title: 'See the Image', desc: 'A curated reference image is shown on the left — study it carefully.', num: '01' },
    { icon: <PenLine size={24} color={T.black} />, title: 'Write the Prompt', desc: 'Craft the text prompt you think was used to generate that exact image.', num: '02' },
    { icon: <Trophy size={24} color={T.black} />, title: 'Get Your Score', desc: 'Gemini AI evaluates your prompt and scores accuracy from 0–100%.', num: '03' },
];

const features = [
    { icon: <Zap size={14} />, text: 'Powered by Gemini 1.5 Flash' },
    { icon: <Target size={14} />, text: 'Precision prompt scoring' },
    { icon: <Star size={14} />, text: 'Track your progress' },
];

export default function HomePage() {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: T.white, color: T.black, fontFamily: "'Inter',sans-serif" }}>
            <Navbar />

            {/* ══ HERO ══════════════════════════════════════════════ */}
            <section style={{ paddingTop: 100, paddingBottom: 72, background: T.white }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>

                    {/* Text block */}
                    <div style={{ flex: '1 1 440px', minWidth: 300 }}>
                        {/* Small tag */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '5px 12px', borderRadius: 4,
                            background: T.beige, border: `1px solid ${T.beige2}`,
                            fontSize: 12, fontWeight: 600, color: T.gray1,
                            marginBottom: 22, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                            <Sparkles size={12} color={T.blue} />
                            AI Prompt Training
                        </div>

                        <h1 style={{
                            fontFamily: "'Space Grotesk','Inter',sans-serif",
                            fontSize: 'clamp(34px,4.5vw,58px)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-0.025em',
                            color: T.black,
                            marginBottom: 20,
                        }}>
                            Master the Art of<br />
                            <span style={{ color: T.blue }}>AI Prompting</span>
                        </h1>

                        <p style={{ fontSize: 16, color: T.gray1, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                            See an image, write the perfect prompt, and let Gemini AI judge how close you are.
                            Train your prompting intuition like the world's best AI engineers.
                        </p>

                        {/* Feature pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
                            {features.map((f, i) => (
                                <span key={i} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', borderRadius: 4,
                                    background: T.beige, border: `1px solid ${T.beige2}`,
                                    fontSize: 12, color: T.gray1, fontWeight: 500,
                                }}>
                                    <span style={{ color: T.blue }}>{f.icon}</span>
                                    {f.text}
                                </span>
                            ))}
                        </div>

                        {/* CTA */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <Link to={user ? '/arena' : '/register'} style={{
                                flex: '1 1 auto',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '12px 24px', borderRadius: 6,
                                background: T.blue, color: T.white,
                                fontSize: 14, fontWeight: 700,
                                textDecoration: 'none', fontFamily: "'Inter',sans-serif",
                                transition: 'background .18s',
                                minWidth: 160
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1e88e5'}
                                onMouseLeave={e => e.currentTarget.style.background = T.blue}
                            >
                                <Trophy size={16} />
                                Create Battle
                            </Link>
                            <Link to={user ? '/practice' : '/register'} style={{
                                flex: '1 1 auto',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '12px 24px', borderRadius: 6,
                                background: T.black, color: T.white,
                                fontSize: 14, fontWeight: 700,
                                textDecoration: 'none', fontFamily: "'Inter',sans-serif",
                                transition: 'background .18s',
                                minWidth: 160
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                onMouseLeave={e => e.currentTarget.style.background = T.black}
                            >
                                <Zap size={16} />
                                {user ? 'Solo Practice' : 'Start Practicing'}
                            </Link>

                            {!user && (
                                <Link to="/login" style={{
                                    width: '100%',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '11px 24px', borderRadius: 6,
                                    background: 'transparent', border: `1px solid ${T.gray3}`,
                                    color: T.black, fontSize: 14, fontWeight: 500,
                                    textDecoration: 'none', fontFamily: "'Inter',sans-serif",
                                    transition: 'border-color .18s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#999'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = T.gray3}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: App mockup card */}
                    <div style={{ flex: '1 1 360px', minWidth: 300 }}>
                        <div style={{
                            background: T.white, borderRadius: 12,
                            border: `1px solid ${T.gray4}`,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                            overflow: 'hidden',
                        }}>
                            {/* Top bar */}
                            <div style={{ padding: '12px 16px', background: T.beige, borderBottom: `1px solid ${T.gray4}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                            </div>
                            {/* Mock panels */}
                            <div style={{ display: 'flex', gap: 12, padding: 14, height: 210 }}>
                                <div style={{
                                    flex: 1, borderRadius: 8, background: T.beige,
                                    border: `1px solid ${T.gray4}`,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                    <Eye size={24} color={T.gray2} />
                                    <p style={{ fontSize: 11, color: T.gray2, fontWeight: 600 }}>Reference Image</p>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ flex: 1, borderRadius: 8, background: T.beige, border: `1px solid ${T.gray4}`, padding: 10, fontSize: 11, color: T.gray2 }}>
                                        a serene mountain lake at golden hour...
                                    </div>
                                    <div style={{ height: 34, borderRadius: 6, background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: T.white, gap: 5 }}>
                                        <Sparkles size={12} /> Evaluate My Prompt
                                    </div>
                                    <div style={{ height: 50, borderRadius: 8, background: T.beige, border: `1px solid ${T.gray4}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 22, fontWeight: 900, color: T.blue }}>78%</span>
                                        <span style={{ fontSize: 11, color: T.gray2 }}>Great accuracy!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
            <section style={{ background: T.beige, borderTop: `1px solid ${T.gray4}`, borderBottom: `1px solid ${T.gray4}`, padding: '72px 28px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 28, fontWeight: 800, color: T.black, marginBottom: 8 }}>
                        How It Works
                    </h2>
                    <p style={{ fontSize: 14, color: T.gray1, marginBottom: 40 }}>Three simple steps to sharpen your prompting skills</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{
                                background: T.white, borderRadius: 10,
                                border: `1px solid ${T.gray4}`,
                                padding: '28px 24px',
                                transition: 'box-shadow .2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 8,
                                        background: T.beige, border: `1px solid ${T.gray4}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {step.icon}
                                    </div>
                                    <span style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 36, fontWeight: 900, color: T.gray4, lineHeight: 1 }}>{step.num}</span>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.black, marginBottom: 8 }}>{step.title}</h3>
                                <p style={{ fontSize: 13, color: T.gray1, lineHeight: 1.65 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══════════════════════════════════════ */}
            <footer style={{ background: T.white, borderTop: `1px solid ${T.gray4}`, padding: '20px 28px', textAlign: 'center', fontSize: 12, color: T.gray2 }}>
                © {new Date().getFullYear()} PromptQuest · Built with MERN + Gemini AI
            </footer>
        </div>
    );
}
