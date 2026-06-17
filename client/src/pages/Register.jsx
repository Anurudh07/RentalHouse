import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register, error, setError, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' // 'tenant' | 'owner'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
    }
  }, [user]);

  // Clean errors on mount
  useEffect(() => {
    setError(null);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    const { name, email, phone, password, confirmPassword, role } = formData;

    if (!name || !email || !phone || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, phone, password, role });
    setLoading(false);

    if (result.success) {
      navigate(role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
    }
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card p-4 p-md-5 border-0 shadow-lg glass-card rounded-4">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-3 rounded-4 d-inline-flex mb-3 hover-scale shadow">
                <UserPlus size={28} />
              </div>
              <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Create Account</h2>
              <p className="text-secondary small">Join RentalHouse to find or list rental properties.</p>
            </div>

            {/* Error messaging */}
            {formError && <div className="alert alert-danger small py-2">{formError}</div>}
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {/* Role Selection Tabs */}
              <div>
                <label className="form-label small fw-semibold text-secondary d-block text-center mb-2">Register As</label>
                <div className="d-flex p-1 rounded-3 bg-secondary-subtle" style={{ border: '1px solid var(--border-color)' }}>
                  <button 
                    type="button" 
                    onClick={() => handleRoleChange('tenant')}
                    className={`btn flex-grow-1 py-2 fw-semibold rounded-2 transition-all border-0 ${formData.role === 'tenant' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                  >
                    Tenant (Renter)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRoleChange('owner')}
                    className={`btn flex-grow-1 py-2 fw-semibold rounded-2 transition-all border-0 ${formData.role === 'owner' ? 'btn-primary shadow' : 'bg-transparent text-secondary'}`}
                  >
                    Owner (Landlord)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <User size={18} className="text-muted" />
                  </span>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Enter full name" 
                    className="form-control border-start-0" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <Mail size={18} className="text-muted" />
                  </span>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="name@example.com" 
                    className="form-control border-start-0" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <Phone size={18} className="text-muted" />
                  </span>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="10-digit mobile number" 
                    className="form-control border-start-0" 
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password"
                      placeholder="Min 6 chars" 
                      className="form-control border-start-0 border-end-0" 
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn border-start-0 border-secondary-subtle bg-transparent text-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: '1px solid var(--border-color)', borderLeft: 'none' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      name="confirmPassword"
                      placeholder="Repeat password" 
                      className="form-control border-start-0" 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary py-2.5 w-100 fw-bold mt-3 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="m-0 text-secondary small">
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none fw-bold text-primary">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
