import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

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

        if (form.password !== form.confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        if (form.password.length < 8) {
            setMessage('Password must contain at least 8 characters.');
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
                'Registration successful! Please check your email to verify your account.'
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p>Register to enjoy Triveni Terrace Café services.</p>

                <form onSubmit={handleSubmit}>
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
                    <input
                        type="password"
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                    />

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {message && <p className="auth-message">{message}</p>}

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

                <Link to="/" className="back-home">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}