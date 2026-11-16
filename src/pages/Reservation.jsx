import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import AuthLayout from '../components/auth/AuthLayout';

export default function Reservation() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        reservation_date: '',
        reservation_time: '',
        guests: '2',
        special_request: '',
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate('/login');
            return;
        }

        const selectedDateTime = new Date(
            `${form.reservation_date}T${form.reservation_time}`
        );

        if (selectedDateTime <= new Date()) {
            setMessage('Please select a future date and time.');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('reservations')
            .insert([{
                user_id: user.id,
                full_name: form.full_name,
                email: user.email,
                phone: form.phone,
                reservation_date: form.reservation_date,
                reservation_time: form.reservation_time,
                guests: Number(form.guests),
                special_request: form.special_request,
            }]);

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage('Your reservation request has been submitted successfully!');

        setForm({
            full_name: '',
            phone: '',
            reservation_date: '',
            reservation_time: '',
            guests: '2',
            special_request: '',
        });
    };

    const today = new Date().toLocaleDateString('en-CA');

    return (
        <AuthLayout
            title="Reserve Your Table"
            subtitle="Plan a memorable café experience at Triveni Terrace."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <label>Full Name</label>
                <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                />

                <label>Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    required
                />

                <label>Reservation Date</label>
                <input
                    type="date"
                    name="reservation_date"
                    min={today}
                    value={form.reservation_date}
                    onChange={handleChange}
                    required
                />

                <label>Reservation Time</label>
                <input
                    type="time"
                    name="reservation_time"
                    min="10:00"
                    max="21:30"
                    value={form.reservation_time}
                    onChange={handleChange}
                    required
                />

                <label>Number of Guests</label>
                <select
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    required
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(number => (
                        <option key={number} value={number}>
                            {number} {number === 1 ? 'Guest' : 'Guests'}
                        </option>
                    ))}
                </select>

                <label>Special Requests (Optional)</label>
                <textarea
                    name="special_request"
                    value={form.special_request}
                    onChange={handleChange}
                    placeholder="Any special requirements?"
                    rows="3"
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Request Reservation'}
                </button>
            </form>

            {message && <p className="auth-message">{message}</p>}
        </AuthLayout>
    );
}