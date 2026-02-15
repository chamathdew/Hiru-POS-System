import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import logo from '../assets/logo.png';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-vibrant-screen">
            <div className="login-glow-circle top-right"></div>
            <div className="login-glow-circle bottom-left"></div>

            <div className="glass-card login-vibrant-card fade-in">
                <div className="login-vibrant-header">
                    <img src={logo} alt="Hiru POS" className="login-main-logo" />
                </div>

                {error && <div className="vibrant-error-alert" style={{ padding: '1rem', marginBottom: '2rem' }}>{error}</div>}

                <form onSubmit={handleLogin} className="login-vibrant-form">
                    <div className="vibrant-form-group">
                        <label className="vibrant-label">Email Access</label>
                        <input
                            type="email"
                            className="vibrant-input"
                            placeholder="admin@hiru.lk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="vibrant-form-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="vibrant-label">Security Key</label>
                        <input
                            type="password"
                            className="vibrant-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full-vibrant" disabled={loading} style={{ justifyContent: 'center', fontSize: '1.1rem' }}>
                        {loading ? 'Authenticating...' : (
                            <>
                                <LogIn size={20} /> Access System
                            </>
                        )}
                    </button>

                    <div className="login-vibrant-hint">
                        <p>Demo Credentials</p>
                        <code>admin@hiru.lk  /  Admin@123</code>
                    </div>
                </form>
            </div>

            <div className="login-footer-vibrant">
                &copy; {new Date().getFullYear()} Hiru POS. All Rights Reserved.
            </div>
        </div>
    );
};

export default Login;
