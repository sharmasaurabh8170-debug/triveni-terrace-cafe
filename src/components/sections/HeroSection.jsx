import { ArrowUpRight } from 'lucide-react';
import { cafe } from '../../data/siteData';
import '../../styles/hero.css';

export default function HeroSection({ onNavigate }) {
    return (
        <section className="hero hero-future" id="home">

            <div className="hero-background-glow" />
            <div className="hero-grain" />

            {/* LEFT CONTENT */}
            <div className="hero-copy">

                <h1>
                    Where heritage
                    <br />
                    meets <em>the now.</em>
                </h1>

                <p className="hero-description">
                    Discover Indian comfort food, freshly prepared
                    favourites and a relaxing rooftop café experience
                    in the heart of New Delhi.
                </p>

                <div className="hero-actions">

                    <button
                        className="primary-button"
                        onClick={() => onNavigate('menu')}
                    >
                        Explore the menu
                        <ArrowUpRight size={18} />
                    </button>

                    <button
                        className="quiet-button"
                        onClick={() => onNavigate('story')}
                    >
                        Discover our story
                        <ArrowUpRight size={17} />
                    </button>

                </div>

            </div>

            {/* RIGHT 3D VISUAL */}
            <div className="hero-visual future-visual">

                <div className="visual-grid" />

                <div className="orbit orbit-a" />
                <div className="orbit orbit-b" />
                <div className="orbit orbit-c" />

                <div className="hero-glow" />
                <div className="hero-sun" />

                {/* MAIN CAFE IMAGE */}
                <div className="hero-photo-card">

                    <img
                        src={cafe.galleryImage}
                        alt="Triveni Terrace Café"
                    />

                </div>

                {/* FLOATING COFFEE */}
                <div className="floating-coffee">

                    <div className="coffee-image-ring">
                        <img
                            src={cafe.coffeeImage}
                            alt="Coffee at Triveni Terrace Café"
                        />
                    </div>

                </div>

                {/* DECORATIVE 3D ELEMENTS */}
                <div className="floating-orb orb-one" />
                <div className="floating-orb orb-two" />

            </div>

        </section>
    );
}