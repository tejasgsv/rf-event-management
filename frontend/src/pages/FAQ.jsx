import React, { useState } from 'react';
import '../styles/FAQ.css';

/**
 * Professional FAQ Page
 */
const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'Creating an account is simple! Click on the "Sign Up" button, provide your email, create a password, and verify your email address. You\'ll be ready to use EventHub in seconds.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'Is EventHub free to use?',
      answer: 'EventHub offers a free tier with basic features for event attendees. Organizers can upgrade to premium plans for advanced features like analytics, custom branding, and priority support.'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'How do I find events?',
      answer: 'Browse our Events page to see all available events. You can filter by date, category, location, and type. Use the search bar to find specific events or organizers.'
    },
    {
      id: 4,
      category: 'Registration',
      question: 'How do I register for an event?',
      answer: 'Visit the event details page and click the "Register Now" button. Fill in your information and complete the registration. You\'ll receive a confirmation email with a QR code.'
    },
    {
      id: 5,
      category: 'Registration',
      question: 'Can I register for multiple events?',
      answer: 'Yes! You can register for as many events as you want. Visit the "My Registrations" page to view all your registered events.'
    },
    {
      id: 6,
      category: 'Registration',
      question: 'How do I cancel my registration?',
      answer: 'Go to "My Registrations", find the event you want to cancel, and click the cancel button. Depending on the event\'s cancellation policy, you may be eligible for a refund.'
    },
    {
      id: 7,
      category: 'Events',
      question: 'Can I create my own event?',
      answer: 'Yes! Sign up as an organizer and use our event creation tools to set up your event. You\'ll get access to registration management, attendee analytics, and more.'
    },
    {
      id: 8,
      category: 'Events',
      question: 'How do I add speakers to my event?',
      answer: 'When creating an event, use the speakers section to add speaker details. You can upload speaker photos, bios, and social media links.'
    },
    {
      id: 9,
      category: 'Technical',
      question: 'What devices are supported?',
      answer: 'EventHub works on all modern devices including desktop, tablet, and mobile phones. We support all major browsers and have native mobile apps available.'
    },
    {
      id: 10,
      category: 'Technical',
      question: 'Is my data secure?',
      answer: 'Yes! We use enterprise-grade security with SSL encryption, secure data storage, and comply with all major data protection regulations including GDPR.'
    },
    {
      id: 11,
      category: 'Support',
      question: 'How do I contact support?',
      answer: 'You can contact our support team via email at support@eventhub.com, through our contact form, or use the live chat feature available on the website.'
    },
    {
      id: 12,
      category: 'Support',
      question: 'What are your business hours?',
      answer: 'Our support team is available Monday-Friday from 9 AM to 6 PM IST. For urgent issues, we offer 24/7 emergency support for premium users.'
    }
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFAQs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about EventHub</p>
      </section>

      {/* FAQ Content */}
      <section className="faq-content">
        <div className="container">
          {/* Category Filter */}
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="faq-list">
            {filteredFAQs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleItem(faq.id)}
                >
                  <span className="question-text">{faq.question}</span>
                  <span className="faq-icon">{openItems[faq.id] ? '−' : '+'}</span>
                </button>

                {openItems[faq.id] && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="contact-cta">
            <h3>Still have questions?</h3>
            <p>Can't find the answer you're looking for? Please contact our support team.</p>
            <div className="cta-buttons">
              <a href="mailto:support@eventhub.com" className="btn btn-primary">
                Contact Support
              </a>
              <a href="/contact" className="btn btn-secondary">
                Send a Message
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
