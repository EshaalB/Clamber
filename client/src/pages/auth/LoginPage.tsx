/* LoginPage.tsx: Handles user authentication and redirection. */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Mountain, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../hooks/useAuthStore';
import '../../styles/pages/Auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login({ email, password });
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);

      if (!data.data.user.onboardingCompleted && data.data.user.role !== 'advisor') {
        navigate('/onboarding');
      } else if (data.data.user.role === 'advisor') {
        navigate('/advisor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your academic journey</p>

          <div className="auth-tabs">
            <Link to="/login" className="auth-tab active">Login</Link>
            <Link to="/signup" className="auth-tab">SignUp</Link>
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input type="email" className="auth-input" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input type="password" className="auth-input" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <Link to="/recover" className="auth-link-sm">Forgot password?</Link>
              </div>
            </div>

            <button type="submit" className="btn-auth-continue" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-social-section">
            <div className="social-divider">Or Continue with</div>
            <div className="social-btns">
              <button className="social-btn" title="Google" type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
            
            <div style={{ marginTop: '32px', fontSize: '13px', color: '#666' }}>
              Don't have an account? <Link to="/signup" className="auth-link-sm" style={{ fontSize: '13px' }}>Sign up</Link>
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

export default LoginPage;
