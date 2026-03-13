import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Sparkles, User, LayoutDashboard, Users } from 'lucide-react';
import { useState } from 'react';

/* ── tokens ── */
const T = {
    white: '#ffffff',
    black: '#1a1a1a',
    gray1: '#5a5a5a',
    gray3: '#cccccc',
    gray4: '#eeeeee',
    blue: '#2196f3',
    beige: '#f3f2ee',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [chipHover, setChipHover] = useState(false);

    const btnBlack = {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
        background: T.black, color: T.white,
        fontSize: 13, fontWeight: 600, border: 'none',
        fontFamily: "'Inter',sans-serif", textDecoration: 'none',
        transition: 'background .18s',
    };
    const btnOutline = {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 18px', borderRadius: 6, cursor: 'pointer',
        background: 'transparent',
        border: `1px solid ${T.gray3}`,
        color: T.black, fontSize: 13, fontWeight: 500,
        fontFamily: "'Inter',sans-serif", textDecoration: 'none',
        transition: 'border-color .18s, background .18s',
    };

    return (
        <header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            background: T.white,
            borderBottom: `1px solid ${T.gray4}`,
        }}>
            <div style={{
                maxWidth: 1280, margin: '0 auto', padding: '0 28px',
                height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>

                {/* LEFT: Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                    <Sparkles size={18} color={T.blue} />
                    <span style={{
                        fontFamily: "'Space Grotesk','Inter',sans-serif",
                        fontWeight: 800, fontSize: 17, color: T.black, letterSpacing: '-0.02em',
                    }}>
                        Prompt<span style={{ color: T.blue }}>Quest</span>
                    </span>
                </Link>

                {/* RIGHT: Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {user ? (
                        <>
                            {/* User chip → Dashboard link (crossfade on hover) */}
                            <Link to="/dashboard"
                                onMouseEnter={() => setChipHover(true)}
                                onMouseLeave={() => setChipHover(false)}
                                style={{
                                    position: 'relative',
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '5px 12px', borderRadius: 6,
                                    background: chipHover ? T.black : T.beige,
                                    border: `1px solid ${chipHover ? T.black : T.gray4}`,
                                    textDecoration: 'none',
                                    transition: 'background 0.25s ease, border-color 0.25s ease',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    minWidth: 90,
                                }}
                            >
                                {/* Default state: avatar + name */}
                                <span style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    opacity: chipHover ? 0 : 1,
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: 'none',
                                }}>
                                    {user.avatar
                                        ? <img src={user.avatar} alt={user.name} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} />
                                        : <User size={14} color={T.gray1} />
                                    }
                                    <span style={{ fontSize: 13, fontWeight: 500, color: T.black, whiteSpace: 'nowrap' }}>
                                        {user.name}
                                    </span>
                                </span>

                                {/* Hover state: dashboard icon + text (absolute overlay) */}
                                <span style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    opacity: chipHover ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: 'none',
                                }}>
                                    <LayoutDashboard size={14} color={T.white} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: T.white, whiteSpace: 'nowrap' }}>
                                        Dashboard
                                    </span>
                                </span>
                            </Link>

                            {/* Arena */}
                            <Link to="/arena" style={{ ...btnOutline, background: T.beige, borderColor: T.blue, color: T.blue }}
                                onMouseEnter={e => e.currentTarget.style.background = '#e3f2fd'}
                                onMouseLeave={e => e.currentTarget.style.background = T.beige}
                            >
                                <Users size={15} /> Arena
                            </Link>

                            {/* Practice */}
                            <Link to="/practice" style={btnBlack}
                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                onMouseLeave={e => e.currentTarget.style.background = T.black}
                            >
                                <Sparkles size={13} /> Practice
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/practice" style={btnOutline}
                                onMouseEnter={e => { e.currentTarget.style.background = T.beige; e.currentTarget.style.borderColor = '#aaa'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.gray3; }}
                            >
                                <Sparkles size={13} color={T.blue} /> Practice
                            </Link>
                            <Link to="/login" style={btnOutline}
                                onMouseEnter={e => { e.currentTarget.style.background = T.beige; e.currentTarget.style.borderColor = '#aaa'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.gray3; }}
                            >
                                <LogIn size={13} /> Sign In
                            </Link>
                            <Link to="/register" style={btnBlack}
                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                onMouseLeave={e => e.currentTarget.style.background = T.black}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}
