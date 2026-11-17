import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';

export default function Checkout() {
    const navigate = useNavigate();

    const [orderType, setOrderType] = useState('pickup');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate('/login');
            return;
        }

        alert('Checkout form is ready. Next we will connect it to the Supabase orders database.');
    };

    return (
        <div className="checkout-page">

            <header className="checkout-header">
                <button onClick={() => navigate('/')}>
                    <ArrowLeft size={18} />
                    Back to Menu
                </button>

                <h2>TRIVENI TERRACE CAFÉ</h2>
            </header>

            <main className="checkout-container">

                <div className="checkout-heading">
                    <ShoppingBag size={28} />
                    <h1>Checkout</h1>
                    <p>Complete your details to place your order.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <section className="checkout-card">

                        <h2>Customer Details</h2>

                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />

                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            pattern="[0-9]{10}"
                            required
                        />

                    </section>

                    <section className="checkout-card">

                        <h2>Order Method</h2>

                        <label className="order-option">
                            <input
                                type="radio"
                                name="orderType"
                                value="pickup"
                                checked={orderType === 'pickup'}
                                onChange={(e) => setOrderType(e.target.value)}
                            />
                            Self Pickup
                            <span>Collect your order from the café.</span>
                        </label>

                        <label className="order-option">
                            <input
                                type="radio"
                                name="orderType"
                                value="delivery"
                                checked={orderType === 'delivery'}
                                onChange={(e) => setOrderType(e.target.value)}
                            />
                            Home Delivery
                            <span>Get your order delivered to your address.</span>
                        </label>

                        {orderType === 'delivery' && (
                            <>
                                <label>Delivery Address</label>
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter your complete delivery address"
                                    required
                                />
                            </>
                        )}

                    </section>

                    <button
                        type="submit"
                        className="checkout-place-button"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Continue to Place Order'}
                    </button>

                </form>

            </main>
        </div>
    );
}