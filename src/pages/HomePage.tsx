import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered Yoga WebApp
          </h1>
          <p className="hero-description">
            Transform your practice with real-time pose detection, personalized guidance, 
            and intelligent feedback. Your journey to wellness starts here.
          </p>
          
          {user ? (
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
              </Link>
              <Link to="/library" className="btn btn-outline btn-large">
                Browse Library
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-large">
                Get Started
              </Link>
            </div>
          )}
        </div>
        
        <div className="hero-animation">
          <div className="surya-namaskar-container">
            <div className="sun-background"></div>
            <div className="yoga-figure">
              <div className="pose-sequence">
                <div className="pose single-pose">🧘‍♀️</div>
              </div>
            </div>
            <div className="sun-rays">
              <div className="ray ray-1"></div>
              <div className="ray ray-2"></div>
              <div className="ray ray-3"></div>
              <div className="ray ray-4"></div>
              <div className="ray ray-5"></div>
              <div className="ray ray-6"></div>
            </div>
            <div className="sequence-text">Meditation</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Pose Detection</h3>
              <p>Real-time pose analysis using advanced computer vision to provide instant feedback on your form.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your improvement with detailed analytics, session history, and personalized insights.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Sessions</h3>
              <p>Customized yoga routines based on your skill level, goals, and available time.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Gamification</h3>
              <p>Earn achievements, maintain streaks, and unlock new poses as you progress in your journey.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💚</div>
              <h3>Health Insights</h3>
              <p>Track calories burned, flexibility improvements, and overall wellness metrics.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Haptic Feedback</h3>
              <p>Get gentle vibration cues and audio feedback to help you maintain proper alignment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Yoga Practice?</h2>
            <p>Join thousands of users who have improved their flexibility, strength, and mindfulness with our AI-powered platform.</p>
            {!user && (
              <Link to="/login" className="btn btn-primary btn-large">
                Start Your Journey
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;