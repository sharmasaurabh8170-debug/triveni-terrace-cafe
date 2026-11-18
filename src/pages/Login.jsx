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

        try {
            // Step 1: Sign in the user
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (error) {
                setMessage(error.message);
                return;
            }

            const userId = data.user?.id;

            if (!userId) {
                setMessage('Login succeeded, but user information could not be retrieved. Please try again.');
                return;
            }

            // Step 2: Check whether the user is an admin
            const { data: adminRecord, error: adminError } = await supabase
                .from('admin_users')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (adminError) {
                console.error('Admin permission check failed:', adminError);

                setMessage(
                    'Login successful, but we could not verify your account permissions. Please sign in again or contact the administrator.'
                );
                return;
            }

            // Step 3: Redirect according to account role
            if (adminRecord) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }

        } catch (error) {
            console.error('Login error:', error);
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
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