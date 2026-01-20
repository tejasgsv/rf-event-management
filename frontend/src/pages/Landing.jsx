import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to EventHub</h1>
          <p className="hero-subtitle">
            Professional Event Management Made Simple
          </p>
          
          <div className="hero-cta">
            <Link to="/events" className="btn btn-primary">
              Explore Events
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose EventHub?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Easy Registration</h3>
              <p>Register for events in seconds</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Track attendance and engagement</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure & Reliable</h3>
              <p>Enterprise-grade security</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
