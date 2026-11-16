import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

import HeroSection from './components/sections/HeroSection.jsx';
import StorySection from './components/sections/StorySection.jsx';
import MenuSection from './components/sections/MenuSection.jsx';
import TerraceSection from './components/sections/TerraceSection.jsx';
import VisitSection from './components/sections/VisitSection.jsx';

import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';

import './styles/global.css';
import './styles/responsive.css';
import './styles/auth.css';

function HomePage() {
    const [favourites, setFavourites] = useState([]);

    const navigate = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

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

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}