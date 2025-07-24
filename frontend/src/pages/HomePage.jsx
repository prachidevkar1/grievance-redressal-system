import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import HeaderSection from '../components/HeaderSection/HeaderSection';
import AboutSection from '../components/AboutSection/AboutSection';
import ContactSection from '../components/ContactSection/ContactSection';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main className="main-content">
        <HeaderSection />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default HomePage;