import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Mountain, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import qrCard from '../../assets/qr-card.png';
import '../../styles/pages/Auth.css';

const RecoverPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-main">
        <Link to="/" className="auth-logo">
          <Mountain size={28} color="var(--active-accent)" />
          <span>Clamber</span>
        </Link>
        
        <div className="auth-content" style={{ marginTop: '40px' }}>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">Enter your email below, you will receive an email with password reset link.</p>

          {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: '16px' }} />
              <h2 style={{ color: '#10b981', marginBottom: '8px' }}>Link Sent!</h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>Check your email for the password reset link.</p>
              <Link to="/login" className="btn-auth-continue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRecover}>
              <div className="form-group">
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    className="auth-input" 
                    placeholder="Email Address" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-continue" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/login" className="auth-link-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888' }}>
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        </div>
      </div>
      
      <div className="auth-sidebar" style={{ backgroundColor: '#fcfdfe', backgroundImage: 'none' }}>
        <div className="qr-card-wrapper">
          <img src={qrCard} alt="QR Login" className="qr-img" />
          <div className="qr-title">Login With QR code</div>
          <div className="qr-subtitle">Scan QR code with <span style={{ color: 'var(--active-accent)', fontWeight: '600' }}>app</span></div>
        </div>
      </div>
    </div>
  );
};

export default RecoverPage;
