import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Heart, 
  MapPin, 
  Star, 
  Share2, 
  Shuffle, 
  Calendar, 
  Send, 
  BedDouble, 
  Bath, 
  Square, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import API from '../api/axiosConfig';

// Fix for default Leaflet marker icons under Vite asset loader
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { propertyDetails, loading, error, fetchPropertyDetails, toggleCompare, compareList } = useProperties();
  
  const [activeImage, setActiveImage] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [inquiryText, setInquiryText] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    const data = await fetchPropertyDetails(id);
    if (data) {
      if (data.images && data.images.length > 0) {
        const img = data.images[0];
        setActiveImage(img.startsWith('http') ? img : `/${img}`);
      } else {
        setActiveImage('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85');
      }
      fetchReviews(data._id);
    }
  };

  const fetchReviews = async (propertyId) => {
    try {
      const response = await API.get(`/reviews/${propertyId}`);
      if (response.data.success) {
        setReviewsList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  if (loading && !propertyDetails) {
    return (
      <div className="container py-5 mt-5">
        <SkeletonLoader type="details" />
      </div>
    );
  }

  if (error || !propertyDetails) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="alert alert-danger shadow-sm py-4">
          <h4 className="fw-bold">Error Loading Property</h4>
          <p className="m-0">{error || 'The requested property could not be found.'}</p>
          <Link to="/properties" className="btn btn-primary mt-3">Back to Directory</Link>
        </div>
      </div>
    );
  }

  const property = propertyDetails;
  const isCompared = compareList.some(item => item._id === property._id);

  // Booking Submit Handler
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      setBookingError('Only tenants can book properties.');
      return;
    }
    if (!bookingDate) {
      setBookingError('Please select a booking date.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');
    try {
      const response = await API.post('/bookings', {
        propertyId: property._id,
        bookingDate
      });
      if (response.data.success) {
        setBookingSuccess('Booking request sent successfully! Owner will review it.');
        setBookingDate('');
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Inquiry Submit Handler
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      setInquiryError('Only tenants can send inquiries.');
      return;
    }
    if (!inquiryText.trim()) {
      setInquiryError('Please write a message.');
      return;
    }

    setInquiryLoading(true);
    setInquiryError('');
    setInquirySuccess('');
    try {
      const response = await API.post('/inquiries', {
        propertyId: property._id,
        message: inquiryText
      });
      if (response.data.success) {
        setInquirySuccess('Inquiry sent successfully to the owner!');
        setInquiryText('');
      }
    } catch (err) {
      setInquiryError(err.response?.data?.message || 'Failed to send inquiry.');
    } finally {
      setInquiryLoading(false);
    }
  };

  // Review Submit Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'tenant') {
      setReviewError('Only tenants can leave ratings and reviews.');
      return;
    }
    if (!reviewText.trim()) {
      setReviewError('Please write a review text.');
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    try {
      const response = await API.post('/reviews', {
        propertyId: property._id,
        rating: reviewRating,
        reviewText
      });
      if (response.data.success) {
        setReviewSuccess('Review submitted successfully!');
        setReviewText('');
        setReviewRating(5);
        fetchReviews(property._id);
        // Refresh detail to get updated rating
        fetchPropertyDetails(property._id);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'You have already reviewed this property.');
    }
  };

  // Share link handler
  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Property link copied to clipboard!');
  };

  // Map Coordinates setup (Default Noida: 28.5355, 77.3910)
  const mapLat = property.locationCoordinates?.lat || 28.5355;
  const mapLng = property.locationCoordinates?.lng || 77.3910;

  return (
    <div className="container py-5 mt-3">
      {/* Top action row */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/properties" className="text-decoration-none">Properties</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Details</li>
          </ol>
        </nav>

        <div className="d-flex gap-2">
          <button onClick={handleShareClick} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <Share2 size={16} /> Share
          </button>
          <button onClick={() => toggleCompare(property)} className={`btn btn-sm d-flex align-items-center gap-1 ${isCompared ? 'btn-primary' : 'btn-outline-primary'}`}>
            <Shuffle size={16} /> {isCompared ? 'Compared' : 'Compare'}
          </button>
        </div>
      </div>

      <div className="row g-5">
        {/* Left Column: Image and Details */}
        <div className="col-lg-8">
          {/* Main Image View */}
          <div className="card border-0 mb-3 overflow-hidden shadow-sm" style={{ height: '450px', borderRadius: 'var(--radius-md)' }}>
            <img src={activeImage} alt={property.title} className="w-100 h-100 object-fit-cover" />
          </div>

          {/* Thumbnail list */}
          {property.images && property.images.length > 0 && (
            <div className="d-flex gap-2 mb-4 overflow-x-auto pb-2">
              {property.images.map((img, idx) => {
                const url = img.startsWith('http') ? img : `/${img}`;
                return (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(url)}
                    className="btn p-0 rounded overflow-hidden" 
                    style={{ width: '100px', height: '70px', border: activeImage === url ? '2px solid var(--primary)' : '1px solid var(--border-color)', flexShrink: 0 }}
                  >
                    <img src={url} alt={`Thumb ${idx}`} className="w-100 h-100 object-fit-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Property Info Details */}
          <div className="card p-4 border-0 shadow-sm bg-surface mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <span className="badge bg-primary text-uppercase mb-2">{property.propertyType}</span>
                <h2 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{property.title}</h2>
                <p className="text-secondary d-flex align-items-center gap-1 m-0">
                  <MapPin size={18} className="text-primary flex-shrink-0" />
                  <span>{property.address}, {property.city}, {property.state} - {property.pincode}</span>
                </p>
              </div>

              <div className="text-lg-end">
                <span className="text-primary d-block fw-extrabold" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
                  ₹{property.rent.toLocaleString('en-IN')}
                </span>
                <span className="text-muted d-block small">Deposit: ₹{property.deposit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />

            {/* Key Specs */}
            <div className="row g-4 text-center mb-4">
              <div className="col-4 border-end" style={{ borderColor: 'var(--border-color)' }}>
                <BedDouble size={28} className="text-primary mb-2" />
                <h6 className="fw-bold mb-0">{property.bedrooms} Bedrooms</h6>
                <small className="text-muted">BHK layout</small>
              </div>
              <div className="col-4 border-end" style={{ borderColor: 'var(--border-color)' }}>
                <Bath size={28} className="text-primary mb-2" />
                <h6 className="fw-bold mb-0">{property.bathrooms} Bathrooms</h6>
                <small className="text-muted">Sanitary fittings</small>
              </div>
              <div className="col-4">
                <Square size={28} className="text-primary mb-2" />
                <h6 className="fw-bold mb-0">{property.area} Sq.Ft</h6>
                <small className="text-muted">Super built-up</small>
              </div>
            </div>

            {/* Description */}
            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Description</h5>
            <p className="text-secondary mb-4" style={{ lineHeight: '1.7' }}>{property.description}</p>

            {/* Amenities Checkbox list */}
            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Amenities</h5>
            <div className="row g-3">
              {property.amenities && property.amenities.length > 0 ? (
                property.amenities.map((amenity, idx) => (
                  <div key={idx} className="col-md-4 col-6">
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <CheckCircle2 size={18} className="text-success" />
                      <span>{amenity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-muted">Standard fittings and fixtures.</div>
              )}
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="card p-4 border-0 shadow-sm bg-surface mb-4">
            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Location Map</h5>
            <div style={{ height: '350px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <MapContainer 
                center={[mapLat, mapLng]} 
                zoom={14} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[mapLat, mapLng]}>
                  <Popup>
                    <strong>{property.title}</strong><br />
                    Rent: ₹{property.rent}/mo
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Reviews & Submission */}
          <div className="card p-4 border-0 shadow-sm bg-surface">
            <h5 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>User Reviews & Ratings</h5>

            {/* Submit Review Form (Tenant only) */}
            {user && user.role === 'tenant' && (
              <form onSubmit={handleReviewSubmit} className="p-3 rounded-4 mb-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h6 className="fw-bold mb-3">Leave a Review</h6>
                {reviewError && <div className="alert alert-danger small py-2">{reviewError}</div>}
                {reviewSuccess && <div className="alert alert-success small py-2">{reviewSuccess}</div>}
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span className="small fw-semibold text-secondary">Rating:</span>
                  <select 
                    className="form-select form-select-sm w-auto" 
                    value={reviewRating} 
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Very Bad)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="Write your review here..." 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
              </form>
            )}

            {/* Reviews list */}
            {reviewsList.length === 0 ? (
              <p className="text-secondary m-0 text-center py-4">No reviews submitted yet for this property.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviewsList.map((rev) => (
                  <div key={rev._id} className="pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-secondary text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                          {rev.tenantId?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h6 className="m-0 fw-bold">{rev.tenantId?.name || 'Tenant'}</h6>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(rev.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                      <div className="d-flex gap-0.5 align-items-center">
                        <Star size={14} className="text-warning" fill="var(--warning)" />
                        <span className="fw-semibold text-secondary" style={{ fontSize: '0.9rem' }}>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.9rem' }}>{rev.reviewText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Owner Card & Actions */}
        <div className="col-lg-4">
          {/* Owner details */}
          <div className="card p-4 border-0 shadow-sm bg-surface mb-4">
            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Listed By</h5>
            <div className="d-flex align-items-center gap-3">
              {property.ownerId?.profileImage ? (
                <img 
                  src={property.ownerId.profileImage.startsWith('http') ? property.ownerId.profileImage : `/${property.ownerId.profileImage}`} 
                  alt={property.ownerId.name} 
                  className="rounded-circle object-fit-cover" 
                  style={{ width: '60px', height: '60px' }}
                />
              ) : (
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-extrabold fs-4" style={{ width: '60px', height: '60px' }}>
                  {property.ownerId?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h6 className="fw-bold m-0" style={{ fontSize: '1.1rem' }}>{property.ownerId?.name}</h6>
                <span className="badge bg-secondary text-capitalize mb-1">{property.ownerId?.role}</span>
              </div>
            </div>

            {user && (
              <div className="mt-4 pt-3 border-top d-flex flex-column gap-2 text-secondary" style={{ fontSize: '0.9rem', borderColor: 'var(--border-color)' }}>
                <span className="d-flex align-items-center gap-2"><Phone size={16} /> {property.ownerId?.phone}</span>
                <span className="d-flex align-items-center gap-2"><Mail size={16} /> {property.ownerId?.email}</span>
              </div>
            )}
          </div>

          {/* Booking Action Card */}
          <div className="card p-4 border-0 shadow-sm bg-surface mb-4">
            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Book a Visit</h5>
            
            {bookingSuccess && <div className="alert alert-success small py-2">{bookingSuccess}</div>}
            {bookingError && <div className="alert alert-danger small py-2">{bookingError}</div>}

            <form onSubmit={handleBookingSubmit}>
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Preferred Date</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-0"><Calendar size={18} /></span>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Submitting...' : 'Request Visit'}
              </button>
            </form>
          </div>

          {/* Inquiry Action Card */}
          <div className="card p-4 border-0 shadow-sm bg-surface">
            <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Send an Inquiry</h5>

            {inquirySuccess && <div className="alert alert-success small py-2">{inquirySuccess}</div>}
            {inquiryError && <div className="alert alert-danger small py-2">{inquiryError}</div>}

            <form onSubmit={handleInquirySubmit}>
              <div className="mb-3">
                <textarea 
                  rows="4" 
                  className="form-control" 
                  placeholder="Ask the owner about rent negotiation, rules, keys availability..."
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-outline-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={inquiryLoading}
              >
                {inquiryLoading ? 'Sending...' : 'Send Message'} <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
