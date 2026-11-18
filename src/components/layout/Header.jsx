import {
    ArrowUpRight,
    Menu,
    X,
    ShoppingBag,
    UserRound,
    LogOut,
    Plus,
    Minus,
    Trash2,
    Heart,
    CheckCircle,
    ShoppingCart
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabaseClient';
import logo from '../../assets/images/triveni-logo.png';
import { navItems } from '../../data/siteData';

import '../../styles/header.css';

export default function Header({
    cartCount = 0,
    cart = [],
    onUpdateCartQuantity,
    onRemoveFromCart,
    onNavigate,
    favorites = [],
    onRemoveFavorite
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [favoritesOpen, setFavoritesOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const routerNavigate = useNavigate();
    const previousCartCount = useRef(Number(cartCount) || 0);
    const previousFavoritesCount = useRef(favorites.length);
    const toastTimer = useRef(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, []);

    // Show a small notification when the cart quantity increases.
    useEffect(() => {
        const currentCount = Number(cartCount) || 0;
        if (currentCount > previousCartCount.current) {
            showToast('Added to your cart', 'Your selection is in the shopping cart.');
        }
        previousCartCount.current = currentCount;
    }, [cartCount]);

    // Show a notification when a favourite is added.
    useEffect(() => {
        if (favorites.length > previousFavoritesCount.current) {
            showToast('Added to favourites', 'You can find it in your saved favourites.');
        }
        previousFavoritesCount.current = favorites.length;
    }, [favorites.length]);

    const showToast = (title, description) => {
        setToast({ title, description });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3200);
    };

    const navigate = (id) => {
        if (onNavigate) onNavigate(id);
        setMenuOpen(false);
        setCartOpen(false);
        setFavoritesOpen(false);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showToast('Could not log out', error.message);
            return;
        }
        setProfileOpen(false);
        routerNavigate('/');
    };

    const cartTotal = cart.reduce(
        (total, item) => total + (Number(item.price) || 0) * item.quantity,
        0
    );

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('Your cart is empty', 'Add a dish from the menu to continue.');
            return;
        }
        setCartOpen(false);
        routerNavigate('/checkout', { state: { cart } });
    };

    return (
        <header className="header">
            <a
                className="wordmark"
                href="#home"
                aria-label="Triveni Terrace Café home"
                onClick={(event) => {
                    event.preventDefault();
                    navigate('home');
                }}
            >
                <img className="brand-logo" src={logo} alt="Triveni Terrace Café logo" />
            </a>

            <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Main navigation">
                {navItems.map(([label, id]) => (
                    <button key={id} onClick={() => navigate(id)}>{label}</button>
                ))}

                {!user && (
                    <>
                        <Link to="/login" className="nav-auth-login" onClick={() => setMenuOpen(false)}>Login</Link>
                        <Link to="/register" className="nav-auth-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                    </>
                )}
            </nav>

            <div className="header-actions">
                <button
                    className="header-favorites-button"
                    onClick={() => {
                        setFavoritesOpen(!favoritesOpen);
                        setCartOpen(false);
                    }}
                    aria-label={`Favourites, ${favorites.length} saved`}
                    aria-expanded={favoritesOpen}
                >
                    <Heart size={19} />
                    <span>{favorites.length}</span>
                </button>

                <button
                    className="cart-button"
                    onClick={() => {
                        setCartOpen(!cartOpen);
                        setFavoritesOpen(false);
                    }}
                    aria-label={`Shopping cart with ${cartCount} items`}
                    aria-expanded={cartOpen}
                >
                    <ShoppingBag size={20} />
                    <span>{cartCount}</span>
                </button>

                <Link to="/reservation" className="reserve-button" onClick={() => setMenuOpen(false)}>
                    Reserve a Table
                </Link>

                <button className="book-button" onClick={() => navigate('visit')}>
                    Find the café <ArrowUpRight size={18} />
                </button>

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
                                <p className="profile-email">{user.email}</p>
                                <Link to="/dashboard" onClick={() => {
                                    setProfileOpen(false);
                                    setMenuOpen(false);
                                }}>
                                    My Account
                                </Link>
                                <button onClick={handleLogout}><LogOut size={16} /> Logout</button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {cartOpen && (
                <div className="cart-panel">
                    <div className="cart-panel-header">
                        <h3>Your Shopping Cart</h3>
                        <button onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={21} /></button>
                    </div>

                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingBag size={35} />
                            <p>Your cart is empty.</p>
                            <span>Add something delicious!</span>
                            <button onClick={() => navigate('menu')}>Explore Menu</button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map((item) => (
                                    <div className="cart-item" key={item.id}>
                                        <img src={item.image} alt={item.name} />
                                        <div className="cart-item-info">
                                            <h4>{item.name}</h4>
                                            <p>₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                                            <div className="cart-quantity">
                                                <button
                                                    onClick={() => onUpdateCartQuantity?.(item.id, -1)}
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                ><Minus size={14} /></button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateCartQuantity?.(item.id, 1)}
                                                    aria-label={`Increase ${item.name} quantity`}
                                                ><Plus size={14} /></button>
                                            </div>
                                        </div>
                                        <button
                                            className="cart-remove"
                                            onClick={() => onRemoveFromCart?.(item.id)}
                                            aria-label={`Remove ${item.name}`}
                                        ><Trash2 size={17} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-total">
                                <span>Total Amount</span>
                                <strong>₹{cartTotal.toFixed(2)}</strong>
                            </div>
                            <button className="checkout-button" onClick={handleCheckout}>Review Order & Checkout</button>
                        </>
                    )}
                </div>
            )}

            {favoritesOpen && (
                <div className="cart-panel favorites-panel">
                    <div className="cart-panel-header">
                        <h3>Your Favourites</h3>
                        <button onClick={() => setFavoritesOpen(false)} aria-label="Close favourites"><X size={21} /></button>
                    </div>
                    {favorites.length === 0 ? (
                        <div className="empty-cart">
                            <Heart size={34} />
                            <p>No favourites saved yet.</p>
                            <span>Tap the heart on a menu item to save it.</span>
                            <button onClick={() => navigate('menu')}>Explore Menu</button>
                        </div>
                    ) : (
                        <div className="cart-items">
                            {favorites.map(item => (
                                <div className="cart-item" key={item.id}>
                                    <img src={item.image} alt={item.name} />
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        {item.price != null && <p>₹{Number(item.price).toFixed(2)}</p>}
                                        <button
                                            className="favorite-remove-button"
                                            onClick={() => onRemoveFavorite?.(item.id)}
                                        >
                                            Remove from favourites
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {toast && (
                <div className="cafe-toast" role="status" aria-live="polite">
                    <span className="cafe-toast-icon"><CheckCircle size={19} /></span>
                    <span className="cafe-toast-copy">
                        <strong>{toast.title}</strong>
                        <small>{toast.description}</small>
                    </span>
                    <button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={17} /></button>
                </div>
            )}
        </header>
    );
}
