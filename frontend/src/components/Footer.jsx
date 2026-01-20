import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {currentYear} EventHub - Professional Event Management</p>
      </div>
    </footer>
  );
};

export default Footer;
