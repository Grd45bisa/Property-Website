import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

import './LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setErrorMsg(error.message || 'Terjadi kesalahan saat login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="login-page">
                <div className="login-card">
                    <h1 className="login-title">{isSignUp ? 'Buat Akun Baru' : 'Masuk ke Dashboard'}</h1>
                    <p className="login-subtitle">
                        {isSignUp
                            ? 'Mulai buat virtual tour properti Anda sekarang.'
                            : 'Kelola project virtual tour Anda.'}
                    </p>

                    {errorMsg && <div className="login-error">{errorMsg}</div>}

                    <form onSubmit={handleAuth} className="login-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary full-width" disabled={loading}>
                            {loading ? 'Memproses...' : (isSignUp ? 'Daftar Sekarang' : 'Masuk')}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="btn-link"
                            >
                                {isSignUp ? 'Login disini' : 'Daftar disini'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;
