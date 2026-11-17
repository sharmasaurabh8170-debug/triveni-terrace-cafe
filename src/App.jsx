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
import Dashboard from './pages/Dashboard.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Reservation from './pages/Reservation.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import './styles/global.css';
import './styles/responsive.css';
import './styles/auth.css';

function HomePage() {
    const [favourites, setFavourites] = useState([]);
    const [cart, setCart] = useState([]);

    const navigate = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Add dish to favourites
    const addFavourite = (dishName) => {
        setFavourites((current) => {
            if (current.includes(dishName)) {
                return current;
            }

            return [...current, dishName];
        });
    };

    // Add dish to cart
    const addToCart = (dish) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.id === dish.id
            );

            if (existingItem) {
                return currentCart.map((item) =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...currentCart,
                {
                    ...dish,
                    quantity: 1
                }
            ];
        });
    };

    // Calculate total items in cart
    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <div className="site-shell">
            <Header
                cartCount={cartCount}
                onNavigate={navigate}
            />

            <main>
                <HeroSection onNavigate={navigate} />

                <StorySection onNavigate={navigate} />

                <MenuSection
                    onAddFavourite={addFavourite}
                    onAddToCart={addToCart}
                />

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}