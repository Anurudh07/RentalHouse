import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import API from '../api/axiosConfig';

const ResetPassword = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.put(`/auth/resetpassword/${resettoken}`, { password });
      if (response.data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
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
                <Lock size={28} />
              </div>
              <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Reset Password</h2>
              <p className="text-secondary small">Choose a strong new password for your RentalHouse account.</p>
            </div>

            {error && <div className="alert alert-danger small py-2">{error}</div>}
            {success && <div className="alert alert-success small py-2">{success}</div>}

            {!success && (
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-semibold text-secondary">New Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Min 6 characters" 
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

                <div>
                  <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Repeat password" 
                      className="form-control border-start-0" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary py-2.5 w-100 fw-bold mt-2"
                  disabled={loading}
                >
                  {loading ? 'Resetting password...' : 'Update Password'}
                </button>
              </form>
            )}

            {success && (
              <div className="text-center py-2">
                <CheckCircle size={40} className="text-success mb-2" />
                <Link to="/login" className="btn btn-outline-primary btn-sm mt-3 w-100">
                  Go to Login Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
