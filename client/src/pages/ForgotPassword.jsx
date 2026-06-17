import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import API from '../api/axiosConfig';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await API.post('/auth/forgotpassword', { email });
      if (response.data.success) {
        setSuccess('Password reset instructions have been sent to your email.');
        setEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to trigger password recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8 col-sm-10">
          <div className="card p-4 p-md-5 border-0 shadow-lg glass-card rounded-4">
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-3 rounded-4 d-inline-flex mb-3 hover-scale shadow">
                <Key size={28} />
              </div>
              <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Forgot Password?</h2>
              <p className="text-secondary small">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            {error && <div className="alert alert-danger small py-2">{error}</div>}
            {success && <div className="alert alert-success small py-2">{success}</div>}

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

              <button 
                type="submit" 
                className="btn btn-primary py-2.5 w-100 fw-bold mt-2"
                disabled={loading}
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
              <Link to="/login" className="text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1 text-secondary hover-scale">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
