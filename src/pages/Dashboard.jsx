import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UserRound, CalendarDays, ShoppingBag, LogOut, ArrowLeft,
    CheckCircle, XCircle, Clock, Eye, X, MapPin, Phone, Package,
    Pencil, Save, RefreshCw, ChefHat, Navigation,
    History, UtensilsCrossed, CreditCard
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';
import '../styles/customer-dashboard.css';

const CAFE_ADDRESS =
    'Triveni Terrace Cafe, 205 Tansen Marg, Mandi House, New Delhi 110001';

const MAP_EMBED_URL =
    `https://www.google.com/maps?q=${encodeURIComponent(CAFE_ADDRESS)}&output=embed`;

const DIRECTIONS_URL =
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CAFE_ADDRESS)}`;

const ORDER_STEPS = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
];

function formatDate(date, withTime = false) {
    if (!date) return '—';

    return new Date(date).toLocaleString(
        'en-IN',
        withTime
            ? {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }
            : {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
    );
}

function formatTime(time) {
    if (!time) return '—';

    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function StatusBadge({ status }) {
    return (
        <span className={`order-status ${status || 'pending'}`}>
            {(status || 'pending').replaceAll('_', ' ')}
        </span>
    );
}

function OrderProgress({ status }) {
    if (status === 'cancelled') {
        return (
            <div className="customer-progress-cancelled">
                <XCircle size={20} />
                <div>
                    <strong>Order cancelled</strong>
                    <p>Please contact the café if you need assistance.</p>
                </div>
            </div>
        );
    }

    const currentIndex = status === 'pending'
        ? -1
        : ORDER_STEPS.findIndex(step => step.key === status);

    return (
        <div className="customer-order-progress">
            <div className={`customer-progress-step ${status === 'pending' ? 'is-current' : 'is-done'}`}>
                <span><Clock size={16} /></span>
                <small>Placed</small>
            </div>

            {ORDER_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const done = currentIndex >= index;
                const current = currentIndex === index;

                return (
                    <div
                        className={`customer-progress-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}
                        key={step.key}
                    >
                        <span><StepIcon size={16} /></span>
                        <small>{step.label}</small>
                    </div>
                );
            })}
        </div>
    );
}

function ReservationPaymentDetails({ booking }) {
    const fee = Number(booking.reservation_fee ?? 100);
    const paymentStatus = booking.payment_status || 'pending';

    return (
        <div className="customer-reservation-payment">
            <div className="customer-reservation-detail-row">
                <span>Assigned table</span>
                <strong>{booking.table_number || 'Not assigned yet'}</strong>
            </div>

            <div className="customer-reservation-detail-row">
                <span>Advance fee</span>
                <strong>₹{fee.toFixed(2)}</strong>
            </div>

            <div className="customer-reservation-detail-row">
                <span>Payment status</span>
                <span className={`customer-payment-badge ${paymentStatus}`}>
                    {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
            </div>

            <div className="customer-reservation-adjustment">
                {booking.advance_adjusted ? (
                    <p className="customer-adjustment-success">
                        <CheckCircle size={16} />
                        ₹{fee.toFixed(2)} advance has been adjusted against your final food bill.
                    </p>
                ) : (
                    <p>
                        Your ₹{fee.toFixed(2)} advance will be deducted from your final food bill.
                    </p>
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pageError, setPageError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        phone: ''
    });
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const loadCustomerData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);

        setPageError('');

        const { data: authData, error: authError } =
            await supabase.auth.getUser();

        const currentUser = authData?.user;

        if (authError || !currentUser) {
            navigate('/login', { replace: true });
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setUser(currentUser);

        setProfileForm({
            full_name: currentUser.user_metadata?.full_name || '',
            phone: currentUser.user_metadata?.phone || ''
        });

        const [reservationResult, orderResult] = await Promise.all([
            supabase
                .from('reservations')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false }),

            supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
        ]);

        if (reservationResult.error || orderResult.error) {
            setPageError([
                reservationResult.error?.message,
                orderResult.error?.message
            ].filter(Boolean).join(' · '));
        }

        setReservations(reservationResult.data || []);
        setOrders(orderResult.data || []);

        setLoading(false);
        setRefreshing(false);
    }, [navigate]);

    useEffect(() => {
        loadCustomerData();
    }, [loadCustomerData]);

    const activeOrders = useMemo(
        () => orders.filter(order =>
            !['completed', 'cancelled'].includes(order.status)
        ),
        [orders]
    );

    const orderHistory = useMemo(
        () => orders.filter(order =>
            ['completed', 'cancelled'].includes(order.status)
        ),
        [orders]
    );

    const name =
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Customer';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();

        setProfileError('');
        setProfileMessage('');

        const fullName = profileForm.full_name.trim();
        const phone = profileForm.phone.trim();

        if (!fullName) {
            setProfileError('Please enter your full name.');
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            setProfileError('Please enter a valid 10-digit phone number.');
            return;
        }

        setSavingProfile(true);

        const { data, error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                phone
            }
        });

        setSavingProfile(false);

        if (error) {
            setProfileError(error.message);
            return;
        }

        setUser(data.user);

        setProfileForm({
            full_name: data.user.user_metadata?.full_name || '',
            phone: data.user.user_metadata?.phone || ''
        });

        setIsEditingProfile(false);
        setProfileMessage('Your profile has been updated.');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                Preparing your café dashboard...
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="dashboard-page customer-dashboard-page">

            <header className="dashboard-header customer-dashboard-header">
                <Link to="/" className="dashboard-brand">
                    TRIVENI TERRACE CAFÉ
                </Link>

                <div className="customer-header-actions">
                    <button
                        type="button"
                        className="customer-refresh-button"
                        onClick={() => loadCustomerData(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? 'refresh-spinning' : ''}
                        />
                        {refreshing ? 'Refreshing' : 'Refresh'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="dashboard-logout"
                    >
                        <LogOut size={17} /> Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-container customer-dashboard-container">

                <Link to="/" className="dashboard-back">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <section className="customer-hero">
                    <div>
                        <span className="customer-eyebrow">
                            YOUR TRIVENI EXPERIENCE
                        </span>

                        <h1>Welcome back, {name}.</h1>

                        <p>
                            Your table bookings, favourite café moments and
                            orders—all in one place.
                        </p>

                        <div className="customer-hero-actions">
                            <Link
                                to="/reservation"
                                className="customer-primary-link"
                            >
                                <CalendarDays size={17} /> Book a Table
                            </Link>

                            <Link
                                to="/#menu"
                                className="customer-secondary-link"
                            >
                                <UtensilsCrossed size={17} /> Order Online
                            </Link>
                        </div>
                    </div>

                    <div className="customer-hero-mark">
                        <span>TRIVENI</span>
                        <small>TERRACE CAFÉ · NEW DELHI</small>
                    </div>
                </section>

                {pageError && (
                    <div className="admin-dashboard-message" role="alert">
                        <p>{pageError}</p>
                        <button
                            onClick={() => setPageError('')}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                )}

                <section className="customer-summary-grid">
                    <article className="customer-summary-card">
                        <span className="customer-summary-icon">
                            <ShoppingBag size={20} />
                        </span>
                        <p>Active orders</p>
                        <strong>{activeOrders.length}</strong>
                        <small>Currently being processed</small>
                    </article>

                    <article className="customer-summary-card">
                        <span className="customer-summary-icon">
                            <History size={20} />
                        </span>
                        <p>Past orders</p>
                        <strong>{orderHistory.length}</strong>
                        <small>Completed or cancelled</small>
                    </article>

                    <article className="customer-summary-card">
                        <span className="customer-summary-icon">
                            <CalendarDays size={20} />
                        </span>
                        <p>Reservations</p>
                        <strong>{reservations.length}</strong>
                        <small>Your table bookings</small>
                    </article>
                </section>

                {/* ACTIVE ORDERS */}
                <section className="customer-content-section">
                    <div className="customer-section-title">
                        <div>
                            <span>LIVE UPDATES</span>
                            <h2>Your active orders</h2>
                        </div>

                        <StatusBadge
                            status={activeOrders.length ? 'preparing' : 'completed'}
                        />
                    </div>

                    {activeOrders.length === 0 ? (
                        <div className="customer-empty-state">
                            <ShoppingBag size={30} />
                            <h3>No active orders right now</h3>
                            <p>
                                When you place an order, its progress will
                                appear here.
                            </p>
                            <Link to="/#menu">Explore the menu</Link>
                        </div>
                    ) : (
                        <div className="customer-order-grid">
                            {activeOrders.map(order => (
                                <article
                                    className="customer-order-card"
                                    key={order.id}
                                >
                                    <div className="customer-order-header">
                                        <div>
                                            <span>
                                                ORDER · #{order.id.slice(0, 8)}
                                            </span>
                                            <h3>
                                                {formatDate(order.created_at, true)}
                                            </h3>
                                        </div>

                                        <StatusBadge status={order.status} />
                                    </div>

                                    <OrderProgress status={order.status} />

                                    <div className="customer-order-items">
                                        {(order.order_items || []).map(item => (
                                            <div
                                                className="customer-order-item"
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

                                    <div className="customer-order-footer">
                                        <span>
                                            {order.order_type === 'pickup'
                                                ? 'Self pickup'
                                                : 'Home delivery'}
                                        </span>
                                        <strong>
                                            ₹{Number(order.total_amount).toFixed(2)}
                                        </strong>
                                    </div>

                                    {order.order_type === 'delivery' &&
                                        order.delivery_address && (
                                            <p className="customer-delivery-address">
                                                <MapPin size={15} />
                                                {order.delivery_address}
                                            </p>
                                        )}

                                    <button
                                        type="button"
                                        className="view-order-button"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <Eye size={16} /> Track / View order
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* RESERVATIONS */}
                <section className="customer-content-section">
                    <div className="customer-section-title">
                        <div>
                            <span>YOUR VISITS</span>
                            <h2>Table reservations</h2>
                        </div>

                        <Link
                            to="/reservation"
                            className="customer-text-link"
                        >
                            Make a booking <ArrowLeft size={14} />
                        </Link>
                    </div>

                    {reservations.length === 0 ? (
                        <div className="customer-empty-state compact">
                            <CalendarDays size={28} />
                            <h3>Your next visit starts here</h3>
                            <p>
                                Reserve a table and plan your time at
                                Triveni Terrace Café.
                            </p>
                            <Link to="/reservation">
                                Reserve a table
                            </Link>
                        </div>
                    ) : (
                        <div className="customer-reservation-grid">
                            {reservations.map(booking => (
                                <article
                                    className="customer-reservation-card"
                                    key={booking.id}
                                >
                                    <div className="customer-reservation-icon">
                                        <CalendarDays size={21} />
                                    </div>

                                    <div className="customer-reservation-info">
                                        <h3>
                                            {formatDate(booking.reservation_date)}
                                        </h3>

                                        <p>
                                            {formatTime(booking.reservation_time)}
                                            {' · '}
                                            {booking.guests} guest(s)
                                        </p>

                                        <small>
                                            {booking.special_request ||
                                                'No special request added'}
                                        </small>

                                        <div className="customer-reservation-status">
                                            <span>Reservation status:</span>
                                            <StatusBadge status={booking.status} />
                                        </div>

                                        <ReservationPaymentDetails
                                            booking={booking}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ORDER HISTORY */}
                <section className="customer-content-section">
                    <div className="customer-section-title">
                        <div>
                            <span>PAST EXPERIENCES</span>
                            <h2>Order history</h2>
                        </div>
                    </div>

                    {orderHistory.length === 0 ? (
                        <div className="customer-empty-state compact">
                            <History size={26} />
                            <p>
                                Your completed and cancelled orders will be
                                saved here.
                            </p>
                        </div>
                    ) : (
                        <div className="customer-history-list">
                            {orderHistory.map(order => (
                                <button
                                    type="button"
                                    className="customer-history-row"
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <span className="customer-history-icon">
                                        <ShoppingBag size={19} />
                                    </span>

                                    <span className="customer-history-main">
                                        <strong>
                                            Order #{order.id.slice(0, 8)}
                                        </strong>
                                        <small>
                                            {formatDate(order.created_at, true)}
                                            {' · '}
                                            {order.order_items?.length || 0} item(s)
                                        </small>
                                    </span>

                                    <StatusBadge status={order.status} />

                                    <strong>
                                        ₹{Number(order.total_amount).toFixed(2)}
                                    </strong>

                                    <Eye size={17} />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* PROFILE AND MAP */}
                <section className="customer-lower-grid">

                    <article className="customer-panel customer-profile-panel">
                        <div className="customer-section-title">
                            <div>
                                <span>ACCOUNT</span>
                                <h2>My profile</h2>
                            </div>
                            <UserRound size={22} />
                        </div>

                        {!isEditingProfile ? (
                            <div className="customer-profile-details">
                                <p>
                                    <strong>
                                        {user.user_metadata?.full_name || 'Customer'}
                                    </strong>
                                </p>

                                <p>{user.email}</p>

                                <p>
                                    <Phone size={15} />
                                    {user.user_metadata?.phone ||
                                        'Phone number not added'}
                                </p>

                                <span className="account-status">
                                    {user.email_confirmed_at
                                        ? 'Email verified'
                                        : 'Email not verified'}
                                </span>

                                <button
                                    type="button"
                                    className="profile-edit-button"
                                    onClick={() => {
                                        setProfileMessage('');
                                        setProfileError('');
                                        setIsEditingProfile(true);
                                    }}
                                >
                                    <Pencil size={15} /> Edit profile
                                </button>
                            </div>
                        ) : (
                            <form
                                className="profile-edit-form"
                                onSubmit={handleProfileUpdate}
                            >
                                <label htmlFor="profile-full-name">
                                    Full name
                                </label>

                                <input
                                    id="profile-full-name"
                                    value={profileForm.full_name}
                                    onChange={e =>
                                        setProfileForm({
                                            ...profileForm,
                                            full_name: e.target.value
                                        })
                                    }
                                    required
                                />

                                <label htmlFor="profile-email">Email</label>

                                <input
                                    id="profile-email"
                                    value={user.email || ''}
                                    disabled
                                />

                                <label htmlFor="profile-phone">
                                    Phone number
                                </label>

                                <input
                                    id="profile-phone"
                                    type="tel"
                                    maxLength={10}
                                    value={profileForm.phone}
                                    onChange={e =>
                                        setProfileForm({
                                            ...profileForm,
                                            phone: e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10)
                                        })
                                    }
                                    required
                                />

                                {profileError && (
                                    <p className="profile-error">
                                        {profileError}
                                    </p>
                                )}

                                <div className="profile-form-buttons">
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                    >
                                        <Save size={15} />
                                        {savingProfile
                                            ? 'Saving...'
                                            : 'Save changes'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingProfile(false)}
                                        disabled={savingProfile}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {profileMessage && (
                            <p className="profile-success" role="status">
                                {profileMessage}
                            </p>
                        )}
                    </article>

                    <article className="customer-panel customer-map-panel">
                        <div className="customer-section-title">
                            <div>
                                <span>COME SAY HELLO</span>
                                <h2>Find the café</h2>
                            </div>
                            <MapPin size={22} />
                        </div>

                        <p className="customer-map-address">
                            {CAFE_ADDRESS}
                        </p>

                        <div className="customer-map-frame">
                            <iframe
                                title="Map showing Triveni Terrace Café"
                                src={MAP_EMBED_URL}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>

                        <a
                            className="customer-primary-link customer-directions-link"
                            href={DIRECTIONS_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Navigation size={16} /> Get directions
                        </a>
                    </article>
                </section>

                <section className="customer-payment-note">
                    <span><CreditCard size={21} /></span>
                    <div>
                        <strong>Online payment</strong>
                        <p>
                            Secure online payment will be enabled after the
                            café's payment gateway is configured. No payment
                            is taken through this dashboard yet.
                        </p>
                    </div>
                </section>

            </main>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div
                    className="order-modal-overlay"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="order-details-modal customer-order-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="order-modal-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="order-modal-header">
                            <div>
                                <span>ORDER DETAILS & TRACKING</span>
                                <h2 id="order-modal-title">
                                    #{selectedOrder.id.slice(0, 8)}
                                </h2>
                            </div>

                            <button
                                className="order-modal-close"
                                onClick={() => setSelectedOrder(null)}
                                aria-label="Close"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="order-modal-section">
                            <h3>Order progress</h3>
                            <StatusBadge status={selectedOrder.status} />
                            <OrderProgress status={selectedOrder.status} />
                        </div>

                        <div className="order-modal-section">
                            <h3>Order information</h3>

                            <p>
                                <CalendarDays size={16} />
                                {formatDate(selectedOrder.created_at, true)}
                            </p>

                            <p>
                                <Package size={16} />
                                {selectedOrder.order_type === 'pickup'
                                    ? 'Self pickup'
                                    : 'Home delivery'}
                            </p>

                            <p>
                                <UserRound size={16} />
                                {selectedOrder.full_name}
                            </p>

                            <p>
                                <Phone size={16} />
                                {selectedOrder.phone}
                            </p>

                            {selectedOrder.delivery_address && (
                                <p>
                                    <MapPin size={16} />
                                    {selectedOrder.delivery_address}
                                </p>
                            )}
                        </div>

                        <div className="order-modal-section">
                            <h3>Items</h3>

                            {(selectedOrder.order_items || []).map(item => (
                                <div
                                    className="order-modal-item"
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

                        <div className="order-modal-total">
                            <span>Total</span>
                            <strong>
                                ₹{Number(selectedOrder.total_amount).toFixed(2)}
                            </strong>
                        </div>

                        <button
                            className="order-modal-done"
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}