import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import API from '../../api/axiosConfig';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  Building, 
  CheckSquare, 
  ShieldAlert, 
  Trash2, 
  Ban, 
  Check, 
  Activity, 
  DollarSign, 
  Camera, 
  Mail, 
  Phone 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef();

  const [activeTab, setActiveTab] = useState('analytics');

  // Admin Data states
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  const [propertiesList, setPropertiesList] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesSearch, setPropertiesSearch] = useState('');

  const [pendingList, setPendingList] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Profile Form state
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
    setProfileSuccess('');
    setProfileError('');
    
    if (activeTab === 'analytics') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'listings') {
      fetchProperties();
    } else if (activeTab === 'approvals') {
      fetchPendingProperties();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await API.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await API.get('/admin/users');
      if (response.data.success) {
        setUsersList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProperties = async () => {
    setPropertiesLoading(true);
    try {
      const response = await API.get('/admin/properties');
      if (response.data.success) {
        setPropertiesList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching properties list:', err);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchPendingProperties = async () => {
    setPendingLoading(true);
    try {
      const response = await API.get('/admin/properties');
      if (response.data.success) {
        const pending = response.data.data.filter(p => p.status === 'pending');
        setPendingList(pending);
      }
    } catch (err) {
      console.error('Error fetching pending properties:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  // Block/Unblock User toggle
  const handleToggleBlock = async (userToToggle) => {
    const action = userToToggle.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} user "${userToToggle.name}"?`)) return;

    try {
      const response = await API.put(`/admin/users/${userToToggle._id}/block`);
      if (response.data.success) {
        fetchUsers();
        alert(response.data.message || `User successfully ${action}ed.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update block state.');
    }
  };

  // Delete Listing
  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this listing? This action is irreversible.')) return;

    try {
      const response = await API.delete(`/properties/${id}`);
      if (response.data.success) {
        fetchProperties();
        alert('Listing deleted successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Approve Listing
  const handleApproveProperty = async (id) => {
    try {
      const response = await API.put(`/admin/properties/${id}/approve`);
      if (response.data.success) {
        fetchPendingProperties();
        alert('Property listing approved and published!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve listing.');
    }
  };

  // Profile Form submissions
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

  // Filtered lists based on search keys
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(usersSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(usersSearch.toLowerCase())
  );

  const filteredProperties = propertiesList.filter(p => 
    p.title.toLowerCase().includes(propertiesSearch.toLowerCase()) || 
    p.city.toLowerCase().includes(propertiesSearch.toLowerCase()) ||
    p.propertyType.toLowerCase().includes(propertiesSearch.toLowerCase())
  );

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <div className="row g-4">
          <div className="col-12">
            <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Platform Analytics</h3>
            <p className="text-secondary small">Comprehensive database statistics and user registration activity.</p>
          </div>

          {statsLoading || !stats ? (
            <div className="text-center py-5 col-12"><div className="spinner-border text-primary" role="status"></div></div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="col-lg-3 col-6">
                <div className="card p-3 p-md-4 border-0 shadow-sm bg-surface">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium">Total Users</span>
                      <h4 className="fw-bold m-0 mt-1">{stats.counts.users}</h4>
                      <small className="text-muted text-xs">{stats.counts.tenants} Tenants / {stats.counts.owners} Owners</small>
                    </div>
                    <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="card p-3 p-md-4 border-0 shadow-sm bg-surface">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium">Properties</span>
                      <h4 className="fw-bold m-0 mt-1">{stats.counts.properties}</h4>
                      <small className="text-muted text-xs">{stats.counts.availableProperties} Available / {stats.counts.pendingProperties} Pending</small>
                    </div>
                    <div className="bg-success-subtle text-success p-3 rounded-circle d-flex align-items-center justify-content-center">
                      <Building size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="card p-3 p-md-4 border-0 shadow-sm bg-surface">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium">Active Bookings</span>
                      <h4 className="fw-bold m-0 mt-1">{stats.counts.bookings}</h4>
                      <small className="text-muted text-xs">{stats.counts.approvedBookings} Approved / {stats.counts.pendingBookings} Pending</small>
                    </div>
                    <div className="bg-warning-subtle text-warning p-3 rounded-circle d-flex align-items-center justify-content-center">
                      <CheckSquare size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="card p-3 p-md-4 border-0 shadow-sm bg-surface">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-secondary small fw-medium">Monthly Rent Volume</span>
                      <h4 className="fw-bold m-0 mt-1 text-primary">₹{stats.counts.totalRentVolume.toLocaleString('en-IN')}</h4>
                      <small className="text-muted text-xs">Accumulated revenue</small>
                    </div>
                    <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                      <DollarSign size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recharts chart */}
              <div className="col-md-8 mt-4">
                <div className="card p-4 border-0 shadow-sm bg-surface">
                  <h5 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Monthly Property Additions</h5>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Bar dataKey="properties" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="col-md-4 mt-4">
                <div className="card p-4 border-0 shadow-sm bg-surface h-100 justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><Activity size={18} /> Admin Alert</h5>
                    <p className="text-secondary small" style={{ lineHeight: '1.6' }}>
                      There are currently <strong>{stats.counts.pendingProperties} pending listings</strong> awaiting approval. Keep the published listings directory clean by reviewing pending items.
                    </p>
                  </div>
                  {stats.counts.pendingProperties > 0 && (
                    <button onClick={() => setActiveTab('approvals')} className="btn btn-primary btn-sm w-100 mt-2 py-2">
                      Review Approvals Now
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Manage Platform Users</h3>
              <p className="text-secondary small m-0">Monitor registrations and moderate user block states.</p>
            </div>
            <input 
              type="text" 
              placeholder="Search by name, email, role..." 
              className="form-control form-control-sm w-auto"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
            />
          </div>

          {usersLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5 card glass-card border-0">
              <p className="text-secondary m-0">No users found matching keywords.</p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm bg-surface overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-center">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="text-start ps-4">User Details</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="pe-4">Moderation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td className="text-start ps-4">
                          <div className="d-flex align-items-center gap-3 py-1">
                            {u.profileImage ? (
                              <img src={u.profileImage.startsWith('http') ? u.profileImage : `/${u.profileImage}`} alt={u.name} className="rounded-circle object-fit-cover" style={{ width: '40px', height: '40px' }} />
                            ) : (
                              <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="fw-semibold">{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td className="text-capitalize">{u.role}</td>
                        <td>
                          <span className={`badge rounded-pill ${u.isBlocked ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="pe-4">
                          {u._id !== user._id ? (
                            <button 
                              onClick={() => handleToggleBlock(u)}
                              className={`btn btn-sm px-3 ${u.isBlocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                            >
                              {u.isBlocked ? 'Unblock' : 'Block User'}
                            </button>
                          ) : (
                            <span className="text-muted small">Current Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Listings Management Tab */}
      {activeTab === 'listings' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Manage Directory Listings</h3>
              <p className="text-secondary small m-0">Monitor and delete properties violating policies.</p>
            </div>
            <input 
              type="text" 
              placeholder="Search by title, city..." 
              className="form-control form-control-sm w-auto"
              value={propertiesSearch}
              onChange={(e) => setPropertiesSearch(e.target.value)}
            />
          </div>

          {propertiesLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-5 card glass-card border-0">
              <p className="text-secondary m-0">No listings found matching keywords.</p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm bg-surface overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-center">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="text-start ps-4">Property</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Location</th>
                      <th scope="col">Monthly Rent</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((prop) => {
                      const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
                      const imgUrl = img.startsWith('http') ? img : `/${img}`;
                      return (
                        <tr key={prop._id}>
                          <td className="text-start ps-4">
                            <div className="d-flex align-items-center gap-3 py-1">
                              <img src={imgUrl} alt={prop.title} className="rounded object-fit-cover" style={{ width: '50px', height: '40px' }} />
                              <div className="min-w-0" style={{ maxWidth: '200px' }}>
                                <h6 className="fw-bold text-truncate mb-0">
                                  <Link to={`/properties/${prop._id}`} className="text-decoration-none text-dark">{prop.title}</Link>
                                </h6>
                                <small className="text-muted text-capitalize">{prop.propertyType}</small>
                              </div>
                            </div>
                          </td>
                          <td className="small">{prop.ownerId?.name || 'Unknown'}</td>
                          <td>{prop.city}</td>
                          <td className="fw-bold">₹{prop.rent.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`badge rounded-pill text-capitalize ${prop.status === 'available' ? 'bg-success' : prop.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {prop.status}
                            </span>
                          </td>
                          <td className="pe-4">
                            <button 
                              onClick={() => handleDeleteProperty(prop._id)}
                              className="btn btn-outline-danger btn-sm p-1.5 rounded-circle hover-scale border-0"
                              title="Delete Listing"
                            >
                              <Trash2 size={16} />
                            </button>
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

      {/* Pending Approvals Tab */}
      {activeTab === 'approvals' && (
        <div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Pending Properties Approvals</h3>
          <p className="text-secondary small mb-4">Verify specifications and publish newly added owner listings.</p>

          {pendingLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : pendingList.length === 0 ? (
            <div className="text-center py-5 card glass-card border-0">
              <p className="text-secondary m-0">No property listings are currently pending approval.</p>
            </div>
          ) : (
            <div className="row g-4">
              {pendingList.map((prop) => {
                const img = prop.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=85';
                const imgUrl = img.startsWith('http') ? img : `/${img}`;
                return (
                  <div key={prop._id} className="col-12">
                    <div className="card p-3 border-0 shadow-sm bg-surface d-flex flex-md-row align-items-md-center gap-3">
                      <img src={imgUrl} alt={prop.title} className="rounded object-fit-cover flex-shrink-0" style={{ width: '120px', height: '100px' }} />
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-start gap-1 flex-wrap">
                          <h6 className="fw-bold mb-1 text-truncate">
                            <Link to={`/properties/${prop._id}`} className="text-decoration-none text-dark">{prop.title}</Link>
                          </h6>
                          <span className="badge bg-warning text-dark text-uppercase">Pending</span>
                        </div>
                        <p className="text-secondary small mb-2 text-truncate">
                          City: {prop.city} | Rent: ₹{prop.rent}/mo | Size: {prop.area} sqft | BHK: {prop.bedrooms}
                        </p>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                          <span className="small text-secondary">Owner: <strong>{prop.ownerId?.name || 'Owner'}</strong> ({prop.ownerId?.email})</span>
                          <div className="d-flex gap-2">
                            <Link to={`/properties/${prop._id}`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-0.5">
                              <Eye size={14} /> Review
                            </Link>
                            <button onClick={() => handleApproveProperty(prop._id)} className="btn btn-success btn-sm d-flex align-items-center gap-0.5 px-3">
                              <Check size={14} /> Approve
                            </button>
                          </div>
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

      {/* Profile settings tab */}
      {activeTab === 'profile' && (
        <div className="row g-4">
          <div className="col-12 mb-2">
            <h3 className="fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>Admin Profile settings</h3>
            <p className="text-secondary small">Update name, contact, and upload admin avatar.</p>
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

export default AdminDashboard;
