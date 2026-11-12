import { ArrowUpRight } from 'lucide-react';
import '../../styles/sections.css';

export default function TerraceSection({ onNavigate }) {
    return (
        <section
            className="terrace-section"
            id="terrace"
        >
            <div className="terrace-backdrop">

                <div className="terrace-copy">

                    <h2>
                        The Café
                        <br />
                        <em>Terrace</em>
                    </h2>

                    <p>
                        Enjoy your favourite food and coffee
                        in a relaxed rooftop setting.
                    </p>

                    <button
                        className="light-button"
                        onClick={() => onNavigate('visit')}
                    >
                        Plan your visit
                        <ArrowUpRight size={16} />
                    </button>

                </div>

                <div className="terrace-sun" />
                <div className="terrace-line" />

            </div>
        </section>
    );
}