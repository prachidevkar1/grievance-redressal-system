import React from 'react';
import { FaFacebook, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';
import './ContactSection.css';

const ContactSection = () => {
  return (
    <div className="contact" id="contact">
      <h4>Contact Us</h4>
      <div className="icon-container">
        <FaFacebook id="icon1" />
        <FaWhatsapp id="icon2" />
      </div>
      <label>Gat No.664, SKN Sinhgad College Of Engineering A/P Korti, Pandharpur, Dist: Solapur [413304]</label>
      <div className="phone">
        <label><FaPhone /> Phone: 02186-250146</label>
      </div>
      <label id="email"><FaEnvelope /> Email: <span>administrator@sknscoe.ac.in</span></label>
      <p>Copyright @ 2020 SKN Sinhgad College Of Engg, Pandharpur. All rights reserved.</p>
    </div>
  );
};

export default ContactSection;