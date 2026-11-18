import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    ShoppingBag,
    Minus,
    Plus,
    CheckCircle
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';
import '../styles/triveni-portal-theme.css';

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [cart, setCart] = useState(location.state?.cart || []);
    const [orderType, setOrderType] = useState('pickup');
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const updateQuantity = (dishId, change) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === dishId
                        ? {
                            ...item,
                            quantity: item.quantity + change
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            setErrorMessage('Your cart is empty.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase.rpc(
                'place_customer_order',
                {
                    p_full_name: form.fullName.trim(),
                    p_phone: form.phone,
                    p_order_type: orderType,
                    p_delivery_address:
                        orderType === 'delivery' ? form.address.trim() : null,
                    p_items: cart.map((item) => ({
                        id: item.id,
                        quantity: item.quantity
                    }))
                }
            );

            if (error) {
                throw error;
            }

            setOrderId(data);
            setCart([]);

        } catch (error) {
            console.error('Order placement error:', error);
            setErrorMessage(
                error.message || 'Unable to place your order. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Order success screen
    if (orderId) {
        return (
            <div className="checkout-empty">
                <CheckCircle size={55} />
                <h2>Order Placed Successfully!</h2>
                <p>Your order request has been saved.</p>
                <p>Order ID: {orderId}</p>

                <button onClick={() => navigate('/dashboard')}>
                    Go to My Account
                </button>

                <button onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="checkout-empty">
                <ShoppingBag size={45} />
                <h2>Your cart is empty</h2>
                <p>Please add some dishes before checkout.</p>

                <button onClick={() => navigate('/')}>
                    Explore Menu
                </button>
            </div>
        );
    }

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

                {/* Order Summary */}
                <section className="checkout-card">
                    <h2>Your Order</h2>

                    <div className="checkout-items">
                        {cart.map((item) => (
                            <div className="checkout-item" key={item.id}>

                                <img
                                    src={item.image}
                                    alt={item.name}
                                />

                                <div className="checkout-item-info">
                                    <h3>{item.name}</h3>

                                    <p>
                                        ₹{item.price} × {item.quantity}
                                    </p>

                                    <div className="checkout-quantity">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuantity(item.id, -1)
                                            }
                                        >
                                            <Minus size={14} />
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuantity(item.id, 1)
                                            }
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <strong>
                                    ₹{item.price * item.quantity}
                                </strong>

                            </div>
                        ))}
                    </div>

                    <div className="checkout-total">
                        <span>Total Amount</span>
                        <strong>₹{cartTotal}</strong>
                    </div>
                </section>

                <form onSubmit={handleSubmit}>

                    {/* Customer Details */}
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

                    {/* Order Method */}
                    <section className="checkout-card">
                        <h2>Order Method</h2>

                        <label className="order-option">
                            <input
                                type="radio"
                                name="orderType"
                                value="pickup"
                                checked={orderType === 'pickup'}
                                onChange={(e) =>
                                    setOrderType(e.target.value)
                                }
                            />
                            Self Pickup
                            <span>
                                Collect your order from the café.
                            </span>
                        </label>

                        <label className="order-option">
                            <input
                                type="radio"
                                name="orderType"
                                value="delivery"
                                checked={orderType === 'delivery'}
                                onChange={(e) =>
                                    setOrderType(e.target.value)
                                }
                            />
                            Home Delivery
                            <span>
                                Get your order delivered to your address.
                            </span>
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

                    {errorMessage && (
                        <p role="alert" style={{ color: 'red', marginBottom: '15px' }}>
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="checkout-place-button"
                        disabled={loading}
                    >
                        {loading
                            ? 'Placing Order...'
                            : `Place Order · ₹${cartTotal}`}
                    </button>

                </form>
            </main>
        </div>
    );
}