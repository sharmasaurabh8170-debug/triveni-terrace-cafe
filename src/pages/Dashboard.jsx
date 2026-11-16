import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserRound,
    CalendarDays,
    ShoppingBag,
    LogOut,
    ArrowLeft
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';

export default function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            const { data: { session } } =
                await supabase.auth.getSession();

            if (!mounted) return;

            if (!session) {
                navigate('/login', { replace: true });
                return;
            }

            setUser(session.user);

            const { data, error } = await supabase
                .from('reservations')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!mounted) return;

            if (error) {
                console.error('Reservation error:', error.message);
            } else {
                setReservations(data || []);
            }

            setLoading(false);
        };

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    if (loading) {
        return <div className="dashboard-loading">
            Loading your dashboard...
        </div>;
    }

    if (!user) return null;

    const name =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Customer';

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">
                <Link to="/" className="dashboard-brand">
                    TRIVENI TERRACE CAFÉ
                </Link>

                <button
                    onClick={handleLogout}
                    className="dashboard-logout"
                >
                    <LogOut size={17} />
                    Logout
                </button>
            </header>

            <main className="dashboard-container">

                <Link to="/" className="dashboard-back">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <section className="dashboard-welcome">
                    <span>YOUR ACCOUNT</span>
                    <h1>Welcome, {name}!</h1>
                    <p>Manage your café experience from one place.</p>
                </section>

                <section className="dashboard-grid">

                    <div className="dashboard-card">
                        <UserRound size={25} />
                        <h3>My Profile</h3>
                        <p>{user.email}</p>
                        <span className="account-status">
                            {user.email_confirmed_at
                                ? 'Email Verified'
                                : 'Email Not Verified'}
                        </span>
                    </div>

                    <div className="dashboard-card">
                        <CalendarDays size={25} />
                        <h3>My Reservations</h3>
                        <p>{reservations.length} booking(s)</p>
                    </div>

                    <div className="dashboard-card">
                        <ShoppingBag size={25} />
                        <h3>My Orders</h3>
                        <p>Food ordering coming soon.</p>
                    </div>

                </section>

                <section className="dashboard-details">
                    <h2>My Reservations</h2>

                    {reservations.length === 0 ? (
                        <div className="empty-reservations">
                            <CalendarDays size={35} />
                            <p>You haven't made any reservations yet.</p>
                            <Link to="/reservation">
                                Reserve a Table
                            </Link>
                        </div>
                    ) : (
                        <div className="reservation-list">
                            {reservations.map((booking) => (
                                <div
                                    className="reservation-item"
                                    key={booking.id}
                                >
                                    <div>
                                        <h3>
                                            {new Date(
                                                `${booking.reservation_date}T00:00:00`
                                            ).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </h3>

                                        <p>
                                            Time: {booking.reservation_time}
                                        </p>

                                        <p>
                                            Guests: {booking.guests}
                                        </p>
                                    </div>

                                    <span className={`booking-status ${booking.status}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}