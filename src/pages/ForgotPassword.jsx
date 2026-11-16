import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import AuthLayout from '../components/auth/AuthLayout';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('If an account exists for this email, a password-reset link will be sent.');
        }
    };

    return (
        <AuthLayout
            title="Forgot Password?"
            subtitle="Enter your email address to receive a password-reset link."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <p className="auth-switch">
                Remember your password? <Link to="/login">Sign In</Link>
            </p>
        </AuthLayout>
    );
}