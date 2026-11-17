import {
    ArrowUpRight,
    Menu,
    X,
    ShoppingBag,
    UserRound,
    LogOut,
    Plus,
    Minus,
    Trash2
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabaseClient';

import logo from '../../assets/images/triveni-logo.png';
import { navItems } from '../../data/siteData';

import '../../styles/header.css';

export default function Header({
    cartCount,
    cart = [],
    onUpdateCartQuantity,
    onRemoveFromCart,
    onNavigate
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const routerNavigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const navigate = (id) => {
        onNavigate(id);
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        setProfileOpen(false);
        routerNavigate('/');
    };

    // Calculate cart total
    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    // Proceed to checkout
    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        setCartOpen(false);

        routerNavigate('/checkout', {
            state: { cart }
        });
    };

    return (
        <header className="header">

            {/* Logo */}
            <a
                className="wordmark"
                href="#home"
                aria-label="Triveni Terrace Café home"
                onClick={(e) => {
                    e.preventDefault();
                    navigate('home');
                }}
            >
                <img
                    className="brand-logo"
                    src={logo}
                    alt="Triveni Terrace Café logo"
                />
            </a>

            {/* Navigation */}
            <nav
                className={menuOpen ? 'nav nav-open' : 'nav'}
                aria-label="Main navigation"
            >
                {navItems.map(([label, id]) => (
                    <button
                        key={id}
                        onClick={() => navigate(id)}
                    >
                        {label}
                    </button>
                ))}

                {!user && (
                    <>
                        <Link
                            to="/login"
                            className="nav-auth-login"
                            onClick={() => setMenuOpen(false)}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="nav-auth-signup"
                            onClick={() => setMenuOpen(false)}
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </nav>

            {/* Header Actions */}
            <div className="header-actions">

                {/* Shopping Cart */}
                <button
                    className="cart-button"
                    onClick={() => setCartOpen(!cartOpen)}
                    aria-label={`Shopping cart with ${cartCount} items`}
                    aria-expanded={cartOpen}
                >
                    <ShoppingBag size={20} />
                    <span>{cartCount}</span>
                </button>

                {/* Reservation */}
                <Link
                    to="/reservation"
                    className="reserve-button"
                    onClick={() => setMenuOpen(false)}
                >
                    Reserve a Table
                </Link>

                {/* Find Café */}
                <button
                    className="book-button"
                    onClick={() => navigate('visit')}
                >
                    Find the café <ArrowUpRight size={18} />
                </button>

                {/* Profile */}
                {user && (
                    <div className="profile-wrapper">

                        <button
                            className="profile-button"
                            onClick={() => setProfileOpen(!profileOpen)}
                            aria-label="Open profile menu"
                            aria-expanded={profileOpen}
                        >
                            <UserRound size={21} />
                        </button>

                        {profileOpen && (
                            <div className="profile-dropdown">

                                <p className="profile-email">
                                    {user.email}
                                </p>

                                <Link
                                    to="/dashboard"
                                    onClick={() => {
                                        setProfileOpen(false);
                                        setMenuOpen(false);
                                    }}
                                >
                                    My Account
                                </Link>

                                <button onClick={handleLogout}>
                                    <LogOut size={16} />
                                    Logout
                                </button>

                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Menu */}
                <button
                    className="mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen
                        ? <X size={26} />
                        : <Menu size={26} />
                    }
                </button>

            </div>

            {/* Shopping Cart Panel */}
            {cartOpen && (
                <div className="cart-panel">

                    <div className="cart-panel-header">
                        <h3>Your Shopping Cart</h3>

                        <button
                            onClick={() => setCartOpen(false)}
                            aria-label="Close cart"
                        >
                            <X size={21} />
                        </button>
                    </div>

                    {cart.length === 0 ? (

                        <div className="empty-cart">
                            <ShoppingBag size={35} />
                            <p>Your cart is empty.</p>
                            <span>Add something delicious!</span>

                            <button
                                onClick={() => {
                                    setCartOpen(false);
                                    navigate('menu');
                                }}
                            >
                                Explore Menu
                            </button>
                        </div>

                    ) : (

                        <>
                            <div className="cart-items">

                                {cart.map((item) => (
                                    <div
                                        className="cart-item"
                                        key={item.id}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                        />

                                        <div className="cart-item-info">

                                            <h4>{item.name}</h4>

                                            <p>
                                                ₹{item.price * item.quantity}
                                            </p>

                                            <div className="cart-quantity">

                                                <button
                                                    onClick={() =>
                                                        onUpdateCartQuantity(
                                                            item.id,
                                                            -1
                                                        )
                                                    }
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                >
                                                    <Minus size={14} />
                                                </button>

                                                <span>
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        onUpdateCartQuantity(
                                                            item.id,
                                                            1
                                                        )
                                                    }
                                                    aria-label={`Increase ${item.name} quantity`}
                                                >
                                                    <Plus size={14} />
                                                </button>

                                            </div>
                                        </div>

                                        <button
                                            className="cart-remove"
                                            onClick={() =>
                                                onRemoveFromCart(item.id)
                                            }
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <Trash2 size={17} />
                                        </button>

                                    </div>
                                ))}

                            </div>

                            {/* Cart Total */}
                            <div className="cart-total">
                                <span>Total Amount</span>
                                <strong>₹{cartTotal}</strong>
                            </div>

                            {/* Checkout Button */}
                            <button
                                className="checkout-button"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </button>

                        </>
                    )}

                </div>
            )}

        </header>
    );
}