import { useState } from 'react';

import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

import HeroSection from './components/sections/HeroSection.jsx';
import StorySection from './components/sections/StorySection.jsx';
import MenuSection from './components/sections/MenuSection.jsx';
import TerraceSection from './components/sections/TerraceSection.jsx';
import VisitSection from './components/sections/VisitSection.jsx';

import './styles/global.css';
import './styles/responsive.css';

export default function App() {
    const [favourites, setFavourites] = useState([]);

    // Navigate to a page section
    const navigate = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Add a dish to favourites only once
    const addFavourite = (dishName) => {
        setFavourites((current) => {
            if (current.includes(dishName)) {
                return current;
            }

            return [...current, dishName];
        });
    };

    return (
        <div className="site-shell">

            <Header
                cartCount={favourites.length}
                onNavigate={navigate}
            />

            <main>
                <HeroSection onNavigate={navigate} />

                <StorySection onNavigate={navigate} />

                <MenuSection onAddFavourite={addFavourite} />

                <TerraceSection onNavigate={navigate} />

                <VisitSection />
            </main>

            <Footer />

        </div>
    );
}