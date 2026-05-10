import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import qrCard from '../../assets/qr-card.png';
import '../../styles/pages/Auth.css';

const VerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('verify-email');
    if (!savedEmail) {
      navigate('/signup');
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyEmail({ email, code: fullCode });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      // In a real app, you'd have a resend endpoint. 
      // For now, we can just say it was resent if we're using Ethereal.
      alert('Verification code resent to ' + email);
    } catch (err: any) {
      setError('Failed to resend code');
    }
  };

  return (
    <div className="auth-layout force-default-theme">
      <div className="auth-main">
        <Link to="/" className="auth-logo">
          <Mountain size={28} color="var(--active-accent)" />
          <span>Clamber</span>
        </Link>
        
        <div className="auth-content" style={{ marginTop: '40px' }}>
          <h1 className="auth-title">Email Verification</h1>
          <p className="auth-subtitle">Please enter the 4-digit verification code that was sent to your email</p>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px' }}>Send Verification Code to :</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', border: '1px solid #edf2f7' }}>
              <span>{email}</span>
              <Edit2 size={14} onClick={() => navigate('/signup')} style={{ color: '#aaa', cursor: 'pointer', marginLeft: 'auto' }} />
            </div>
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: '16px' }} />
              <h2 style={{ color: '#10b981', marginBottom: '8px' }}>Verified!</h2>
              <p style={{ color: '#666' }}>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="verification-grid">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`digit-${index}`}
                    type="text"
                    maxLength={1}
                    className="digit-box"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    required
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Didn't receive the code?</div>
                <button 
                  type="button" 
                  onClick={handleResend}
                  style={{ background: 'none', border: 'none', color: 'var(--active-accent)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Resend Code
                </button>
              </div>

              <button type="submit" className="btn-auth-continue" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : 'Continue'}
              </button>
            </form>
          )}
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

export default VerifyPage;
