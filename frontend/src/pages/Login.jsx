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
        <div className="login-screen">
            <div className="login-auth-card fade-up">
                <div className="login-top">
                    <div className="login-logo-box">
                        <img src={logo} alt="H" style={{ width: '24px' }} />
                    </div>
                    <h2>Hiru POS System</h2>
                    <p>Secure login for staff and admins</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="field-group">
                        <label className="field-label">Workspace Identity (Email)</label>
                        <input
                            type="email"
                            className="field-input"
                            placeholder="admin@hiru.lk"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Access Passcode</label>
                        <input
                            type="password"
                            className="field-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary login-action-btn" disabled={loading}>
                        {loading ? 'Verifying Access...' : 'Authenticate'}
                    </button>

                    <div className="demo-hint">
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>INTERNAL DEMO ACCESS</p>
                        <p style={{ fontSize: '0.85rem' }}>
                            <code>admin@hiru.lk</code> / <code>Admin@123</code>
                        </p>
                    </div>
                </form>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Managed Enterprise POS Solutions by Hiru
            </p>
        </div>
    );
};

export default Login;
