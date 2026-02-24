import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Sparkles, User } from 'lucide-react';

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
                            {/* User chip */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '5px 12px', borderRadius: 6,
                                background: T.beige, border: `1px solid ${T.gray4}`,
                            }}>
                                {user.avatar
                                    ? <img src={user.avatar} alt={user.name} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                                    : <User size={14} color={T.gray1} />
                                }
                                <span style={{ fontSize: 13, fontWeight: 500, color: T.black, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.name}
                                </span>
                            </div>

                            {/* Practice */}
                            <Link to="/practice" style={btnBlack}
                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                onMouseLeave={e => e.currentTarget.style.background = T.black}
                            >
                                <Sparkles size={13} /> Practice
                            </Link>

                            {/* Logout */}
                            <button onClick={() => { logout(); navigate('/'); }} style={btnOutline}
                                onMouseEnter={e => { e.currentTarget.style.background = T.beige; e.currentTarget.style.borderColor = '#aaa'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.gray3; }}
                            >
                                <LogOut size={13} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
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
