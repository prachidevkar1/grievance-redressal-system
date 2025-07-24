import React from 'react';
import './AboutSection.css';
import aboutImage from '../../assets/image6.webp';

const AboutSection = () => {
  return (
    <div className="about" id="about1">
      <div className="image-container1">
        <img src={aboutImage} alt="About Us" />
      </div>
      <div className="text-container">
        <h2 id='header'>About Us</h2>
        <p>
          The Grievance Management System at SKNSCOE, Korti provides a formalized platform for students and staff to
          report concerns, ensuring transparent and timely resolution. Our system facilitates efficient tracking of
          grievances while maintaining complete confidentiality throughout the process.
        </p>
        
        <div className="committee-section">
          <h3 className="committee-intro">Our dedicated Grievance Redressal Committee members:</h3>
          <div className="committee-grid">
            <div className="committee-column">
              <div className="member">Dr. S. G. Kulkarni</div>
              <div className="member">Dr. S. S. Kulkarni</div>
              <div className="member">Dr. S. S. Kadam</div>
              <div className="member">Dr. A. O. Mulani</div>
              <div className="member">Dr. B. B. Godbole</div>
              <div className="member">Prof. S. V. Pingale</div>
            </div>
            <div className="committee-column">
              <div className="member">Dr. S. D. Katekar</div>
              <div className="member">Prof. A. I. Nikam</div>
              <div className="member">Prof. V. P. More</div>
              <div className="member">Prof. A. A. Chandane</div>
              <div className="member">Prof. A. C. Pise</div>
              <div className="member">Prof. S. C. Mali</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;