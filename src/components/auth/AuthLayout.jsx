import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cafe } from '../../data/siteData';
import logo from '../../assets/images/triveni-logo.png';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="auth-layout">

            <section
                className="auth-visual"
                style={{
                    backgroundImage: `url("${cafe.galleryImage}")`
                }}
            >
                <Link to="/" className="auth-logo">
                    <img src={logo} alt="Triveni Terrace Café" />
                </Link>

                <div className="auth-visual-content">
                    <span>TRIVENI TERRACE CAFÉ</span>
                    <h1>A place to pause, connect and enjoy.</h1>
                </div>
            </section>

            <section className="auth-content">

                <Link to="/" className="auth-back">
                    <ArrowLeft size={17} />
                    Back to Home
                </Link>

                <div className="auth-form-container">
                    <div className="auth-heading">
                        <span>TRIVENI TERRACE CAFÉ</span>
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>

                    {children}
                </div>

                <footer className="auth-footer">
                    © 2026 Triveni Terrace Café
                </footer>

            </section>
        </div>
    );
}