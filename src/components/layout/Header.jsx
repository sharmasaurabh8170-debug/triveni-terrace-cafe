import { ArrowUpRight, Menu, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/images/triveni-logo.png';
import { navItems } from '../../data/siteData';
import '../../styles/header.css';

export default function Header({ cartCount, onNavigate }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = (id) => {
        onNavigate(id);
        setMenuOpen(false);
    };

    return (
        <header className="header">

            {/* Café Logo */}
            <a
                className="wordmark"
                href="#home"
                aria-label="Triveni Terrace Café home"
                onClick={() => navigate('home')}
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

                <button
                    className="mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

            </div>
        </header>
    );
}