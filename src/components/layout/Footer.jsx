import logo from '../../assets/images/triveni-logo.png';
import { MapPin, Phone, Mail } from 'lucide-react';
import '../../styles/footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">

            <div className="footer-main">

                {/* BRAND */}
                <div className="footer-brand">
                    <a className="footer-logo-link" href="#home">
                        <img
                            src={logo}
                            alt="Triveni Terrace Café"
                            className="footer-logo"
                        />
                    </a>
                </div>

                {/* NAVIGATION */}
                <div className="footer-column">
                    <h3>Explore</h3>
                    <a href="#home">Home</a>
                    <a href="#story">Our Story</a>
                    <a href="#menu">Menu</a>
                    <a href="#terrace">Terrace</a>
                    <a href="#visit">Visit Us</a>
                </div>

                {/* CONTACT */}
                <div className="footer-column footer-contact">
                    <h3>Contact</h3>

                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Triveni+Terrace+Cafe+New+Delhi"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <MapPin size={17} />
                        <span>
                            Triveni Kala Sangam,
                            <br />
                            Tansen Marg, New Delhi
                        </span>
                    </a>

                    <a href="tel:+919971566904">
                        <Phone size={17} />
                        <span>+91 99715 66904</span>
                    </a>

                    <a href="mailto:triveniteaterrace@gmail.com">
                        <Mail size={17} />
                        <span>triveniteaterrace@gmail.com</span>
                    </a>
                </div>

            </div>

            {/* COPYRIGHT */}
            <div className="footer-bottom">
                <span>
                    © {currentYear} Triveni Terrace Café.
                    All rights reserved.
                </span>

                <a href="#home" className="back-to-top">
                    Back to top ↑
                </a>
            </div>

        </footer>
    );
}