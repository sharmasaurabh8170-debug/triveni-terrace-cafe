
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

    const [acceptedPolicy, setAcceptedPolicy] = useState(false);
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

        if (!acceptedPolicy) {
            setMessage('Please accept the advance payment policy to continue.');
            return;
        }

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            navigate('/login');
            return;
        }

        if (!/^[0-9]{10}$/.test(form.phone)) {
            setMessage('Please enter a valid 10-digit phone number.');
            return;
        }

        const selectedDateTime = new Date(
            `${form.reservation_date}T${form.reservation_time}`
        );

        if (
            !form.reservation_date ||
            !form.reservation_time ||
            selectedDateTime <= new Date()
        ) {
            setMessage('Please select a valid future date and time.');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('reservations')
            .insert([
                {
                    user_id: user.id,
                    full_name: form.full_name.trim(),
                    email: user.email,
                    phone: form.phone,
                    reservation_date: form.reservation_date,
                    reservation_time: form.reservation_time,
                    guests: Number(form.guests),
                    special_request: form.special_request.trim(),

                    reservation_fee: 100,
                    payment_status: 'pending',
                    advance_adjusted: false,
                },
            ]);

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage(
            'Your reservation request has been submitted successfully! Your ₹100 advance payment is pending verification.'
        );

        setForm({
            full_name: '',
            phone: '',
            reservation_date: '',
            reservation_time: '',
            guests: '2',
            special_request: '',
        });

        setAcceptedPolicy(false);
    };

    const today = new Date().toLocaleDateString('en-CA');

    return (
        <AuthLayout
            title="Reserve Your Table"
            subtitle="Plan a memorable café experience at Triveni Terrace."
        >
            {/* Reservation Fee Information */}
            <div className="reservation-fee-notice">
                <h3>Advance Reservation Fee</h3>

                <p className="reservation-fee-amount">
                    ₹100 <span>per table</span>
                </p>

                <p>
                    A ₹100 advance payment is required per table
                    to reserve your booking. This amount will be
                    adjusted against your final food bill.
                </p>

                <div className="reservation-fee-example">
                    <div>
                        <span>Example final bill</span>
                        <strong>₹800</strong>
                    </div>

                    <div>
                        <span>Advance payment</span>
                        <strong>- ₹100</strong>
                    </div>

                    <hr />

                    <div>
                        <span>Remaining amount</span>
                        <strong>₹700</strong>
                    </div>
                </div>

                {/* Non-refundable Policy */}
                <div className="reservation-refund-notice">
                    <h4>Important: Non-Refundable Policy</h4>

                    <p>
                        The ₹100 advance reservation fee is
                        <strong> non-refundable</strong>, including
                        in the event of cancellation.
                    </p>

                    <p>
                        However, the advance amount will be adjusted
                        against your final food bill when you visit
                        the café.
                    </p>
                </div>
            </div>

            {/* Reservation Form */}
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
                    {Array.from(
                        { length: 20 },
                        (_, index) => index + 1
                    ).map(number => (
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

                {/* Policy Acceptance */}
                <label className="reservation-policy-checkbox">
                    <input
                        type="checkbox"
                        checked={acceptedPolicy}
                        onChange={(e) =>
                            setAcceptedPolicy(e.target.checked)
                        }
                    />

                    <span>
                        I have read and agree to the ₹100
                        non-refundable advance reservation policy.
                    </span>
                </label>

                {/* Fee Summary */}
                <div className="reservation-payment-summary">
                    <span>Advance reservation fee</span>
                    <strong>₹100</strong>
                </div>

                <button
                    type="submit"
                    disabled={loading || !acceptedPolicy}
                >
                    {loading ? 'Submitting...' : 'Request Reservation'}
                </button>
            </form>

            {message && (
                <p className="auth-message" role="status">
                    {message}
                </p>
            )}
        </AuthLayout>
    );
}