import { useEffect, useState } from 'react';
import './AuthPage.css';

const API_URL = import.meta.env.VITE_API_URL;
console.log("what comes here ", API_URL);


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AuthPage = ({ setUser, setToken }) => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error("❌ Missing GOOGLE_CLIENT_ID. Check your .env file.");
      return;
    }
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'signin_with',
            shape: 'rectangular'
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log("And here", API_URL);
    try {

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();
      console.log("dekhte hai", data);

      if (res.ok) {
        setSuccess(data.message);
        setMode('verify');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Cannot connect to server.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        setToken(data.token);
        // Fetch user profile or set basic user data
        setUser(data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/verifyemail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Cannot connect to server.');
      console.error('Verify error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split">
        {/* Left side - Branding */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="brand-title">Gem-AI </h1>
            <p className="brand-subtitle">Intelligent conversations powered by AI </p>

            <div className="brand-features">
              <div className="brand-feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Natural language understanding</span>
              </div>
              <div className="brand-feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Context-aware responses</span>
              </div>
              <div className="brand-feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure & encrypted</span>
              </div>
              <div className="brand-feature">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span> Demo : 'Email':'gem12345@gmail.com' , 'Password':'gem12'</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            {/* Login Form */}
            {mode === 'login' && (
              <div className="auth-form">
                <h2 className="form-title">Sign in to your account</h2>
                <p className="form-subtitle">
                  Don't have an account?
                  <button className="link-button" onClick={() => setMode('signup')}>Sign Up</button>
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                <div className="divider">
                  <span>Or</span>
                </div>

                <div id="googleSignInButton"></div>
              </div>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <div className="auth-form">
                <h2 className="form-title">Create your account</h2>
                <p className="form-subtitle">
                  Already have an account?
                  <button className="link-button" onClick={() => setMode('login')}>Log In</button>
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSignup}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-email">Gmail Address</label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@gmail.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-password">Password</label>
                    <input
                      type="password"
                      id="signup-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min. 6 characters"
                      minLength="6"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>

                <div className="divider">
                  <span>Or sign up with</span>
                </div>

                <div id="googleSignInButton"></div>
              </div>
            )}

            {/* Email Verification Form */}
            {mode === 'verify' && (
              <div className="auth-form">
                <div className="verify-icon">
                  <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>

                <h2 className="form-title">Verify your email</h2>
                <p className="form-subtitle">
                  We sent a verification code to <strong>{formData.email}</strong>
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleVerifyEmail}>
                  <div className="form-group">
                    <label htmlFor="otp">Verification Code</label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>

                <button
                  className="link-button-center"
                  onClick={() => setMode('signup')}
                >
                  Back to Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
