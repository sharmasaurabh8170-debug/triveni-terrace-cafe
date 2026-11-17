import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
    UserRound,
    CalendarDays,
    ShoppingBag,
    LogOut,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    X,
    MapPin,
    Phone,
    Package,
    Pencil,
    Save
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import '../styles/auth.css';

export default function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderError, setOrderError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Customer profile editing
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        phone: ''
    });
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        let mounted = true;
        let orderSubscription = null;

        const loadDashboard = async () => {
            const {
                data: { session }
            } = await supabase.auth.getSession();

            if (!mounted) return;

            if (!session) {
                navigate('/login', { replace: true });
                return;
            }

            setUser(session.user);

            setProfileForm({
                full_name: session.user.user_metadata?.full_name || '',
                phone: session.user.user_metadata?.phone || ''
            });

            // Fetch reservations
            const { data: reservationData, error: reservationError } =
                await supabase
                    .from('reservations')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

            if (!mounted) return;

            if (reservationError) {
                console.error('Reservation error:', reservationError.message);
            } else {
                setReservations(reservationData || []);
            }

            // Fetch customer orders
            const { data: orderData, error: ordersError } =
                await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

            if (!mounted) return;

            if (ordersError) {
                console.error('Orders error:', ordersError.message);
                setOrderError(ordersError.message);
            } else {
                setOrders(orderData || []);
            }

            setLoading(false);

            // Automatic order status updates
            if (mounted) {
                orderSubscription = supabase
                    .channel(`customer-orders-${session.user.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'orders',
                            filter: `user_id=eq.${session.user.id}`
                        },
                        (payload) => {
                            setOrders(current =>
                                current.map(order =>
                                    order.id === payload.new.id
                                        ? {
                                            ...order,
                                            status: payload.new.status
                                        }
                                        : order
                                )
                            );

                            setSelectedOrder(current =>
                                current?.id === payload.new.id
                                    ? {
                                        ...current,
                                        status: payload.new.status
                                    }
                                    : current
                            );
                        }
                    )
                    .subscribe();
            }
        };

        loadDashboard();

        return () => {
            mounted = false;

            if (orderSubscription) {
                supabase.removeChannel(orderSubscription);
            }
        };
    }, [navigate]);

    // Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    // Update customer profile
    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        setProfileMessage('');
        setProfileError('');

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

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone
                }
            });

            if (error) throw error;

            setUser(data.user);

            setProfileForm({
                full_name: data.user.user_metadata?.full_name || '',
                phone: data.user.user_metadata?.phone || ''
            });

            setProfileMessage('Profile updated successfully!');
            setIsEditingProfile(false);

        } catch (error) {
            setProfileError(
                error.message || 'Unable to update your profile.'
            );
        } finally {
            setSavingProfile(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading your dashboard...
            </div>
        );
    }

    if (!user) return null;

    const name =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Customer';

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format date and time
    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Order status
    const renderOrderStatus = (status) => {
        if (status === 'cancelled') {
            return (
                <div className="order-tracking cancelled-tracking">
                    <div className="tracking-icon cancelled-icon">
                        <XCircle size={24} />
                    </div>

                    <div>
                        <h4>Order Cancelled</h4>
                        <p>Your order has been cancelled by the café.</p>
                    </div>
                </div>
            );
        }

        if (status === 'confirmed') {
            return (
                <div className="order-tracking confirmed-tracking">
                    <div className="tracking-icon confirmed-icon">
                        <CheckCircle size={24} />
                    </div>

                    <div>
                        <h4>Order Confirmed</h4>
                        <p>The café has confirmed your order.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="order-tracking placed-tracking">
                <div className="tracking-icon placed-icon">
                    <Clock size={24} />
                </div>

                <div>
                    <h4>Order Placed</h4>
                    <p>Your order is awaiting confirmation.</p>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-page">

            {/* Header */}
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

                {/* Welcome */}
                <section className="dashboard-welcome">
                    <span>YOUR ACCOUNT</span>

                    <h1>Welcome, {name}!</h1>

                    <p>
                        Manage your café experience from one place.
                    </p>
                </section>

                {/* Dashboard Cards */}
                <section className="dashboard-grid">

                    {/* Profile Card */}
                    <div className="dashboard-card profile-card">
                        <UserRound size={25} />
                        <h3>My Profile</h3>

                        {!isEditingProfile ? (
                            <>
                                <p>
                                    {user.user_metadata?.full_name || 'Customer'}
                                </p>

                                <p>{user.email}</p>

                                <p>
                                    Phone: {user.user_metadata?.phone || 'Not added'}
                                </p>

                                <span className="account-status">
                                    {user.email_confirmed_at
                                        ? 'Email Verified'
                                        : 'Email Not Verified'}
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
                                    <Pencil size={16} />
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <form
                                className="profile-edit-form"
                                onSubmit={handleProfileUpdate}
                            >
                                <label htmlFor="profile-full-name">
                                    Full Name
                                </label>

                                <input
                                    id="profile-full-name"
                                    type="text"
                                    value={profileForm.full_name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            full_name: e.target.value
                                        })
                                    }
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />

                                <label htmlFor="profile-email">
                                    Email Address
                                </label>

                                <input
                                    id="profile-email"
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                />

                                <label htmlFor="profile-phone">
                                    Phone Number
                                </label>

                                <input
                                    id="profile-phone"
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            phone: e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10)
                                        })
                                    }
                                    placeholder="Enter 10-digit phone number"
                                    autoComplete="tel"
                                    maxLength={10}
                                    required
                                />

                                {profileError && (
                                    <p className="profile-error" role="alert">
                                        {profileError}
                                    </p>
                                )}

                                <div className="profile-form-buttons">

                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                    >
                                        <Save size={16} />
                                        {savingProfile ? 'Saving...' : 'Save'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setProfileError('');

                                            setProfileForm({
                                                full_name:
                                                    user.user_metadata?.full_name || '',
                                                phone:
                                                    user.user_metadata?.phone || ''
                                            });
                                        }}
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
                    </div>

                    {/* Reservations Card */}
                    <div className="dashboard-card">
                        <CalendarDays size={25} />
                        <h3>My Reservations</h3>
                        <p>{reservations.length} booking(s)</p>
                    </div>

                    {/* Orders Card */}
                    <div className="dashboard-card">
                        <ShoppingBag size={25} />
                        <h3>My Orders</h3>
                        <p>{orders.length} order(s)</p>
                    </div>

                </section>

                {/* Reservations */}
                <section className="dashboard-details">

                    <h2>My Reservations</h2>

                    {reservations.length === 0 ? (

                        <div className="empty-reservations">
                            <CalendarDays size={35} />

                            <p>
                                You haven't made any reservations yet.
                            </p>

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
                                            {formatDate(booking.reservation_date)}
                                        </h3>

                                        <p>
                                            Time: {booking.reservation_time}
                                        </p>

                                        <p>
                                            Guests: {booking.guests}
                                        </p>
                                    </div>

                                    <span
                                        className={`booking-status ${booking.status}`}
                                    >
                                        {booking.status}
                                    </span>

                                </div>
                            ))}

                        </div>
                    )}

                </section>

                {/* Customer Orders */}
                <section className="dashboard-details">

                    <h2>My Orders</h2>

                    {orderError && (
                        <p className="dashboard-error">
                            Unable to load orders: {orderError}
                        </p>
                    )}

                    {!orderError && orders.length === 0 ? (

                        <div className="empty-reservations">
                            <ShoppingBag size={35} />

                            <p>
                                You haven't placed any food orders yet.
                            </p>

                            <Link to="/">
                                Explore Our Menu
                            </Link>
                        </div>

                    ) : (

                        <div className="customer-order-list">

                            {orders.map((order) => (

                                <div
                                    className="customer-order-card"
                                    key={order.id}
                                >

                                    {/* Order Header */}
                                    <div className="customer-order-header">

                                        <div>
                                            <span>ORDER ID</span>

                                            <h3>
                                                #{order.id.slice(0, 8)}
                                            </h3>

                                            <p>
                                                {formatDateTime(order.created_at)}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Order Status */}
                                    <div className="order-tracking-container">

                                        <h3>Order Status</h3>

                                        {renderOrderStatus(order.status)}

                                    </div>

                                    {/* Food Items */}
                                    <div className="customer-order-items">

                                        {order.order_items?.map((item) => (

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

                                    {/* Order Footer */}
                                    <div className="customer-order-footer">

                                        <span>
                                            {order.order_type === 'pickup'
                                                ? 'Self Pickup'
                                                : 'Home Delivery'}
                                        </span>

                                        <strong>
                                            Total: ₹
                                            {Number(order.total_amount).toFixed(2)}
                                        </strong>

                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        className="view-order-button"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <Eye size={17} />
                                        View Order Details
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

            {/* Order Details Modal */}
            {selectedOrder && (

                <div
                    className="order-modal-overlay"
                    onClick={() => setSelectedOrder(null)}
                >

                    <div
                        className="order-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="order-modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Modal Header */}
                        <div className="order-modal-header">

                            <div>
                                <span>ORDER DETAILS</span>

                                <h2 id="order-modal-title">
                                    #{selectedOrder.id.slice(0, 8)}
                                </h2>
                            </div>

                            <button
                                className="order-modal-close"
                                onClick={() => setSelectedOrder(null)}
                                aria-label="Close order details"
                            >
                                <X size={22} />
                            </button>

                        </div>

                        {/* Status */}
                        <div className="order-modal-section">

                            <h3>Order Status</h3>

                            {renderOrderStatus(selectedOrder.status)}

                        </div>

                        {/* Date */}
                        <div className="order-modal-section">

                            <h3>Order Information</h3>

                            <p>
                                <CalendarDays size={17} />
                                {formatDateTime(selectedOrder.created_at)}
                            </p>

                            <p>
                                <Package size={17} />
                                {selectedOrder.order_type === 'pickup'
                                    ? 'Self Pickup'
                                    : 'Home Delivery'}
                            </p>

                        </div>

                        {/* Customer Details */}
                        <div className="order-modal-section">

                            <h3>Customer Details</h3>

                            <p>
                                <UserRound size={17} />
                                {selectedOrder.full_name}
                            </p>

                            <p>
                                <Phone size={17} />
                                {selectedOrder.phone}
                            </p>

                            {selectedOrder.order_type === 'delivery' &&
                                selectedOrder.delivery_address && (

                                    <p>
                                        <MapPin size={17} />
                                        {selectedOrder.delivery_address}
                                    </p>

                                )}

                        </div>

                        {/* Ordered Items */}
                        <div className="order-modal-section">

                            <h3>Ordered Items</h3>

                            <div className="order-modal-items">

                                {selectedOrder.order_items?.map((item) => (

                                    <div
                                        className="order-modal-item"
                                        key={item.id}
                                    >

                                        <div>
                                            <strong>{item.dish_name}</strong>

                                            <span>
                                                Quantity: {item.quantity}
                                            </span>
                                        </div>

                                        <strong>
                                            ₹{Number(item.subtotal).toFixed(2)}
                                        </strong>

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* Total */}
                        <div className="order-modal-total">

                            <span>Total Amount</span>

                            <strong>
                                ₹{Number(selectedOrder.total_amount).toFixed(2)}
                            </strong>

                        </div>

                        <button
                            className="order-modal-done"
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close Details
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}