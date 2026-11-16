import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p>Login to your Triveni Terrace Café account.</p>

                <form onSubmit={handleSubmit}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="forgot-link">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {message && <p className="auth-message">{message}</p>}

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>

                <Link to="/" className="back-home">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}