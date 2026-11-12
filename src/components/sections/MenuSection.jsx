import {
    motion,
    useMotionValue,
    useSpring,
    useTransform
} from 'framer-motion';

import { dishes } from '../../data/menuData';
import { useRef } from 'react';
import '../../styles/menu.css';

function DishCard({ dish, onAddFavourite }) {
    const cardRef = useRef(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = {
        damping: 20,
        stiffness: 150,
        mass: 0.5
    };

    const rotateX = useSpring(
        useTransform(mouseY, [-0.5, 0.5], [7, -7]),
        springConfig
    );

    const rotateY = useSpring(
        useTransform(mouseX, [-0.5, 0.5], [-7, 7]),
        springConfig
    );

    const handleMouseMove = (event) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.article
            ref={cardRef}
            className="dish-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.55 }}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="dish-photo-wrap">
                <motion.img
                    className="dish-photo"
                    src={dish.image}
                    alt={dish.alt || dish.name}
                    loading="lazy"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="dish-meta">
                <span>{dish.category}</span>

                <span>
                    {dish.price == null
                        ? 'Ask at café'
                        : `₹${dish.price}`}
                </span>
            </div>

            <h3>{dish.name}</h3>

            <p>{dish.description}</p>

            <button
                className="add-button"
                onClick={() => onAddFavourite(dish.name)}
            >
                Add to favourites
                <span>＋</span>
            </button>
        </motion.article>
    );
}

export default function MenuSection({ onAddFavourite }) {
    return (
        <section
            className="menu-section section-pad"
            id="menu"
        >
            <div className="menu-heading">
                <h2>Our Menu</h2>
            </div>

            <div className="dish-grid">
                {dishes.map((dish) => (
                    <DishCard
                        key={dish.id}
                        dish={dish}
                        onAddFavourite={onAddFavourite}
                    />
                ))}
            </div>

            <p className="menu-note">
                Prices and availability may change.
                Please confirm with the café.
            </p>
        </section>
    );
}