import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroSlider.css';

/**
 * HeroSlider Component
 * Auto-rotating banner for event highlights
 */
const HeroSlider = ({ events = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length]);

  if (!events || events.length === 0) {
    return null;
  }

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
    setIsAutoPlaying(false);
  };

  const currentEvent = events[currentSlide];

  return (
    <div className="hero-slider">
      <div className="slider-wrapper">
        {/* Main Slide */}
        <div className="slide active">
          <div className="slide-background">
            <div className="gradient-overlay"></div>
          </div>
          
          <div className="slide-content">
            <div className="slide-badge">
              {currentEvent.status === 'ACTIVE' ? '🔥 Live Event' : '📅 Upcoming'}
            </div>
            
            <h1 className="slide-title">{currentEvent.name || currentEvent.eventtitle}</h1>
            
            <div className="slide-meta">
              <span className="meta-item">
                📅 {new Date(currentEvent.start_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="meta-divider">•</span>
              <span className="meta-item">📍 {currentEvent.venue}</span>
              {currentEvent.total_seats && (
                <>
                  <span className="meta-divider">•</span>
                  <span className="meta-item">🎟️ {currentEvent.total_seats} Seats</span>
                </>
              )}
            </div>

            {currentEvent.description && (
              <p className="slide-description">{currentEvent.description}</p>
            )}

            <div className="slide-actions">
              <Link to={`/agenda/${currentEvent.id}`} className="btn-slide-primary">
                View Masterclasses
              </Link>
              <Link to={`/event/${currentEvent.id}`} className="btn-slide-secondary">
                Event Details
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {events.length > 1 && (
          <>
            <button className="slider-nav prev" onClick={prevSlide} aria-label="Previous slide">
              ‹
            </button>
            <button className="slider-nav next" onClick={nextSlide} aria-label="Next slide">
              ›
            </button>

            {/* Dots Indicator */}
            <div className="slider-dots">
              {events.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
