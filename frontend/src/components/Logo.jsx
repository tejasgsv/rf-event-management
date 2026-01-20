import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/rlogo.png';
import '../styles/Logo.css';

/**
 * Professional Logo Component
 * Displays company/event logo with text branding
 * Responsive on all devices
 */
const Logo = ({ eventName = 'Reliance Foundation Event' }) => {
  return (
    <Link to="/" className="logo-container">
      <div className="logo-wrapper">
        <img src={logoImage} alt="Reliance Foundation Event Logo" className="logo-image" />
        <div className="logo-text">
          <h1 className="logo-title">Reliance Foundation Event</h1>
          <p className="logo-subtitle">Reliance foundation event</p>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
