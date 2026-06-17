import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const { login, error, setError, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      const redirectPath = location.state?.from?.pathname || getDashboardPath(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user]);

  // Clean errors on mount
  useEffect(() => {
    setError(null);
  }, []);

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'owner') return '/owner/dashboard';
    return '/tenant/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      const redirectPath = location.state?.from?.pathname || getDashboardPath(result.user.role);
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8 col-sm-10">
          <div className="card p-4 p-md-5 border-0 shadow-lg glass-card rounded-4">
            {/* Header branding */}
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-3 rounded-4 d-inline-flex mb-3 hover-scale shadow">
                <LogIn size={28} />
              </div>
              <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Welcome Back</h2>
              <p className="text-secondary small">Log in to manage listings, bookings, and wishlists.</p>
            </div>

            {/* Error alerts */}
            {formError && <div className="alert alert-danger small py-2">{formError}</div>}
            {error && <div className="alert alert-danger small py-2">{error}</div>}
            {location.search.includes('expired=true') && (
              <div className="alert alert-warning small py-2">Your session has expired. Please log in again.</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <Mail size={18} className="text-muted" />
                  </span>
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="form-control border-start-0" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary m-0">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} className="text-decoration-none fw-medium text-primary">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <Lock size={18} className="text-muted" />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter password" 
                    className="form-control border-start-0 border-end-0" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="btn border-start-0 border-secondary-subtle bg-transparent text-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ border: '1px solid var(--border-color)', borderLeft: 'none' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary py-2.5 w-100 fw-bold mt-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="m-0 text-secondary small">
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none fw-bold text-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
