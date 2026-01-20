import React from 'react';
import '../styles/About.css';

/**
 * Professional About Page
 */
const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>About EventHub</h1>
        <p>Building the future of event management</p>
      </section>

      {/* About Content */}
      <section className="about-content">
        <div className="container">
          {/* Mission & Vision */}
          <div className="mission-vision">
            <div className="mission-box">
              <div className="icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To revolutionize event management by providing a seamless, user-friendly 
                platform that connects organizers with attendees and enables meaningful 
                professional interactions.
              </p>
            </div>

            <div className="vision-box">
              <div className="icon">🚀</div>
              <h3>Our Vision</h3>
              <p>
                To become the global leader in event management technology, empowering 
                organizations to create exceptional experiences and build lasting connections.
              </p>
            </div>
          </div>

          {/* Story */}
          <section className="our-story">
            <h2>Our Story</h2>
            <p>
              Founded in 2020, EventHub started with a simple vision: to make event management 
              accessible to everyone. What began as a small team's passion project has grown 
              into a comprehensive platform used by thousands of organizations worldwide.
            </p>
            <p>
              We believe that great events bring people together, foster innovation, and create 
              lasting memories. Our mission is to make organizing and attending events easier 
              than ever before.
            </p>
          </section>

          {/* Values */}
          <section className="values">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">💡</div>
                <h4>Innovation</h4>
                <p>We constantly innovate to provide cutting-edge solutions</p>
              </div>

              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h4>Collaboration</h4>
                <p>We believe in working together to achieve shared goals</p>
              </div>

              <div className="value-card">
                <div className="value-icon">✅</div>
                <h4>Excellence</h4>
                <p>We strive for excellence in everything we do</p>
              </div>

              <div className="value-card">
                <div className="value-icon">🌍</div>
                <h4>Global</h4>
                <p>We serve a global community with diverse needs</p>
              </div>

              <div className="value-card">
                <div className="value-icon">🛡️</div>
                <h4>Trust</h4>
                <p>We earn trust through transparency and reliability</p>
              </div>

              <div className="value-card">
                <div className="value-icon">♻️</div>
                <h4>Sustainability</h4>
                <p>We're committed to sustainable and eco-friendly practices</p>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="team">
            <h2>Our Team</h2>
            <p className="team-intro">
              We're a dedicated team of professionals passionate about events and technology
            </p>
            
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Sarah Johnson</h4>
                <p>Chief Executive Officer</p>
                <span>10+ years in event management</span>
              </div>

              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Raj Patel</h4>
                <p>Chief Technology Officer</p>
                <span>8+ years in software development</span>
              </div>

              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Emma Davis</h4>
                <p>Head of Product</p>
                <span>7+ years in product management</span>
              </div>

              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Michael Chen</h4>
                <p>Head of Design</p>
                <span>9+ years in UX/UI design</span>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="stats">
            <h2>By The Numbers</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Events Organized</span>
              </div>

              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Active Users</span>
              </div>

              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Partner Organizations</span>
              </div>

              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default About;
