import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-5 mt-5" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
      <div className="container">
        <div className="row g-4">
          {/* Logo & Description */}
          <div className="col-lg-4 col-md-6">
            <Link className="d-flex align-items-center gap-2 fw-bold text-decoration-none mb-3" to="/" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
              <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                RH
              </div>
              <span>Rental<span style={{ color: 'var(--primary)' }}>House</span></span>
            </Link>
            <p className="mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Find, view, compare, and lease the most premium property listings matching your lifestyle. Seamless experience for Tenants, Landlords, and Admins.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="p-2 rounded-circle hover-scale" style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="p-2 rounded-circle hover-scale" style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="p-2 rounded-circle hover-scale" style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="p-2 rounded-circle hover-scale" style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-decoration-none hover-scale d-inline-block" style={{ color: 'var(--text-secondary)' }}>Home</Link></li>
              <li><Link to="/properties" className="text-decoration-none hover-scale d-inline-block" style={{ color: 'var(--text-secondary)' }}>Properties</Link></li>
              <li><Link to="/compare" className="text-decoration-none hover-scale d-inline-block" style={{ color: 'var(--text-secondary)' }}>Compare</Link></li>
              <li><Link to="/login" className="text-decoration-none hover-scale d-inline-block" style={{ color: 'var(--text-secondary)' }}>Login</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Contact Us</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0" style={{ fontSize: '0.95rem' }}>
              <li className="d-flex align-items-start gap-2">
                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                <span>100 Premium Plaza, Tech Hub, Sector 62, Noida, India</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span>support@rentalhouse.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Newsletter</h5>
            <p className="mb-3" style={{ fontSize: '0.9rem' }}>Subscribe to get notifications about new properties in your area.</p>
            <form className="d-flex flex-column gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="form-control form-control-sm" required />
              <button type="submit" className="btn btn-primary btn-sm w-100 mt-1">Subscribe</button>
            </form>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-center text-sm-start" style={{ fontSize: '0.9rem' }}>
          <p className="mb-0">&copy; {new Date().getFullYear()} RentalHouse. All rights reserved.</p>
          <p className="mb-0">Designed for modern urban renters and property owners.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
