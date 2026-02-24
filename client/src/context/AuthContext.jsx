import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pq_token') || null);
    const [loading, setLoading] = useState(true);

    // On mount, verify token & load user
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('pq_token');
            if (savedToken) {
                try {
                    const res = await axiosInstance.get('/api/auth/me');
                    setUser(res.data.user);
                    setToken(savedToken);
                } catch {
                    localStorage.removeItem('pq_token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const saveAuth = (token, user) => {
        localStorage.setItem('pq_token', token);
        setToken(token);
        setUser(user);
    };

    const register = async (name, email, password) => {
        const res = await axiosInstance.post('/api/auth/register', { name, email, password });
        saveAuth(res.data.token, res.data.user);
        return res.data;
    };

    const login = async (email, password) => {
        const res = await axiosInstance.post('/api/auth/login', { email, password });
        saveAuth(res.data.token, res.data.user);
        return res.data;
    };

    const googleLogin = async (credential) => {
        const res = await axiosInstance.post('/api/auth/google', { credential });
        saveAuth(res.data.token, res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('pq_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
