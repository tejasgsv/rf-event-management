import React, { useState } from 'react';
import { isValidEmail, isValidName } from '../utils/validationUtils';
import '../styles/Contact.css';

/**
 * Professional Contact Page
 */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidName(formData.name)) {
      setError('Please enter a valid name (letters and spaces only).');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      setError('Please enter a subject (min 3 characters).');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setError('Please enter a message (min 10 characters).');
      return;
    }

    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Send us a message!</p>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send us a Message</h2>
              
              {submitted && (
                <div className="success-message">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <h2>Contact Information</h2>

              <div className="info-box">
                <div className="info-icon">📧</div>
                <h4>Email</h4>
                <p><a href="mailto:support@eventhub.com">support@eventhub.com</a></p>
                <p><a href="mailto:info@eventhub.com">info@eventhub.com</a></p>
              </div>

              <div className="info-box">
                <div className="info-icon">📞</div>
                <h4>Phone</h4>
                <p><a href="tel:+91-9876543210">+91-9876-543-210</a></p>
                <p><a href="tel:+91-8765432109">+91-8765-432-109</a></p>
              </div>

              <div className="info-box">
                <div className="info-icon">📍</div>
                <h4>Address</h4>
                <p>EventHub Corporate Office</p>
                <p>123 Business District<br/>Mumbai, India 400001</p>
              </div>

              <div className="info-box">
                <div className="info-icon">🕐</div>
                <h4>Business Hours</h4>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>

              <div className="social-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="#facebook" className="social-icon">f</a>
                  <a href="#twitter" className="social-icon">𝕏</a>
                  <a href="#linkedin" className="social-icon">in</a>
                  <a href="#instagram" className="social-icon">📷</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
