import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import AuthLayout from '../components/auth/AuthLayout';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (form.password.length < 8) {
            setMessage('Password must contain at least 8 characters.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    full_name: form.name
                },
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
        } else {
            setMessage(
                'Account created! Please check your email and verify your account before logging in.'
            );

            setForm({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join us and make your café experience special."
        >
            <form className="auth-form" onSubmit={handleSubmit}>

                <label>Full Name</label>

                <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <label>Email Address</label>

                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label>Password</label>

                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                    />

                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <label>Confirm Password</label>

                <div className="password-wrapper">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle confirm password visibility"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

            </form>

            {message && (
                <p className="auth-message">{message}</p>
            )}

            <p className="auth-switch">
                Already have an account? <Link to="/login">Sign In</Link>
            </p>
        </AuthLayout>
    );
}