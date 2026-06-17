import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../api/axiosConfig';
import { 
  Building, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Mail, 
  Check, 
  X, 
  Calendar, 
  User, 
  Phone, 
  DollarSign, 
  Activity, 
  Upload, 
  Camera, 
  AlertCircle 
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef();
  const multipleImagesInputRef = useRef();

  const [activeTab, setActiveTab] = useState('analytics');

  // Stats and data states
  const [stats, setStats] = useState({
    totalListings: 0,
    expectedRevenue: 0,
    pendingVisits: 0,
    totalInquiries: 0
  });
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Property Form state (for both Add and Edit)
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    rent: '',
    deposit: '',
    propertyType: 'Apartment',
    bedrooms: '2',
    bathrooms: '2',
    area: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    amenities: [],
    locationCoordinates: { lat: 28.5355, lng: 77.3910 }
  });
  const [formFiles, setFormFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const amenitiesList = ['Parking', 'WiFi', 'Gym', 'Power Backup', 'Security', 'Lift', 'Garden', 'Swimming Pool'];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  useEffect(() => {
    setProfileSuccess('');
    setProfileError('');
    setFormError('');
    setFormSuccess('');

    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'inquiries') {
      fetchInquiries();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const pRes = await API.get(`/properties?ownerId=${user._id}&status=all`);
      const bRes = await API.get('/bookings');
      const iRes = await API.get('/inquiries');

      if (pRes.data.success && bRes.data.success && iRes.data.success) {
        const pList = pRes.data.data;
        const total = pList.length;
        const rev = pList.reduce((acc, curr) => acc + curr.rent, 0);
        
        // Filter bookings for owner properties
        const pendingVisits = bRes.data.data.filter(b => b.status === 'pending').length;
        const totalInquiries = iRes.data.data.length;

        setStats({
          totalListings: total,
          expectedRevenue: rev,
          pendingVisits,
          totalInquiries
        });
      }
    } catch (err) {
      console.error('Error compiling analytics:', err);
    }
  };

  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const response = await API.get(`/properties?ownerId=${user._id}&status=all`);
      if (response.data.success) {
        setListings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching owner listings:', err);
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const response = await API.get('/inquiries');
      if (response.data.success) {
        setInquiries(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setInquiriesLoading(false);
    }
  };

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

  // Property status toggler
  const togglePropertyStatus = async (property) => {
    const nextStatus = property.status === 'available' ? 'rented' : 'available';
    try {
      const response = await API.put(`/properties/${property._id}`, { status: nextStatus });
      if (response.data.success) {
        fetchListings();
        alert(`Listing marked as ${nextStatus}!`);
      }
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  // Delete Listing handler
  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? All bookings and reviews will be lost.')) return;
    try {
      const response = await API.delete(`/properties/${id}`);
      if (response.data.success) {
        fetchListings();
        alert('Listing deleted successfully.');
      }
    } catch (err) {
      alert('Failed to delete property.');
    }
  };

  // Edit Listing initialization
  const startEditProperty = (property) => {
    setEditingPropertyId(property._id);
    setPropertyForm({
      title: property.title,
      description: property.description,
      rent: property.rent,
      deposit: property.deposit,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area,
      address: property.address,
      city: property.city,
      state: property.state,
      pincode: property.pincode,
      amenities: property.amenities || [],
      locationCoordinates: property.locationCoordinates || { lat: 28.5355, lng: 77.3910 }
    });
    setExistingImages(property.images || []);
    setImagePreviews([]);
    setFormFiles([]);
    setFormError('');
    setFormSuccess('');
    setActiveTab('add-property');
  };

  const resetForm = () => {
    setEditingPropertyId(null);
    setPropertyForm({
      title: '',
      description: '',
      rent: '',
      deposit: '',
      propertyType: 'Apartment',
      bedrooms: '2',
      bathrooms: '2',
      area: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      amenities: [],
      locationCoordinates: { lat: 28.5355, lng: 77.3910 }
    });
    setFormFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setFormError('');
    setFormSuccess('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPropertyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setPropertyForm(prev => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleMultipleImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (idx) => {
    setFormFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (imgUrl) => {
    setExistingImages(prev => prev.filter(url => url !== imgUrl));
  };

  // Property Form Submission (Multipart Form data)
  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    const formData = new FormData();
    // Append fields
    Object.keys(propertyForm).forEach(key => {
      if (key === 'amenities') {
        formData.append('amenities', JSON.stringify(propertyForm.amenities));
      } else if (key === 'locationCoordinates') {
        formData.append('locationCoordinates', JSON.stringify(propertyForm.locationCoordinates));
      } else {
        formData.append(key, propertyForm[key]);
      }
    });

    // Append new images
    formFiles.forEach(file => {
      formData.append('images', file);
    });

    // Append existing remaining images if editing
    if (editingPropertyId) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    try {
      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingPropertyId) {
        response = await API.put(`/properties/${editingPropertyId}`, formData, config);
      } else {
        response = await API.post('/properties', formData, config);
      }

      if (response.data.success) {
        setFormSuccess(`Property ${editingPropertyId ? 'updated' : 'added'} successfully!`);
        setTimeout(() => {
          resetForm();
          setActiveTab('listings');
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit property listing.');
    } finally {
      setFormLoading(false);
    }
  };

  // Booking Approve/Reject
  const handleBookingAction = async (bookingId, nextStatus) => {
    try {
      const response = await API.put(`/bookings/${bookingId}`, { status: nextStatus });
      if (response.data.success) {
        fetchBookings();
        alert(`Booking request has been ${nextStatus}!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  // Profile Form changes
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

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="row g-4">
          <div className="col-12">
            <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Analytics Dashboard</h3>
            <p className="text-secondary small">Performance stats and inquiries overview.</p>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card p-4 border-0 shadow-sm bg-surface">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary small fw-medium">My Listings</span>
                  <h3 className="fw-bold m-0 mt-1" style={{ color: 'var(--primary)' }}>{stats.totalListings}</h3>
                </div>
                <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                  <Building size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card p-4 border-0 shadow-sm bg-surface">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary small fw-medium">Expected Revenue</span>
                  <h3 className="fw-bold m-0 mt-1" style={{ color: 'var(--accent)' }}>₹{stats.expectedRevenue.toLocaleString('en-IN')}</h3>
                </div>
                <div className="bg-success-subtle text-success p-3 rounded-circle d-flex align-items-center justify-content-center">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card p-4 border-0 shadow-sm bg-surface">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary small fw-medium">Pending Visits</span>
                  <h3 className="fw-bold m-0 mt-1" style={{ color: 'var(--warning)' }}>{stats.pendingVisits}</h3>
                </div>
                <div className="bg-warning-subtle text-warning p-3 rounded-circle d-flex align-items-center justify-content-center">
                  <Calendar size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="card p-4 border-0 shadow-sm bg-surface">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary small fw-medium">Total Inquiries</span>
                  <h3 className="fw-bold m-0 mt-1" style={{ color: 'var(--primary)' }}>{stats.totalInquiries}</h3>
                </div>
                <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                  <Mail size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info card */}
          <div className="col-md-12 mt-4">
            <div className="card p-4 glass-card border-0 shadow-sm">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><Activity size={18} /> Activity Advice</h5>
              <p className="text-secondary m-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                Keep your properties updated. Listings with complete BHK specs and high-quality images receive up to 8x more booking inquires. Respond to tenant messages promptly to secure leases faster.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Listings View */}
      {activeTab === 'listings' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>My Listed Properties</h3>
              <p className="text-secondary small m-0">Create, edit, or toggle availability status of your listings.</p>
            </div>
            <button onClick={() => { resetForm(); setActiveTab('add-property'); }} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
              <Plus size={16} /> Add New Listing
            </button>
          </div>

          {listingsLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : listings.length === 0 ? (
            <div className="card text-center py-5 glass-card border-0">
              <Building size={40} className="text-muted mx-auto mb-3" />
              <h5 className="fw-bold text-muted">No Properties Listed</h5>
              <p className="text-secondary small mb-3">Begin by listing your first property on the platform.</p>
              <button onClick={() => { resetForm(); setActiveTab('add-property'); }} className="btn btn-primary btn-sm mx-auto px-4">List Now</button>
            </div>
          ) : (
            <div className="card border-0 shadow-sm bg-surface overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-center">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="text-start ps-4">Property</th>
                      <th scope="col">Type</th>
                      <th scope="col">Monthly Rent</th>
                      <th scope="col">BHK / Baths</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((prop) => {
                      const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
                      const imgUrl = img.startsWith('http') ? img : `/${img}`;
                      return (
                        <tr key={prop._id}>
                          <td className="text-start ps-4">
                            <div className="d-flex align-items-center gap-3 py-1">
                              <img src={imgUrl} alt={prop.title} className="rounded object-fit-cover" style={{ width: '60px', height: '50px' }} />
                              <div className="min-w-0" style={{ maxWidth: '200px' }}>
                                <h6 className="fw-bold text-truncate mb-0">
                                  <Link to={`/properties/${prop._id}`} className="text-decoration-none text-dark">{prop.title}</Link>
                                </h6>
                                <small className="text-muted text-truncate d-block">{prop.address}, {prop.city}</small>
                              </div>
                            </div>
                          </td>
                          <td className="fw-medium text-capitalize">{prop.propertyType}</td>
                          <td className="fw-bold text-primary">₹{prop.rent.toLocaleString('en-IN')}</td>
                          <td>{prop.bedrooms} BHK / {prop.bathrooms} Baths</td>
                          <td>
                            <button 
                              onClick={() => togglePropertyStatus(prop)}
                              className={`btn btn-sm px-2.5 py-1 fw-bold border-0 rounded-pill ${prop.status === 'available' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                              title="Click to toggle availability"
                            >
                              {prop.status}
                            </button>
                          </td>
                          <td className="pe-4">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <button onClick={() => startEditProperty(prop)} className="btn btn-outline-secondary btn-sm p-1.5 rounded-circle hover-scale border-0" title="Edit listing">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteProperty(prop._id)} className="btn btn-outline-danger btn-sm p-1.5 rounded-circle hover-scale border-0" title="Delete listing">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Property Form View */}
      {activeTab === 'add-property' && (
        <div className="card p-4 p-md-5 border-0 shadow-sm bg-surface">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>
              {editingPropertyId ? 'Edit Listing Details' : 'Add New Rental Listing'}
            </h4>
            <button 
              onClick={() => { resetForm(); setActiveTab('listings'); }} 
              className="btn btn-outline-secondary btn-sm"
            >
              Cancel
            </button>
          </div>

          {formError && <div className="alert alert-danger small py-2">{formError}</div>}
          {formSuccess && <div className="alert alert-success small py-2">{formSuccess}</div>}

          <form onSubmit={handlePropertySubmit} className="d-flex flex-column gap-4">
            {/* Title & Description */}
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Property Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control" 
                  placeholder="e.g. Modern 2 BHK Apartment in Noida Sector 62"
                  value={propertyForm.title} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Description</label>
                <textarea 
                  name="description" 
                  rows="4" 
                  className="form-control" 
                  placeholder="Write details about the property, proximity to transport, furnishings..."
                  value={propertyForm.description} 
                  onChange={handleFormChange}
                  required
                ></textarea>
              </div>
            </div>

            {/* Rent, Deposit, Type, Sizes */}
            <div className="row g-3">
              <div className="col-md-3 col-6">
                <label className="form-label small fw-semibold text-secondary">Monthly Rent (₹)</label>
                <input 
                  type="number" 
                  name="rent" 
                  className="form-control" 
                  value={propertyForm.rent} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label small fw-semibold text-secondary">Security Deposit (₹)</label>
                <input 
                  type="number" 
                  name="deposit" 
                  className="form-control" 
                  value={propertyForm.deposit} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label small fw-semibold text-secondary">Property Type</label>
                <select name="propertyType" className="form-select" value={propertyForm.propertyType} onChange={handleFormChange}>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label small fw-semibold text-secondary">Built-up Area (Sq.Ft)</label>
                <input 
                  type="number" 
                  name="area" 
                  className="form-control" 
                  value={propertyForm.area} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
            </div>

            {/* BHK, Baths */}
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">BHK Layout (Bedrooms)</label>
                <select name="bedrooms" className="form-select" value={propertyForm.bedrooms} onChange={handleFormChange}>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">Bathrooms</label>
                <select name="bathrooms" className="form-select" value={propertyForm.bathrooms} onChange={handleFormChange}>
                  <option value="1">1 Bath</option>
                  <option value="2">2 Bath</option>
                  <option value="3">3 Bath</option>
                  <option value="4">4+ Bath</option>
                </select>
              </div>
            </div>

            {/* Location Specs */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Street Address</label>
                <input 
                  type="text" 
                  name="address" 
                  className="form-control" 
                  placeholder="e.g. A-12, Sector 62"
                  value={propertyForm.address} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="col-md-2 col-4">
                <label className="form-label small fw-semibold text-secondary">City</label>
                <input 
                  type="text" 
                  name="city" 
                  className="form-control" 
                  value={propertyForm.city} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="col-md-2 col-4">
                <label className="form-label small fw-semibold text-secondary">State</label>
                <input 
                  type="text" 
                  name="state" 
                  className="form-control" 
                  value={propertyForm.state} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="col-md-2 col-4">
                <label className="form-label small fw-semibold text-secondary">Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  className="form-control" 
                  value={propertyForm.pincode} 
                  onChange={handleFormChange}
                  required 
                />
              </div>
            </div>

            {/* Amenities checklist */}
            <div>
              <label className="form-label small fw-semibold text-secondary mb-3 d-block">Select Key Amenities</label>
              <div className="row g-3">
                {amenitiesList.map((am) => (
                  <div key={am} className="col-md-3 col-6">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        id={`am-${am}`}
                        className="form-check-input" 
                        checked={propertyForm.amenities.includes(am)}
                        onChange={() => handleAmenityToggle(am)}
                      />
                      <label htmlFor={`am-${am}`} className="form-check-label text-secondary" style={{ cursor: 'pointer' }}>{am}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload section */}
            <div>
              <label className="form-label small fw-semibold text-secondary mb-2">Upload Property Images (Max 10)</label>
              <div 
                className="p-4 rounded-3 text-center cursor-pointer border-dashed border-2 bg-secondary-subtle" 
                onClick={() => multipleImagesInputRef.current.click()}
                style={{ cursor: 'pointer', border: '2px dashed var(--border-color)' }}
              >
                <Upload size={32} className="text-muted mb-2 mx-auto" />
                <h6 className="fw-semibold m-0 text-secondary">Click here to upload photos</h6>
                <small className="text-muted">Supports PNG, JPG, JPEG</small>
                <input 
                  type="file" 
                  ref={multipleImagesInputRef} 
                  onChange={handleMultipleImagesSelect} 
                  className="d-none" 
                  multiple 
                  accept="image/*"
                />
              </div>

              {/* Previews of newly uploaded images */}
              {imagePreviews.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold small text-secondary mb-2">New Images Uploading:</h6>
                  <div className="d-flex gap-2 overflow-x-auto pb-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="position-relative" style={{ width: '90px', height: '70px', flexShrink: 0 }}>
                        <img src={preview} alt={`Preview ${idx}`} className="rounded object-fit-cover w-100 h-100" />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveNewImage(idx)}
                          className="btn btn-danger p-0 rounded-circle position-absolute d-flex align-items-center justify-content-center shadow border-0"
                          style={{ top: '-5px', right: '-5px', width: '20px', height: '20px' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previews of existing images */}
              {existingImages.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold small text-secondary mb-2">Existing Listing Images (Keep / Remove):</h6>
                  <div className="d-flex gap-2 overflow-x-auto pb-2">
                    {existingImages.map((imgUrl, idx) => {
                      const url = imgUrl.startsWith('http') ? imgUrl : `/${imgUrl}`;
                      return (
                        <div key={idx} className="position-relative" style={{ width: '90px', height: '70px', flexShrink: 0 }}>
                          <img src={url} alt={`Existing ${idx}`} className="rounded object-fit-cover w-100 h-100" />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveExistingImage(imgUrl)}
                            className="btn btn-danger p-0 rounded-circle position-absolute d-flex align-items-center justify-content-center shadow border-0"
                            style={{ top: '-5px', right: '-5px', width: '20px', height: '20px' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-2 border-top pt-4" style={{ borderColor: 'var(--border-color)' }}>
              <button 
                type="submit" 
                className="btn btn-primary px-5 py-2.5 fw-bold"
                disabled={formLoading}
              >
                {formLoading ? 'Submitting listing...' : editingPropertyId ? 'Save Changes' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings View */}
      {activeTab === 'bookings' && (
        <div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Booking / Visit Requests</h3>
          <p className="text-secondary small mb-4">Review, approve, or reject visit requests scheduled by tenants.</p>

          {bookingsLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5 card glass-card border-0">
              <p className="text-secondary m-0">No booking requests submitted for your listings yet.</p>
            </div>
          ) : (
            <div className="row g-4">
              {bookings.map((booking) => {
                const property = booking.propertyId;
                const tenant = booking.tenantId;
                if (!property || !tenant) return null;
                const img = property.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
                const imgUrl = img.startsWith('http') ? img : `/${img}`;

                return (
                  <div key={booking._id} className="col-12">
                    <div className="card p-3 border-0 shadow-sm bg-surface d-flex flex-md-row align-items-md-center gap-3">
                      <img src={imgUrl} alt={property.title} className="rounded object-fit-cover" style={{ width: '100px', height: '90px', flexShrink: 0 }} />
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-start gap-1 flex-wrap">
                          <h6 className="fw-bold text-truncate mb-1">
                            <Link to={`/properties/${property._id}`} className="text-decoration-none text-dark">{property.title}</Link>
                          </h6>
                          <span className={`badge ${booking.status === 'approved' ? 'bg-success' : booking.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'} text-capitalize`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-secondary small mb-2 text-truncate">
                          Tenant: <strong>{tenant.name}</strong> | Email: {tenant.email} | Phone: {tenant.phone}
                        </p>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                          <span className="small text-secondary fw-semibold">Visit Schedule Date: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                          {booking.status === 'pending' && (
                            <div className="d-flex gap-2">
                              <button onClick={() => handleBookingAction(booking._id, 'approved')} className="btn btn-success btn-sm d-flex align-items-center gap-0.5 px-3">
                                <Check size={14} /> Approve
                              </button>
                              <button onClick={() => handleBookingAction(booking._id, 'rejected')} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-0.5 px-3">
                                <X size={14} /> Reject
                              </button>
                            </div>
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

      {/* Inquiries Inbox View */}
      {activeTab === 'inquiries' && (
        <div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Tenant Inquiries Inbox</h3>
          <p className="text-secondary small mb-4">View and respond to direct queries sent by tenants regarding your listings.</p>

          {inquiriesLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-5 card glass-card border-0">
              <p className="text-secondary m-0">No inquiries found in your inbox.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {inquiries.map((inq) => {
                const property = inq.propertyId;
                const tenant = inq.tenantId;
                if (!property || !tenant) return null;
                return (
                  <div key={inq._id} className="card p-4 border-0 shadow-sm bg-surface">
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div>
                        <span className="small text-secondary fw-medium">Message Regarding:</span>
                        <h6 className="fw-bold mb-0">
                          <Link to={`/properties/${property._id}`} className="text-decoration-none text-dark">{property.title}</Link>
                        </h6>
                      </div>
                      <span className="small text-muted">{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-light-subtle p-3 rounded-3 my-3 border border-light-subtle" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <p className="text-secondary m-0" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>"{inq.message}"</p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top" style={{ borderColor: 'var(--border-color)', fontSize: '0.85rem' }}>
                      <div className="d-flex align-items-center gap-2 text-secondary flex-wrap">
                        <span className="fw-bold text-dark d-flex align-items-center gap-0.5"><User size={14} /> {tenant.name}</span>
                        <span>|</span>
                        <a href={`mailto:${tenant.email}`} className="text-decoration-none d-flex align-items-center gap-0.5 text-secondary"><Mail size={14} /> {tenant.email}</a>
                        <span>|</span>
                        <a href={`tel:${tenant.phone}`} className="text-decoration-none d-flex align-items-center gap-0.5 text-secondary"><Phone size={14} /> {tenant.phone}</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="row g-4">
          <div className="col-12 mb-2">
            <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Owner Profile settings</h3>
            <p className="text-secondary small">Update name, phone number, and avatar image.</p>
          </div>

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
    </DashboardLayout>
  );
};

export default OwnerDashboard;
