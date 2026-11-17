import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
    LayoutDashboard,
    CalendarDays,
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    LogOut,
    ArrowLeft,
    PackageCheck
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;

        const loadAdminDashboard = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!active) return;

            if (!user) {
                navigate('/login', { replace: true });
                return;
            }

            // Check admin permission
            const { data: admin, error: adminError } =
                await supabase
                    .from('admin_users')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .maybeSingle();

            if (!active) return;

            if (adminError || !admin) {
                navigate('/', { replace: true });
                return;
            }

            // Fetch reservations
            const { data: reservationData, error: reservationError } =
                await supabase
                    .from('reservations')
                    .select('*')
                    .order('created_at', { ascending: false });

            if (!active) return;

            if (reservationError) {
                setMessage(reservationError.message);
            } else {
                setReservations(reservationData || []);
            }

            // Fetch all customer orders
            const { data: orderData, error: orderError } =
                await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .order('created_at', { ascending: false });

            if (!active) return;

            if (orderError) {
                setMessage(
                    previous =>
                        previous
                            ? `${previous} | Orders: ${orderError.message}`
                            : `Orders: ${orderError.message}`
                );
            } else {
                setOrders(orderData || []);
            }

            setLoading(false);
        };

        loadAdminDashboard();

        return () => {
            active = false;
        };
    }, [navigate]);

    // Update reservation status
    const updateReservationStatus = async (id, status) => {
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
                    item.id === id
                        ? { ...item, status }
                        : item
                )
            );

            setMessage(`Reservation ${status} successfully.`);
        }

        setUpdatingId(null);
    };

    // Update food order status
    const updateOrderStatus = async (id, status) => {
        setUpdatingId(id);
        setMessage('');

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            setMessage(error.message);
        } else {
            setOrders(current =>
                current.map(order =>
                    order.id === id
                        ? { ...order, status }
                        : order
                )
            );

            setMessage(`Order ${status} successfully.`);
        }

        setUpdatingId(null);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    const formatDate = date => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading admin dashboard...
            </div>
        );
    }

    // Reservation statistics
    const pendingReservations =
        reservations.filter(r => r.status === 'pending').length;

    const confirmedReservations =
        reservations.filter(r => r.status === 'confirmed').length;

    const cancelledReservations =
        reservations.filter(r => r.status === 'cancelled').length;

    // Order statistics
    const pendingOrders =
        orders.filter(o => o.status === 'pending').length;

    const completedOrders =
        orders.filter(o => o.status === 'completed').length;

    return (
        <div className="dashboard-page">

            {/* Header */}
            <header className="dashboard-header">

                <Link to="/" className="dashboard-brand">
                    TRIVENI TERRACE CAFÉ
                </Link>

                <button
                    className="dashboard-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={17} />
                    Logout
                </button>

            </header>

            <main className="dashboard-container">

                <Link to="/" className="dashboard-back">
                    <ArrowLeft size={16} />
                    Back to Website
                </Link>

                {/* Welcome */}
                <section className="dashboard-welcome">

                    <span>ADMINISTRATION</span>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Manage customer reservations and food orders.
                    </p>

                </section>

                {message && (
                    <p className="auth-message">
                        {message}
                    </p>
                )}

                {/* Statistics */}
                <section className="admin-stats">

                    <div className="admin-stat-card">
                        <LayoutDashboard size={24} />
                        <span>Total Reservations</span>
                        <h2>{reservations.length}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <Clock size={24} />
                        <span>Pending Reservations</span>
                        <h2>{pendingReservations}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <CheckCircle size={24} />
                        <span>Confirmed Reservations</span>
                        <h2>{confirmedReservations}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <XCircle size={24} />
                        <span>Cancelled Reservations</span>
                        <h2>{cancelledReservations}</h2>
                    </div>

                </section>

                {/* Order Statistics */}
                <section className="admin-stats">

                    <div className="admin-stat-card">
                        <ShoppingBag size={24} />
                        <span>Total Orders</span>
                        <h2>{orders.length}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <Clock size={24} />
                        <span>Pending Orders</span>
                        <h2>{pendingOrders}</h2>
                    </div>

                    <div className="admin-stat-card">
                        <PackageCheck size={24} />
                        <span>Completed Orders</span>
                        <h2>{completedOrders}</h2>
                    </div>

                </section>

                {/* Reservation Management */}
                <section className="dashboard-details">

                    <h2>
                        <CalendarDays size={22} />
                        Reservation Management
                    </h2>

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

                                        <p>
                                            Phone: {booking.phone}
                                        </p>

                                        <p>
                                            Date: {booking.reservation_date}
                                        </p>

                                        <p>
                                            Time: {booking.reservation_time}
                                        </p>

                                        <p>
                                            Guests: {booking.guests}
                                        </p>

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
                                                    onClick={() =>
                                                        updateReservationStatus(
                                                            booking.id,
                                                            'confirmed'
                                                        )
                                                    }
                                                    className="admin-confirm"
                                                >
                                                    Confirm
                                                </button>

                                                <button
                                                    disabled={updatingId === booking.id}
                                                    onClick={() =>
                                                        updateReservationStatus(
                                                            booking.id,
                                                            'cancelled'
                                                        )
                                                    }
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

                {/* Food Order Management */}
                <section className="dashboard-details">

                    <h2>
                        <ShoppingBag size={22} />
                        Customer Order Management
                    </h2>

                    {orders.length === 0 ? (

                        <div className="empty-reservations">
                            <ShoppingBag size={35} />

                            <p>
                                No food orders have been placed yet.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-order-list">

                            {orders.map(order => (

                                <article
                                    className="admin-order-card"
                                    key={order.id}
                                >

                                    {/* Customer information */}
                                    <div className="admin-order-top">

                                        <div>
                                            <span className="admin-order-label">
                                                ORDER ID
                                            </span>

                                            <h3>
                                                #{order.id.slice(0, 8)}
                                            </h3>

                                            <p>
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>

                                        <span className={`order-status ${order.status}`}>
                                            {order.status}
                                        </span>

                                    </div>

                                    <div className="admin-order-customer">

                                        <h4>Customer Details</h4>

                                        <p>
                                            Name: {order.full_name}
                                        </p>

                                        <p>
                                            Phone: {order.phone}
                                        </p>

                                        <p>
                                            Order Type: {order.order_type}
                                        </p>

                                        {order.delivery_address && (
                                            <p>
                                                Address: {order.delivery_address}
                                            </p>
                                        )}

                                    </div>

                                    {/* Food items */}
                                    <div className="admin-order-items">

                                        <h4>Ordered Items</h4>

                                        {order.order_items?.map(item => (

                                            <div
                                                className="admin-order-item"
                                                key={item.id}
                                            >

                                                <span>
                                                    {item.dish_name} × {item.quantity}
                                                </span>

                                                <strong>
                                                    ₹{Number(item.subtotal).toFixed(2)}
                                                </strong>

                                            </div>

                                        ))}

                                    </div>

                                    {/* Total */}
                                    <div className="admin-order-total">

                                        <strong>
                                            Total Amount
                                        </strong>

                                        <strong>
                                            ₹{Number(order.total_amount).toFixed(2)}
                                        </strong>

                                    </div>

                                    {/* Status controls */}
                                    <div className="admin-order-controls">

                                        <label>
                                            Update Order Status
                                        </label>

                                        <select
                                            value={order.status}
                                            disabled={updatingId === order.id}
                                            onChange={e =>
                                                updateOrderStatus(
                                                    order.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="confirmed">
                                                Confirmed
                                            </option>

                                            <option value="preparing">
                                                Preparing
                                            </option>

                                            <option value="ready">
                                                Ready
                                            </option>

                                            <option value="completed">
                                                Completed
                                            </option>

                                            <option value="cancelled">
                                                Cancelled
                                            </option>

                                        </select>

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