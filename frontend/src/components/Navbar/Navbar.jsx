import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import logoImage from '../../assets/logo.png'; // Make sure to have logo.jpg in your src folder
import './Navbar.css';

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleNav = () => {
    setIsActive(!isActive);
  };

  const handleNavigation = (id) => {
    setIsActive(false);
    
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="container-fluid">
        <Link 
          className="navbar-brand" 
          to="/"
          onClick={() => handleNavigation('home')}
        >
          <img src={logoImage} alt="SKN Sinhgad Logo" className="navbar-logo" />
          <span className="college-name">SKN Sinhgad College of Engineering, Pandharpur</span>
        </Link>
        
        <button className="navbar-toggler" onClick={toggleNav}>
          <FaBars />
        </button>
        
        <ul className={`navbar-nav ${isActive ? 'active' : ''}`}>
          <li className="nav-item">
            <a 
              className="nav-link" 
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('home');
              }}
            >
              Home
            </a>
          </li>
          
          <li className="nav-item">
            <a 
              className="nav-link" 
              href="#about1"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('about1');
              }}
            >
              About Us
            </a>
          </li>
          
          <li className="nav-item">
            <a 
              className="nav-link" 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('contact');
              }}
            >
              Contact Us
            </a>
          </li>
          
          <li className="nav-item">
            <Link className="nav-link" to="/Register">Register Grievance</Link>
          </li>
          
          <li className="nav-item">
            <Link className="nav-link" to="/Login">Login</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;