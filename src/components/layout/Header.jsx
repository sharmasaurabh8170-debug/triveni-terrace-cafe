import {
    ArrowUpRight,
    Menu,
    X,
    ShoppingBag,
    UserRound,
    LogOut
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabaseClient';

import logo from '../../assets/images/triveni-logo.png';
import { navItems } from '../../data/siteData';

import '../../styles/header.css';

export default function Header({ cartCount, onNavigate }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

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

                <button
                    className="cart-button"
                    onClick={() => navigate('menu')}
                    aria-label={`Menu, ${cartCount} favourites`}
                >
                    <ShoppingBag size={20} />
                    <span>{cartCount}</span>
                </button>

                <button
                    className="book-button"
                    onClick={() => navigate('visit')}
                >
                    Find the café
                    <ArrowUpRight size={18} />
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
        </header>
    );
}