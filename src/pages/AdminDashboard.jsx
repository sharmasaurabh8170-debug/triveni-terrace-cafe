import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    LogOut,
    ArrowLeft
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        const loadAdminDashboard = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login', { replace: true });
                return;
            }

            const { data: admin, error: adminError } = await supabase
                .from('admin_users')
                .select('user_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (adminError || !admin) {
                navigate('/', { replace: true });
                return;
            }

            const { data, error } = await supabase
                .from('reservations')
                .select('*')
                .order('created_at', { ascending: false });

            if (!active) return;

            if (error) {
                setMessage(error.message);
            } else {
                setReservations(data || []);
            }

            setLoading(false);
        };

        loadAdminDashboard();

        return () => {
            active = false;
        };
    }, [navigate]);

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        setMessage('');

        const { error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id);

        if (error) {
            setMessage(error.message);
        } else {
            setReservations(current =>
                current.map(item =>
                    item.id === id ? { ...item, status } : item
                )
            );
            setMessage(`Reservation ${status} successfully.`);
        }

        setUpdatingId(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    if (loading) {
        return <div className="dashboard-loading">Loading admin dashboard...</div>;
    }

    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">
                <Link to="/" className="dashboard-brand">
                    TRIVENI TERRACE CAFÉ
                </Link>

                <button className="dashboard-logout" onClick={handleLogout}>
                    <LogOut size={17} /> Logout
                </button>
            </header>

            <main className="dashboard-container">

                <Link to="/" className="dashboard-back">
                    <ArrowLeft size={16} /> Back to Website
                </Link>

                <section className="dashboard-welcome">
                    <span>ADMINISTRATION</span>
                    <h1>Admin Dashboard</h1>
                    <p>Manage customer reservations and booking requests.</p>
                </section>

                <section className="admin-stats">

                    <div className="admin-stat-card">
                        <LayoutDashboard size={24} />
                        <span>Total Reservations</span>
                        <h2>{reservations.length}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <Clock size={24} />
                        <span>Pending</span>
                        <h2>{pending}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <CheckCircle size={24} />
                        <span>Confirmed</span>
                        <h2>{confirmed}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <XCircle size={24} />
                        <span>Cancelled</span>
                        <h2>{cancelled}</h2>
                    </div>

                </section>

                <section className="dashboard-details">
                    <h2>
                        <CalendarDays size={22} />
                        Reservation Management
                    </h2>

                    {message && (
                        <p className="auth-message">{message}</p>
                    )}

                    {reservations.length === 0 ? (
                        <p>No reservations found.</p>
                    ) : (
                        <div className="admin-reservation-list">

                            {reservations.map(booking => (
                                <article
                                    className="admin-reservation"
                                    key={booking.id}
                                >
                                    <div className="admin-booking-info">
                                        <h3>{booking.full_name}</h3>
                                        <p>{booking.email}</p>
                                        <p>Phone: {booking.phone}</p>
                                        <p>
                                            Date: {booking.reservation_date}
                                        </p>
                                        <p>
                                            Time: {booking.reservation_time}
                                        </p>
                                        <p>Guests: {booking.guests}</p>

                                        {booking.special_request && (
                                            <p>
                                                Request: {booking.special_request}
                                            </p>
                                        )}
                                    </div>

                                    <div className="admin-booking-actions">
                                        <span className={`booking-status ${booking.status}`}>
                                            {booking.status}
                                        </span>

                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    disabled={updatingId === booking.id}
                                                    onClick={() => updateStatus(booking.id, 'confirmed')}
                                                    className="admin-confirm"
                                                >
                                                    Confirm
                                                </button>

                                                <button
                                                    disabled={updatingId === booking.id}
                                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                                    className="admin-cancel"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}

                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}