import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Loader2 } from 'lucide-react';

const OAuthSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userStr = searchParams.get('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth(user, accessToken, refreshToken);
        
        if (!user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to parse user data from OAuth redirect', err);
        navigate('/login?error=oauth_failed');
      }
    } else {
      navigate('/login?error=oauth_missing_tokens');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-alabaster)' }}>
      <Loader2 className="spin" size={48} color="var(--active-accent)" />
      <p style={{ marginTop: '16px', color: 'var(--color-dove-gray)', fontWeight: 500 }}>Completing secure sign in...</p>
    </div>
  );
};

export default OAuthSuccessPage;
