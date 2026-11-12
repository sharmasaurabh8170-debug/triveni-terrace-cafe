import { ArrowUpRight } from 'lucide-react';
import '../../styles/sections.css';

export default function StorySection({ onNavigate }) {
    return (
        <section
            className="story-section section-pad"
            id="story"
        >
            <div className="story-content">

                <h2>
                    Where the city slows
                    <br />
                    down <em>and flavours speak.</em>
                </h2>

                <p>
                    Set within the creative surroundings of
                    Triveni Kala Sangam, Triveni Terrace Café
                    is a meeting place for artists, students
                    and visitors. Come for familiar flavours
                    and enjoy the atmosphere.
                </p>

                <button
                    className="underlined-link"
                    onClick={() => onNavigate('terrace')}
                >
                    Discover the terrace
                    <ArrowUpRight size={16} />
                </button>

            </div>
        </section>
    );
}