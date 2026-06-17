import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Layers, 
  Heart, 
  Star, 
  BarChart3, 
  Mail, 
  PlusCircle, 
  Users, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X,
  Building
} from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  // Sidebar Links based on User Role
  const tenantLinks = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'bookings', label: 'My Bookings', icon: <Layers size={18} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> }
  ];

  const ownerLinks = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'listings', label: 'My Listings', icon: <Building size={18} /> },
    { id: 'add-property', label: 'Add Property', icon: <PlusCircle size={18} /> },
    { id: 'inquiries', label: 'Inquiries', icon: <Mail size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  const adminLinks = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Manage Users', icon: <Users size={18} /> },
    { id: 'listings', label: 'Manage Listings', icon: <Building size={18} /> },
    { id: 'approvals', label: 'Approve Listings', icon: <CheckSquare size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  const getLinks = () => {
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'owner') return ownerLinks;
    return tenantLinks;
  };

  const links = getLinks();

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Mobile Menu Bar */}
        <div className="col-12 bg-surface d-lg-none d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <span className="fw-bold fs-5 text-capitalize">{user.role} Dashboard</span>
          <button 
            className="btn btn-outline-primary p-2 border-0 bg-transparent" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar Nav */}
        <div className={`col-lg-3 col-xl-2 sidebar d-lg-block ${sidebarOpen ? 'd-block position-fixed w-75 h-100' : 'd-none'}`} style={{ zIndex: 1000, background: 'var(--surface)' }}>
          <div className="d-flex flex-column h-100 py-4 justify-content-between">
            <div>
              {/* Header Info */}
              <div className="px-4 mb-4">
                <h5 className="fw-bold mb-1 text-primary text-capitalize" style={{ fontFamily: 'var(--font-heading)' }}>
                  {user.role} Console
                </h5>
                <p className="text-secondary small text-truncate m-0">{user.email}</p>
              </div>

              {/* Navigation Items */}
              <div className="d-flex flex-column nav-pills mt-3">
                {links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setSidebarOpen(false);
                    }}
                    className={`btn text-start sidebar-link border-0 ${activeTab === link.id ? 'active' : ''}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Footer */}
            <div className="border-top pt-3 px-3 mx-2" style={{ borderColor: 'var(--border-color)' }}>
              <button 
                onClick={handleLogout} 
                className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-2 sidebar-link w-100 hover-scale bg-transparent"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="col-lg-9 col-xl-10 p-4 p-md-5 bg-secondary-subtle" style={{ minHeight: '90vh' }}>
          {/* Main content slot */}
          <div className="animate-slide-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
