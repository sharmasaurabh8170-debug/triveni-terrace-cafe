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
import Checkout from './pages/Checkout.jsx';

import './styles/global.css';
import './styles/responsive.css';
import './styles/auth.css';

function HomePage() {
    const [favorites, setFavorites] = useState([]);
    const [cart, setCart] = useState([]);

    // Navigate to a section on the homepage
    const navigate = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Add a dish to favourites
    const addFavourite = (dishName) => {
        setFavorites((current) => {
            if (current.includes(dishName)) {
                return current;
            }

            return [...current, dishName];
        });
    };

    // Remove a dish from favourites
    const removeFavourite = (dishName) => {
        setFavorites((current) =>
            current.filter((item) => item !== dishName)
        );
    };

    // Add a dish to cart
    const addToCart = (dish) => {
        if (dish.price == null) return;

        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.id === dish.id
            );

            if (existingItem) {
                return currentCart.map((item) =>
                    item.id === dish.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1
                        }
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

    // Increase or decrease cart quantity
    const updateCartQuantity = (dishId, change) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === dishId
                        ? {
                            ...item,
                            quantity: item.quantity + change
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Remove a dish from cart
    const removeFromCart = (dishId) => {
        setCart((currentCart) =>
            currentCart.filter((item) => item.id !== dishId)
        );
    };

    // Calculate total number of cart items
    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <div className="site-shell">

            <Header
                cartCount={cartCount}
                cart={cart}
                onUpdateCartQuantity={updateCartQuantity}
                onRemoveFromCart={removeFromCart}
                onNavigate={navigate}
                favorites={favorites}
                onRemoveFavorite={removeFavourite}
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
            <Route path="/checkout" element={<Checkout />} />
        </Routes>
    );
}