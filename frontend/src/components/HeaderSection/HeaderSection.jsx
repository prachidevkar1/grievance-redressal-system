import React from 'react';
import { Link } from 'react-router-dom';
import './HeaderSection.css';
import heroImage from '../../assets/image5.jpg';

const HeaderSection = () => {
  return (
    <div className="image-container" id="home">
      <img src={heroImage} alt="Grievance System" />
      <div className="content">
        <h1>Grievance Redressal System</h1>
        <Link to="/register" className="btn">Register Grievance</Link>
      </div>
    </div>
  );
};

export default HeaderSection;