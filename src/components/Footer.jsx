import React from 'react';
import { NavLink } from 'react-router-dom'; // To link to other pages
import logo from '../images/Nav-bar/logo.png'; // Replace with your footer logo

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className="h-14"
          />
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-12 mb-6">
          <a href="https://www.facebook.com/profile.php?id=100093074607226" className="text-[#fff] hover:text-[#FEAD5F]" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook-f text-2xl"></i>
          </a>
          <a href="https://twitter.com" className="text-[#fff] hover:text-[#FEAD5F]" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter text-2xl"></i>
          </a>
          <a href="https://linkedin.com" className="text-[#fff] hover:text-[#FEAD5F]" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in text-2xl"></i>
          </a>
          <a href="https://instagram.com" className="text-[#fff] hover:text-[#FEAD5F]" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram text-2xl"></i>
          </a>
        </div>

        {/* Footer Navigation */}
        
      </div>
    </footer>
  );
};

export default Footer;
