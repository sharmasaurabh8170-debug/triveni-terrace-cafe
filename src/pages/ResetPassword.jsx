import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import AuthLayout from '../components/auth/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password.length < 8) {
            setMessage('Password must contain at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage('Password updated successfully! Redirecting to login...');

        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Choose a new password for your account."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <label>New Password</label>

                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />

                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <label>Confirm New Password</label>

                <div className="password-wrapper">
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <p className="auth-switch">
                <Link to="/login">Back to Sign In</Link>
            </p>
        </AuthLayout>
    );
}