import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import YogaLoader from '../components/YogaLoader';
import { useYogaLoader } from '../hooks/useYogaLoader';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { isLoading, showLoader, hideLoader } = useYogaLoader();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      showLoader(isLogin ? 'Signing you in...' : 'Creating your account...');
      
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, name);
      }

      hideLoader();

      if (success) {
        showLoader('Welcome! Preparing your dashboard...', 1500);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Registration failed');
      }
    } catch (err) {
      hideLoader();
      setError('An error occurred. Please try again.');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@yoga.com');
    setPassword('demo123');
  };

  return (
    <>
      {isLoading && (
        <YogaLoader 
          message="Finding your zen..." 
          type="breathing" 
          size="medium" 
        />
      )}
      <div className="login-page">
        <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to continue your yoga journey' : 'Start your wellness journey today'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="btn btn-outline btn-full"
              >
                Try Demo Account
              </button>
            )}
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="link-button"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="demo-info">
            <h3>Demo Account</h3>
            <p>Email: demo@yoga.com</p>
            <p>Password: demo123</p>
          </div>
        </div>

        <div className="login-image">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=800&fit=crop" 
            alt="Yoga practice"
          />
        </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;