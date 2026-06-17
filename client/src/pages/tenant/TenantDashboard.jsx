import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import PropertyCard from '../../components/property/PropertyCard';
import API from '../../api/axiosConfig';
import { Trash2, Calendar, MapPin, Key, ShieldCheck, Mail, Phone, Camera, XCircle } from 'lucide-react';

const TenantDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { favorites, fetchFavorites } = useFavorites();
  const location = useLocation();
  const fileInputRef = useRef();

  // Find active tab from search params or default to 'profile'
  const [activeTab, setActiveTab] = useState('profile');

  // Tenant states
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Profile Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'wishlist') {
      fetchFavorites();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
    setProfileError('');
    setProfileSuccess('');
  }, [activeTab]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await API.get('/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await API.get('/reviews/me/tenant');
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);
    
    const res = await updateProfile(profileForm);
    setProfileLoading(false);
    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setProfileSuccess('Avatar updated successfully!');
      } else {
        setProfileError(res.error || 'Failed to upload image.');
      }
    } catch (err) {
      setProfileError('Image upload failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await API.put(`/bookings/${bookingId}`, { status: 'cancelled' });
      if (response.data.success) {
        // Refresh bookings
        fetchBookings();
        alert('Booking cancelled successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review? This action is irreversible.')) return;

    try {
      const response = await API.delete(`/reviews/${reviewId}`);
      if (response.data.success) {
        fetchReviews();
        alert('Review deleted.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  // Status badge style helper
  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-success text-white';
    if (status === 'rejected' || status === 'cancelled') return 'bg-danger text-white';
    return 'bg-warning text-dark';
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="row g-4">
          <div className="col-12 mb-2">
            <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>My Account Profile</h3>
            <p className="text-secondary small">Update your name, contact phone, or profile avatar.</p>
          </div>

          {/* Avatar Upload column */}
          <div className="col-md-4 text-center">
            <div className="card p-4 glass-card border-0 text-center shadow-sm">
              <div className="position-relative d-inline-block mx-auto mb-3">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage.startsWith('http') ? user.profileImage : `/${user.profileImage}`} 
                    alt={user.name} 
                    className="rounded-circle object-fit-cover shadow"
                    style={{ width: '130px', height: '130px', border: '3px solid var(--primary)' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-extrabold shadow mx-auto"
                    style={{ width: '130px', height: '130px', fontSize: '3rem', border: '3px solid var(--primary)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="btn btn-primary p-2 rounded-circle hover-scale position-absolute d-flex align-items-center justify-content-center shadow"
                  style={{ bottom: '0', right: '10px', width: '38px', height: '38px' }}
                  title="Change avatar"
                  disabled={profileLoading}
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="d-none" 
                  accept="image/*"
                />
              </div>

              <h5 className="fw-bold m-0 text-truncate">{user.name}</h5>
              <span className="badge bg-secondary text-capitalize mt-2 mb-3">{user.role}</span>
              
              <div className="pt-3 border-top text-start small text-secondary d-flex flex-column gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <span className="d-flex align-items-center gap-2 text-truncate"><Mail size={16} /> {user.email}</span>
                <span className="d-flex align-items-center gap-2"><Phone size={16} /> {user.phone}</span>
              </div>
            </div>
          </div>

          {/* Profile Form column */}
          <div className="col-md-8">
            <div className="card p-4 p-md-5 border-0 shadow-sm bg-surface">
              <h5 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Account Details</h5>
              
              {profileSuccess && <div className="alert alert-success small py-2">{profileSuccess}</div>}
              {profileError && <div className="alert alert-danger small py-2">{profileError}</div>}

              <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-control" 
                      value={profileForm.name} 
                      onChange={handleProfileChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      className="form-control" 
                      value={profileForm.phone} 
                      onChange={handleProfileChange}
                      required 
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2"
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Saving changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>My Booking Requests</h3>
          <p className="text-secondary small mb-4">View states and dates for your scheduled property visits.</p>

          {bookingsLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-5 glass-card border-0">
              <Calendar size={40} className="text-muted mx-auto mb-3" />
              <h5 className="fw-bold text-muted">No Visits Booked</h5>
              <p className="text-secondary small mb-3">Browse our properties catalog and schedule a booking.</p>
              <Link to="/properties" className="btn btn-primary btn-sm mx-auto px-4">Browse Directory</Link>
            </div>
          ) : (
            <div className="row g-4">
              {bookings.map((booking) => {
                const property = booking.propertyId;
                if (!property) return null;
                const img = property.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
                const imgUrl = img.startsWith('http') ? img : `/${img}`;

                return (
                  <div key={booking._id} className="col-md-6">
                    <div className="card border-0 shadow-sm p-3 bg-surface d-flex flex-row align-items-center gap-3">
                      <img 
                        src={imgUrl} 
                        alt={property.title} 
                        className="rounded object-fit-cover" 
                        style={{ width: '120px', height: '110px', flexShrink: 0 }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-start gap-1">
                          <h6 className="fw-bold text-truncate mb-1">
                            <Link to={`/properties/${property._id}`} className="text-decoration-none text-dark">{property.title}</Link>
                          </h6>
                          <span className={`badge ${getStatusBadge(booking.status)} text-capitalize flex-shrink-0`}>{booking.status}</span>
                        </div>
                        <p className="text-secondary d-flex align-items-center gap-1 small mb-2 text-truncate">
                          <MapPin size={14} className="text-muted flex-shrink-0" /> {property.city}
                        </p>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                          <span className="small text-secondary fw-semibold">Date: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                          {booking.status === 'pending' && (
                            <button 
                              onClick={() => handleCancelBooking(booking._id)}
                              className="btn btn-link text-danger p-0 text-decoration-none small d-flex align-items-center gap-0.5"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Wishlist Properties</h3>
          <p className="text-secondary small mb-4">Manage listings you have bookmarked for comparison or visits.</p>

          {favorites.length === 0 ? (
            <div className="card text-center py-5 glass-card border-0">
              <h5 className="fw-bold text-muted mb-2">Wishlist is Empty</h5>
              <p className="text-secondary small mb-3">Save listings while browsing properties.</p>
              <Link to="/properties" className="btn btn-primary btn-sm mx-auto px-4">Browse Directory</Link>
            </div>
          ) : (
            <div className="row g-4 animate-slide-up">
              {favorites.map((fav) => {
                const property = fav.propertyId;
                if (!property) return null;
                return (
                  <div key={fav._id} className="col-md-4">
                    <PropertyCard property={property} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>My Submitted Reviews</h3>
          <p className="text-secondary small mb-4">View or delete ratings and text feedback you shared on properties.</p>

          {reviewsLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-5 card glass-card border-0">
              <p className="text-secondary m-0">You have not submitted any reviews yet.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((rev) => {
                const property = rev.propertyId;
                if (!property) return null;
                return (
                  <div key={rev._id} className="card p-3 border-0 shadow-sm bg-surface">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <h6 className="fw-bold mb-1">
                          <Link to={`/properties/${property._id}`} className="text-decoration-none text-dark">{property.title}</Link>
                        </h6>
                        <span className="small text-secondary">Rent: ₹{property.rent}/mo | City: {property.city}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center gap-0.5 text-warning small">
                          {rev.rating} ★
                        </div>
                        <button 
                          onClick={() => handleDeleteReview(rev._id)}
                          className="btn btn-outline-danger btn-sm p-1.5 rounded-circle hover-scale border-0"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-secondary mt-2 mb-0 small fst-italic">"{rev.reviewText}"</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TenantDashboard;
