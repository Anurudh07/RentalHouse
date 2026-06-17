import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProperties } from '../../context/PropertyContext';
import { Sun, Moon, Home, Layers, Heart, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { compareList } = useProperties();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/tenant/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top glass-navbar py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            RH
          </div>
          <span>Rental<span style={{ color: 'var(--primary)' }}>House</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler border-0 text-primary" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Collapsible Content */}
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-3 mt-3 mt-lg-0">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-1 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`} to="/" onClick={() => setIsOpen(false)}>
                <Home size={18} /> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-1 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`} to="/properties" onClick={() => setIsOpen(false)}>
                <Layers size={18} /> Properties
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-1 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`} to="/compare" onClick={() => setIsOpen(false)}>
                Compare
                {compareList.length > 0 && (
                  <span className="badge rounded-pill bg-primary ms-1">{compareList.length}</span>
                )}
              </NavLink>
            </li>
          </ul>

          {/* Right Controls */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0 flex-wrap">
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-link p-2 rounded-circle hover-scale text-secondary" 
              onClick={toggleTheme}
              style={{ color: 'var(--text-secondary)' }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-warning" /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 border-0 bg-transparent text-primary" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage.startsWith('http') ? user.profileImage : `/${user.profileImage}`} 
                      alt={user.name} 
                      className="rounded-circle object-fit-cover" 
                      style={{ width: '30px', height: '30px' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '30px', height: '30px', fontSize: '0.9rem' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="d-none d-sm-inline fw-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                </button>
                
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 mt-2 bg-surface glass-card" aria-labelledby="userDropdown">
                  <li>
                    <div className="dropdown-header px-3 py-2">
                      <span className="d-block fw-bold text-primary">{user.name}</span>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px' }}>{user.email}</small>
                      <span className="badge bg-secondary text-capitalize mt-1">{user.role}</span>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border-color)' }} /></li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" to={getDashboardPath()}>
                      <Layers size={16} /> Dashboard
                    </Link>
                  </li>
                  {user.role === 'tenant' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" to="/tenant/dashboard?tab=wishlist">
                        <Heart size={16} /> Wishlist
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border-color)' }} /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 rounded text-danger" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-link text-decoration-none fw-semibold" to="/login" style={{ color: 'var(--text-primary)' }}>
                  Login
                </Link>
                <Link className="btn btn-primary shadow-sm" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
