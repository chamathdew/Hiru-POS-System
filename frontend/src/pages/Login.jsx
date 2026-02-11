import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import logo from '../assets/logo.png';
import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-vibrant-screen">
            <div className="login-glow-circle top-right"></div>
            <div className="login-glow-circle bottom-left"></div>

            <div className="glass-card login-vibrant-card fade-in">
                <div className="login-vibrant-header">
                    <div className="logo-vibrant-box">
                        <img src={logo} alt="H" style={{ width: '32px' }} />
                    </div>
                    <h1>Hiru POS</h1>
                    <p>Logistical Enterprise Solutions</p>
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
