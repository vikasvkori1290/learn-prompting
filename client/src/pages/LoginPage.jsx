import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';

const T = { white: '#ffffff', beige: '#f3f2ee', beige2: '#e9e7e0', black: '#1a1a1a', gray1: '#5a5a5a', gray2: '#888888', gray3: '#cccccc', gray4: '#eeeeee', blue: '#2196f3' };

const inputBase = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px 10px 38px',
    borderRadius: 6, fontSize: 14,
    background: T.white,
    border: `1px solid ${T.gray3}`,
    color: T.black,
    fontFamily: "'Inter',sans-serif",
    transition: 'border-color .18s, box-shadow .18s',
};

export default function LoginPage() {
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const handleGoogle = async (cr) => {
        try {
            await googleLogin(cr.credential);
            toast.success('Signed in with Google!');
            navigate('/');
        } catch { toast.error('Google sign-in failed'); }
    };

    const iStyle = (name) => ({
        ...inputBase,
        borderColor: focused === name ? T.blue : T.gray3,
        boxShadow: focused === name ? `0 0 0 3px rgba(33,150,243,0.1)` : 'none',
    });

    return (
        <div style={{ minHeight: '100vh', background: T.beige, fontFamily: "'Inter',sans-serif" }}>
            <Navbar />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 16px 48px' }}>
                <div style={{ width: '100%', maxWidth: 400, background: T.white, border: `1px solid ${T.gray4}`, borderRadius: 12, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 26 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 14 }}>
                            <Sparkles size={18} color={T.blue} />
                            <span style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontWeight: 800, fontSize: 17, color: T.black }}>
                                Prompt<span style={{ color: T.blue }}>Quest</span>
                            </span>
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: 22, fontWeight: 700, color: T.black, marginBottom: 6 }}>Welcome back</h1>
                        <p style={{ fontSize: 13, color: T.gray2 }}>Sign in to continue your practice</p>
                    </div>

                    {/* Google */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <GoogleLogin onSuccess={handleGoogle} onError={() => toast.error('Google sign-in failed')} theme="outline" size="large" shape="rectangular" width="336" />
                    </div>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
                        <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${T.gray4}` }} />
                        <span style={{ fontSize: 12, color: T.gray2 }}>or</span>
                        <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${T.gray4}` }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* Email */}
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.gray2, pointerEvents: 'none' }}><Mail size={14} /></span>
                            <input type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange}
                                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} style={iStyle('email')} autoComplete="email" />
                        </div>

                        {/* Password */}
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.gray2, pointerEvents: 'none' }}><Lock size={14} /></span>
                            <input type={showPass ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange}
                                onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                                style={{ ...iStyle('password'), paddingRight: 36 }} autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray2, display: 'flex' }}>
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '11px', borderRadius: 6, marginTop: 4,
                            background: T.black, color: T.white, fontSize: 14, fontWeight: 600,
                            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            opacity: loading ? 0.65 : 1, fontFamily: "'Inter',sans-serif",
                            transition: 'background .18s',
                        }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#333'; }}
                            onMouseLeave={e => e.currentTarget.style.background = T.black}
                        >
                            {loading
                                ? <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                : <><LogIn size={15} /> Sign In</>
                            }
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 13, color: T.gray2, marginTop: 20 }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: T.blue, fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
                    </p>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
