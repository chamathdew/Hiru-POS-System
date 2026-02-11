import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { success, message } = await login(email, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError(message);
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <img src={logo} alt="H" style={{ width: '32px' }} />
                    </div>
                    <h1>Hiru POS</h1>
                    <p>Welcome back! Please login.</p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="input-glass"
                            placeholder="admin@hiru.lk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="input-glass"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary login-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Demo: <b>admin@hiru.lk</b> / <b>Admin@123</b>
                        </p>
                    </div>

                    <p className="login-footer">
                        Forgot your password? <span style={{ color: 'var(--primary-orange)', cursor: 'pointer' }}>Contact System Admin</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
