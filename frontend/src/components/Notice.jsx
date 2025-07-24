import React, { useState, useRef, useEffect } from 'react';

import './Notice.css';
import logo from '../assets/logo.png';

export default function Notice() {
  const [type, setType] = useState('student');
const [data, setData] = useState({
  name: '',
  class: '',
  branch:'',
  mobile: '',
  subject: '',
  noticeDate: '',
  meetingDate: '',
  meetingAgenda: '',
  departmentInvolved: '',
  meetingTime: '',
});

useEffect(() => {
  if (type === 'committee') {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // "HH:MM"
    setData(prev => ({ ...prev, meetingTime: timeString }));
  }
}, [type]);

  

  const noticeRef = useRef();

  const handleChange = (e) => {
  setData({ ...data, [e.target.name]: e.target.value });
};
const isDateValid = (dateStr) => {
  const today = new Date();
  const inputDate = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= today;
};


 const handlePrint = () => {
  if (!isDateValid(data.noticeDate) || !isDateValid(data.meetingDate)) {
    alert("Notice Date and Meeting Date must not be in the past.");
    return;
  }

  const printContents = noticeRef.current.innerHTML;
  const originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
};


  return (
    <div className="notice-container">
      <h1 className="heading">Grievance Notice Generator</h1>

      {/* Type Selector */}
      <div className="notice-type-selector">
        <label>
          <input
            type="radio"
            value="student"
            checked={type === 'student'}
            onChange={() => setType('student')}
          />
          Student Notice
        </label>
        <label>
          <input
            type="radio"
            value="committee"
            checked={type === 'committee'}
            onChange={() => setType('committee')}
          />
          Committee Notice
        </label>
      </div>

      {/* Inputs */}
      <div className="form-grid">
        <input name="noticeDate" type="date" onChange={handleChange} required />
        <input name="meetingDate" type="date" onChange={handleChange} required />

        {type === 'student' && (
          <>
            <input name="name" placeholder="Student Name" onChange={handleChange} required />
            <input name="class" placeholder="Class" onChange={handleChange} required />
            <input name="branch" placeholder="branch" onChange={handleChange} required />

            <input name="mobile" placeholder="Mobile Number" type="tel" onChange={handleChange} required />
            <input name="subject" placeholder="Subject" onChange={handleChange} required />
          </>
        )}

        {type === 'committee' && (
          <>
            <input name="meetingAgenda" placeholder="Agenda of Meeting" onChange={handleChange} required />
            <input name="departmentInvolved" placeholder="Departments Involved (e.g., SY/TY Mech)" onChange={handleChange} required />
            <input name="meetingTime" type="time" onChange={handleChange} required />
          </>
        )}
      </div>
      

      <button onClick={handlePrint} className="print-button">Print Notice</button>

      {/* Notice Content */}
      <div ref={noticeRef} className="notice-content">
        {/* Header */}
        <div className="notice-header">
          <img src={logo} alt="College Logo" className="logo" />
          <div className="college-info">
            <h2>Savitribai Phule Shikshan Prasarak Mandal’s</h2>
            <h1>SKN SINHGAD COLLEGE OF ENGINEERING</h1>
            <p>(Approved by AICTE & Affiliated to PAH Solapur University, Solapur)</p>
            <p>A/p- Korti, Tal- Pandharpur, Pin- 413304, Dist.- Solapur.</p>
            <p>Phone: 02186-250146 | E-mail: principal@sknscoe.ac.in | Website: www.sknscoe.ac.in</p>
          </div>
        </div>

        <div className="notice-date">Date: {data.noticeDate || '//'}</div>
        <h2 className="notice-title">NOTICE</h2>

        {/* Student or Committee Body */}
        {type === 'student' ? (
          <>
            <p>To,</p>
            <p>Mr. {data.name || ''}</p>
            <p>Class: {data.class || ''}</p>
            <p>Mob. No.: {data.mobile || ''}</p>
            <br />
            <p><strong>Subject:</strong> {data.subject || 'Regarding appearance before Grievance Committee'}</p>
            <br />
            <p>
              As per the above subject, the Grievance Redressal Committee has received a complaint.
              You are hereby informed to be present with your parents on <strong>{data.meetingDate || '//'}</strong> 
              at <strong>11:00 AM</strong> in the board room without fail.
            </p>
          </>
        ) : (
          <>
            <h3 className="notice-subtitle">NOTICE OF MEETING OF THE GRIEVANCE REDRESSAL COMMITTEE</h3>
            <p>
              The Grievance Redressal Committee has received a complaint from students of the <strong>{data.departmentInvolved || ''}</strong> department regarding <strong>{data.meetingAgenda || ''}</strong>.
              All committee members are requested to attend the meeting on <strong>{data.meetingDate || '//'}</strong> at <strong>{data.meetingTime || '11:00 AM'}</strong> in the board room.
            </p>
            <br />
            <p><strong>To:</strong> All Members, Grievance Redressal Committee, SKNSCOE, Korti</p>
            <ul>
              <li>1. Dr. S. G. Kulkarni</li>
              <li>2. Dr. S. S. Kulkarni</li>
              <li>3. Dr. S. S. Kadam</li>
              <li>4. Dr. A. O. Mulani</li>
              <li>5. Dr. B. B. Godbole</li>
              <li>6. Prof. S. V. Pingale</li>
              <li>7. Dr. S. D. Katekar</li>
              <li>8. Prof. A. I. Nikam</li>
              <li>9. Prof. V. P. More</li>
              <li>10. Prof. A. A. Chandane</li>
              <li>11. Prof. A. C. Pise</li>
              <li>12. Prof. S. C. Mali</li>
            </ul>
          </>
        )}

        {/* Footer */}
        <div className="notice-footer">
          <p><strong>Dr. K. J. Karande</strong></p>
          <p>Chairman,</p>
          <p>Grievance Redressal Committee</p>
        </div>
      </div>
    </div>
  );
}