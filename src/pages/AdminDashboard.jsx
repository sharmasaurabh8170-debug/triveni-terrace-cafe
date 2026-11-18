import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
    CalendarDays,
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    LogOut,
    ArrowLeft,
    PackageCheck,
    RefreshCw,
    IndianRupee
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';
import '../styles/triveni-portal-theme.css';

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState('');

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async (showLoader = false) => {
        if (showLoader) setRefreshing(true);

        const [reservationResult, orderResult] = await Promise.all([
            supabase
                .from('reservations')
                .select('*')
                .order('created_at', { ascending: false }),

            supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false })
        ]);

        if (reservationResult.error) {
            setMessage(`Reservations: ${reservationResult.error.message}`);
        } else {
            setReservations(reservationResult.data || []);
        }

        if (orderResult.error) {
            setMessage(previous =>
                previous
                    ? `${previous} | Orders: ${orderResult.error.message}`
                    : `Orders: ${orderResult.error.message}`
            );
        } else {
            setOrders(orderResult.data || []);
        }

        setRefreshing(false);
        setLoading(false);
    }, []);

    // Admin authentication
    useEffect(() => {
        let active = true;
        let realtimeChannel = null;

        const initializeDashboard = async () => {
            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();

            if (!active) return;

            if (userError || !user) {
                navigate('/login', { replace: true });
                return;
            }

            const { data: admin, error: adminError } = await supabase
                .from('admin_users')
                .select('user_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!active) return;

            if (adminError || !admin) {
                navigate('/', { replace: true });
                return;
            }

            await fetchDashboardData();

            if (!active) return;

            realtimeChannel = supabase
                .channel('admin-dashboard-updates')

                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'orders'
                    },
                    () => fetchDashboardData()
                )

                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'reservations'
                    },
                    () => fetchDashboardData()
                )

                .subscribe();
        };

        initializeDashboard();

        return () => {
            active = false;

            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
            }
        };
    }, [navigate, fetchDashboardData]);

    // Update reservation status
    const updateReservationStatus = async (id, status) => {
        setUpdatingId(id);
        setMessage('');

        try {
            const { error } = await supabase
                .from('reservations')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setReservations(current =>
                current.map(item =>
                    item.id === id ? { ...item, status } : item
                )
            );

            setMessage(`Reservation ${status} successfully.`);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Update table number
    const updateTableNumber = async (id, tableNumber) => {
        setUpdatingId(id);
        setMessage('');

        try {
            const { error } = await supabase
                .from('reservations')
                .update({
                    table_number: tableNumber.trim() || null
                })
                .eq('id', id);

            if (error) throw error;

            setReservations(current =>
                current.map(item =>
                    item.id === id
                        ? { ...item, table_number: tableNumber.trim() || null }
                        : item
                )
            );

            setMessage('Table number updated successfully.');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Update payment status
    const updatePaymentStatus = async (id, paymentStatus) => {
        setUpdatingId(id);
        setMessage('');

        try {
            const { error } = await supabase
                .from('reservations')
                .update({
                    payment_status: paymentStatus
                })
                .eq('id', id);

            if (error) throw error;

            setReservations(current =>
                current.map(item =>
                    item.id === id
                        ? { ...item, payment_status: paymentStatus }
                        : item
                )
            );

            setMessage(
                paymentStatus === 'paid'
                    ? 'Payment marked as paid. Ensure the payment has been verified.'
                    : 'Payment status updated.'
            );
        } catch (error) {
            setMessage(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Mark advance as adjusted
    const adjustAdvance = async (booking) => {
        if (booking.payment_status !== 'paid') {
            setMessage('Verify the advance payment before adjusting it.');
            return;
        }

        if (booking.advance_adjusted) {
            setMessage('This advance has already been adjusted.');
            return;
        }

        const confirmed = window.confirm(
            'Confirm that ₹100 has been deducted from this customer’s final bill?'
        );

        if (!confirmed) return;

        setUpdatingId(booking.id);
        setMessage('');

        try {
            const { data, error } = await supabase
                .from('reservations')
                .update({
                    advance_adjusted: true
                })
                .eq('id', booking.id)
                .eq('advance_adjusted', false)
                .eq('payment_status', 'paid')
                .select('id');

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error(
                    'Adjustment was not saved. Refresh and check the payment status.'
                );
            }

            setReservations(current =>
                current.map(item =>
                    item.id === booking.id
                        ? { ...item, advance_adjusted: true }
                        : item
                )
            );

            setMessage('₹100 advance adjustment recorded successfully.');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Update food order status
    const updateOrderStatus = async (id, status) => {
        setUpdatingId(id);
        setMessage('');

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setOrders(current =>
                current.map(order =>
                    order.id === id ? { ...order, status } : order
                )
            );

            setMessage(`Order ${status} successfully.`);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    // Format date
    const formatDate = date => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
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
    const pendingReservations = reservations.filter(
        r => r.status === 'pending'
    ).length;

    const confirmedReservations = reservations.filter(
        r => r.status === 'confirmed'
    ).length;

    const cancelledReservations = reservations.filter(
        r => r.status === 'cancelled'
    ).length;

    // Payment statistics
    const paidReservations = reservations.filter(
        r => r.payment_status === 'paid'
    ).length;

    const pendingPayments = reservations.filter(
        r => r.payment_status === 'pending'
    ).length;

    // Order statistics
    const pendingOrders = orders.filter(
        o => o.status === 'pending'
    ).length;

    const confirmedOrders = orders.filter(
        o => o.status === 'confirmed'
    ).length;

    const completedOrders = orders.filter(
        o => o.status === 'completed'
    ).length;

    const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce(
            (total, order) => total + Number(order.total_amount || 0),
            0
        );

    const recentOrders = orders.slice(0, 5);
    const recentReservations = reservations.slice(0, 5);

    return (
        <div className="dashboard-page">

            {/* Header */}
            <header className="dashboard-header">
                <Link to="/" className="dashboard-brand">
                    TRIVENI TERRACE CAFÉ
                </Link>

                <div className="admin-header-actions">
                    <button
                        className="admin-refresh-button"
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={17}
                            className={refreshing ? 'refresh-spinning' : ''}
                        />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>

                    <button
                        className="dashboard-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
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
                        Monitor café performance and manage your daily operations.
                    </p>
                </section>

                {/* Message */}
                {message && (
                    <div className="admin-dashboard-message">
                        <p>{message}</p>
                        <button
                            onClick={() => setMessage('')}
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Business Analytics */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <span>OVERVIEW</span>
                            <h2>Business Analytics</h2>
                        </div>
                    </div>

                    <div className="admin-stats">
                        <div className="admin-stat-card">
                            <ShoppingBag size={25} />
                            <span>Total Orders</span>
                            <h2>{orders.length}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <Clock size={25} />
                            <span>Pending Orders</span>
                            <h2>{pendingOrders}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <CheckCircle size={25} />
                            <span>Confirmed Orders</span>
                            <h2>{confirmedOrders}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <PackageCheck size={25} />
                            <span>Completed Orders</span>
                            <h2>{completedOrders}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <IndianRupee size={25} />
                            <span>Completed Order Revenue</span>
                            <h2>₹{totalRevenue.toLocaleString('en-IN')}</h2>
                        </div>
                    </div>
                </section>

                {/* Reservation Analytics */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <span>TABLE BOOKINGS</span>
                            <h2>Reservation Analytics</h2>
                        </div>
                    </div>

                    <div className="admin-stats">
                        <div className="admin-stat-card">
                            <CalendarDays size={25} />
                            <span>Total Reservations</span>
                            <h2>{reservations.length}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <Clock size={25} />
                            <span>Pending Reservations</span>
                            <h2>{pendingReservations}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <CheckCircle size={25} />
                            <span>Confirmed Reservations</span>
                            <h2>{confirmedReservations}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <XCircle size={25} />
                            <span>Cancelled Reservations</span>
                            <h2>{cancelledReservations}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <IndianRupee size={25} />
                            <span>Paid Advances</span>
                            <h2>{paidReservations}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <Clock size={25} />
                            <span>Pending Payments</span>
                            <h2>{pendingPayments}</h2>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <span>LATEST UPDATES</span>
                            <h2>Recent Activity</h2>
                        </div>
                    </div>

                    <div className="admin-recent-grid">

                        {/* Recent Orders */}
                        <div className="admin-recent-card">
                            <h3>
                                <ShoppingBag size={20} />
                                Recent Orders
                            </h3>

                            {recentOrders.length === 0 ? (
                                <p className="admin-no-data">
                                    No recent orders.
                                </p>
                            ) : (
                                recentOrders.map(order => (
                                    <div
                                        className="admin-recent-item"
                                        key={order.id}
                                    >
                                        <div>
                                            <strong>{order.full_name}</strong>
                                            <p>#{order.id.slice(0, 8)}</p>
                                            <small>{formatDate(order.created_at)}</small>
                                        </div>

                                        <div className="admin-recent-right">
                                            <strong>
                                                ₹{Number(order.total_amount).toFixed(2)}
                                            </strong>
                                            <span className={`order-status ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Recent Reservations */}
                        <div className="admin-recent-card">
                            <h3>
                                <CalendarDays size={20} />
                                Recent Reservations
                            </h3>

                            {recentReservations.length === 0 ? (
                                <p className="admin-no-data">
                                    No recent reservations.
                                </p>
                            ) : (
                                recentReservations.map(booking => (
                                    <div
                                        className="admin-recent-item"
                                        key={booking.id}
                                    >
                                        <div>
                                            <strong>{booking.full_name}</strong>
                                            <p>
                                                {booking.guests} Guest(s)
                                            </p>
                                            <small>{booking.reservation_date}</small>
                                        </div>

                                        <span className={`booking-status ${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
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
                                        <p>Phone: {booking.phone}</p>
                                        <p>Date: {booking.reservation_date}</p>
                                        <p>Time: {booking.reservation_time}</p>
                                        <p>Guests: {booking.guests}</p>

                                        {booking.special_request && (
                                            <p>
                                                Request: {booking.special_request}
                                            </p>
                                        )}

                                        <hr />

                                        <h4>Table Assignment</h4>

                                        <label>
                                            Table Number
                                        </label>

                                        <input
                                            type="text"
                                            defaultValue={booking.table_number || ''}
                                            placeholder="Example: T1"
                                            id={`table-${booking.id}`}
                                        />

                                        <button
                                            className="admin-confirm"
                                            disabled={updatingId === booking.id}
                                            onClick={() => {
                                                const input = document.getElementById(
                                                    `table-${booking.id}`
                                                );

                                                updateTableNumber(
                                                    booking.id,
                                                    input.value
                                                );
                                            }}
                                        >
                                            Save Table Number
                                        </button>

                                        <hr />

                                        <h4>Reservation Payment</h4>

                                        <p>
                                            Advance Fee:
                                            <strong> ₹{Number(booking.reservation_fee ?? 100).toFixed(2)}</strong>
                                        </p>

                                        <label>Payment Status</label>

                                        <select
                                            value={booking.payment_status || 'pending'}
                                            disabled={updatingId === booking.id}
                                            onChange={e =>
                                                updatePaymentStatus(
                                                    booking.id,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="paid">
                                                Paid
                                            </option>
                                        </select>

                                        <p>
                                            Payment:
                                            <strong>
                                                {booking.payment_status === 'paid'
                                                    ? ' Paid'
                                                    : ' Pending'}
                                            </strong>
                                        </p>

                                        <p>
                                            Advance Adjustment:
                                            <strong>
                                                {booking.advance_adjusted
                                                    ? ' Adjusted'
                                                    : ' Not Adjusted'}
                                            </strong>
                                        </p>

                                        {booking.payment_status === 'paid' &&
                                            !booking.advance_adjusted && (
                                                <button
                                                    className="admin-confirm"
                                                    disabled={updatingId === booking.id}
                                                    onClick={() => adjustAdvance(booking)}
                                                >
                                                    Mark ₹100 as Adjusted
                                                </button>
                                            )}

                                        {booking.advance_adjusted && (
                                            <p className="advance-adjusted-message">
                                                ✓ ₹100 deducted from final bill.
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
                            <p>No food orders have been placed yet.</p>
                        </div>
                    ) : (
                        <div className="admin-order-list">
                            {orders.map(order => (
                                <article
                                    className="admin-order-card"
                                    key={order.id}
                                >
                                    <div className="admin-order-top">
                                        <div>
                                            <span className="admin-order-label">
                                                ORDER ID
                                            </span>
                                            <h3>#{order.id.slice(0, 8)}</h3>
                                            <p>{formatDate(order.created_at)}</p>
                                        </div>

                                        <span className={`order-status ${order.status}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="admin-order-customer">
                                        <h4>Customer Details</h4>
                                        <p>Name: {order.full_name}</p>
                                        <p>Phone: {order.phone}</p>
                                        <p>Order Type: {order.order_type}</p>

                                        {order.delivery_address && (
                                            <p>
                                                Address: {order.delivery_address}
                                            </p>
                                        )}
                                    </div>

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

                                    <div className="admin-order-total">
                                        <strong>Total Amount</strong>
                                        <strong>
                                            ₹{Number(order.total_amount).toFixed(2)}
                                        </strong>
                                    </div>

                                    <div className="admin-order-controls">
                                        <label>Update Order Status</label>

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
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="ready">Ready</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
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