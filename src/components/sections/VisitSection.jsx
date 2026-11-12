import { MapPin, Clock3, Coffee, ArrowUpRight } from 'lucide-react';
import { cafe } from '../../data/siteData';
import '../../styles/sections.css';

export default function VisitSection() {
    return (
        <section className="visit-section section-pad" id="visit">

            <div className="visit-intro">
                <h2>Visit <em>Us</em></h2>
                <p>
                    Find Triveni Terrace Café inside
                    Triveni Kala Sangam, Mandi House, New Delhi.
                </p>
            </div>

            <div className="visit-card">

                <div className="visit-detail">
                    <MapPin />
                    <div>
                        <b>Address</b>
                        <span>{cafe.address}</span>
                    </div>
                </div>

                <div className="visit-detail">
                    <Clock3 />
                    <div>
                        <b>Opening Hours</b>
                        <span>
                            {cafe.hours}
                            <br />
                            <small>Confirm timings with the café before visiting.</small>
                        </span>
                    </div>
                </div>

                <div className="visit-detail">
                    <Coffee />
                    <div>
                        <b>Contact</b>
                        <span>
                            <a href={`tel:${cafe.phoneLink}`}>
                                {cafe.phoneDisplay}
                            </a>
                            <br />
                            <a href={`mailto:${cafe.email}`}>
                                {cafe.email}
                            </a>
                        </span>
                    </div>
                </div>

                <a
                    className="primary-button map-button"
                    href={cafe.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    Get Directions
                    <ArrowUpRight size={17} />
                </a>

            </div>
        </section>
    );
}