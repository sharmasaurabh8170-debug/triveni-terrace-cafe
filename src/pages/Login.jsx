import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import AuthLayout from '../components/auth/AuthLayout';

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

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
            return;
        }

        navigate('/dashboard');
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your Triveni Terrace Café account."
        >
            <form className="auth-form" onSubmit={handleSubmit}>

                <label>Email Address</label>

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>

                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="forgot-link">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>

            </form>

            {message && (
                <p className="auth-message">{message}</p>
            )}

            <p className="auth-switch">
                Don't have an account? <Link to="/register">Create Account</Link>
            </p>
        </AuthLayout>
    );
}