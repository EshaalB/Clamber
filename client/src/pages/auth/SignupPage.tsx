/* SignupPage.tsx: Manages new user registration and account creation. */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Mountain, Tag, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/authApi';
import '../../styles/pages/Auth.css';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register({ name, email, password, referralCode });
      // Store email for verify page
      sessionStorage.setItem('verify-email', email);
      navigate('/verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout force-default-theme">
      <div className="auth-main">
        <Link to="/" className="btn-back-landing">
          <ArrowLeft size={16} /> Back to Landing
        </Link>

        <Link to="/" className="auth-logo">
          <Mountain size={28} color="var(--active-accent)" />
          <span>Clamber</span>
        </Link>
        
        <div className="auth-content">
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Setting up an account takes less than one minute.</p>

          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Login</Link>
            <Link to="/signup" className="auth-tab active">SignUp</Link>
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input type="text" className="auth-input" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input type="email" className="auth-input" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input type="password" className="auth-input" placeholder="Password (min 6 characters)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Tag size={18} className="input-icon" />
                <input type="text" className="auth-input" placeholder="Referral code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-auth-continue" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-social-section">
            <div className="social-divider">Or Continue with</div>
            <div className="social-btns">
              <button className="social-btn" title="Google" type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'https://clamber-uh2nq.sevalla.app/api/v1'}/auth/google`}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
            
            <div style={{ marginTop: '24px', fontSize: '11px', color: '#999', lineHeight: '1.5' }}>
              By signing up, you agree to our <Link to="/terms" className="auth-link-sm" style={{ fontSize: '11px' }}>Terms of Service</Link> and <Link to="/privacy" className="auth-link-sm" style={{ fontSize: '11px' }}>Privacy Policy</Link>
            </div>

            <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
              Already have an account? <Link to="/login" className="auth-link-sm" style={{ fontSize: '13px' }}>Login</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-sidebar">
        <div className="auth-sidebar-overlay"></div>
      </div>
    </div>
  );
};

export default SignupPage;
