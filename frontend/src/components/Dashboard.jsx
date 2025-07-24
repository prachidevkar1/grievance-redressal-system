import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelStatus, setCancelStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileRef = useRef(null);
  const grievancesRef = useRef(null);
  const cancelRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data and grievances on component mount
  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedUserData = localStorage.getItem('userData');
    
    if (!role || !storedUserData) {
      navigate('/login');
      return;
    }

    const parsedUserData = JSON.parse(storedUserData);
    setUserData(parsedUserData);

    // Fetch grievances from the backend
    fetch('http://localhost:5000/grievances')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Add this mapping before filtering
          const roleMap = {
            faculty: 'professor',
            student: 'student',
            'non teaching staff': 'non teaching staff',
            other: 'other'
          };
          const userRole = roleMap[parsedUserData.category.toLowerCase()] || parsedUserData.category.toLowerCase();

          // Filter grievances for the current user (email, mobile, role)
          const userGrievances = data.grievances.filter(
            grievance =>
              grievance.email === parsedUserData.email &&
              grievance.mobile === parsedUserData.mobile &&
              grievance.role.toLowerCase() === userRole
          );
          setGrievances(userGrievances);
        }
      })
      .catch(err => {
        console.error('Error fetching grievances:', err);
        setGrievances([]);
      });
  }, [navigate]);

  // Handle click outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // Scroll to grievances section when Home is clicked
  const handleHomeClick = (e) => {
    e.preventDefault();
    setShowCancelSection(false);
    setSidebarOpen(false);
    if (grievancesRef.current) {
      grievancesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to cancel grievance section when Cancel Grievance is clicked
  const handleCancelClick = (e) => {
    e.preventDefault();
    setShowCancelSection(true);
    setSidebarOpen(false);
    setTimeout(() => {
      if (cancelRef.current) {
        cancelRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Handle send response for cancellation
  const handleSendCancel = async () => {
    setCancelStatus('');
    if (!selectedGrievanceId) {
      setCancelStatus('Please select a grievance to cancel.');
      return;
    }
    if (!cancelReason.trim()) {
      setCancelStatus('Please enter a valid reason for cancellation.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/cancel-grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grievanceId: selectedGrievanceId,
          reason: cancelReason,
          user: {
            email: userData.email,
            mobile: userData.mobile,
            role: userData.category,
            username: userData.username
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setCancelStatus('Cancellation request sent successfully!');
        setCancelReason('');
        setSelectedGrievanceId('');
      } else {
        setCancelStatus(data.message || 'Failed to send cancellation request.');
      }
    } catch (err) {
      setCancelStatus('Error sending cancellation request.');
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  // Only show user's pending grievances for cancellation
  const pendingGrievances = grievances.filter(g => g.status === 'pending');

  return (
    <div className="admin-container">
      <div className={`sidebar${sidebarOpen ? ' show' : ''}`}>
        <div className="sidebar-header">
          <h6>Dashboard</h6>
        </div>
        <ul className="sidebar-menu">
          <li><a href="#home" onClick={handleHomeClick}>Home</a></li>
          <li><a href="#cancel" onClick={handleCancelClick}>Cancel Grievance</a></li>
          <li><a href="#logout" style={{ color: '#fff' }} onClick={handleLogout}>Logout</a></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="top-bar">
          <span className="hamburger" onClick={() => setSidebarOpen((open) => !open)} style={{display: 'inline-block', fontSize: '1.7em', color: '#000080', cursor: 'pointer', marginRight: 18}}>
            <i className="fas fa-bars"></i>
          </span>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
          <div className="top-right-icons">
            <span className="icon"><i className="fas fa-bell"></i></span>
            <span className="icon profile-icon" onClick={() => setProfileOpen((open) => !open)}>
              <i className="fas fa-user"></i>
            </span>
            {profileOpen && (
              <div className="profile-card" ref={profileRef}>
                <div className="profile-card-header">
                  <div>
                    <div className="profile-card-name">{userData.username} <span role="img" aria-label="wave">👋</span></div>
                    <div className="profile-card-email">{userData.email}</div>
                  </div>
                </div>
                <div className="profile-card-actions">
                  <button className="profile-card-action" disabled><i className="fas fa-cog"></i> Settings</button>
                  <button className="profile-card-action" disabled><i className="fas fa-share-alt"></i> Share</button>
                  <button className="profile-card-action" disabled><i className="fas fa-lock"></i> Change Password</button>
                </div>
                <button className="profile-card-logout" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
              </div>
            )}
          </div>
        </div>
        <div className="main-container">
          {/* Welcome Section */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 8, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)', 
            padding: '30px 40px',
            margin: '0 auto 20px auto', 
            maxWidth: 800,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '2.2em', 
              fontWeight: 600, 
              marginBottom: 15,
              color: '#000080'
            }}>
              Welcome, {userData.username}
            </div>
            <div style={{ 
              fontSize: '1.3em', 
              color: '#666',
              borderTop: '1px solid #eee',
              paddingTop: 15
            }}>
              <b>Category:</b> {userData.category.charAt(0).toUpperCase() + userData.category.slice(1)}
            </div>
          </div>

          {/* Grievances Section */}
          <div ref={grievancesRef} style={{ 
            background: '#fff', 
            borderRadius: 8, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)', 
            padding: '30px 40px',
            margin: '0 auto', 
            maxWidth: 800
          }}>
            <h3 style={{ 
              fontSize: '1.5em', 
              color: '#000080',
              marginBottom: 20,
              borderBottom: '2px solid #eee',
              paddingBottom: 10
            }}>
              Your Grievance Records
            </h3>
            
            {grievances.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {grievances.map((grievance) => (
                  <div key={grievance.id} style={{ 
                    padding: 20, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 8,
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: 12,
                        backgroundColor: grievance.status === 'pending' ? '#e3f0ff' : 
                                       grievance.status === 'in-progress' ? '#fffbe6' : '#e6f9f0',
                        color: grievance.status === 'pending' ? '#1976d2' : 
                              grievance.status === 'in-progress' ? '#fbc02d' : '#388e3c',
                        textTransform: 'capitalize',
                        fontWeight: 500
                      }}>
                        {grievance.status}
                      </span>
                      <span style={{ color: '#666' }}>
                        {new Date(grievance.date_of_submission).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <b>Category:</b> {grievance.category}
                      </div>
                      <div>
                        <b>Mobile:</b> {grievance.mobile}
                      </div>
                      <div>
                        <b>Department:</b> {grievance.department}
                      </div>
                      <div>
                        <b>Role:</b> {grievance.role}
                      </div>
                    </div>

                    <div style={{ marginTop: 15 }}>
                      <b>Description:</b>
                      <p style={{ 
                        marginTop: 5, 
                        padding: 10, 
                        background: '#fff', 
                        borderRadius: 4,
                        border: '1px solid #eee'
                      }}>
                        {grievance.grievance_description}
                      </p>
                    </div>

                    <div style={{ marginTop: 15 }}>
                      <b>Respondent Details:</b>
                      <div style={{ 
                        marginTop: 5, 
                        padding: 10, 
                        background: '#fff', 
                        borderRadius: 4,
                        border: '1px solid #eee'
                      }}>
                        <div><b>Name:</b> {grievance.respondent_name}</div>
                        <div><b>Department:</b> {grievance.respondent_department}</div>
                        <div><b>Role:</b> {grievance.respondent_role}</div>
                        <div><b>Mobile:</b> {grievance.respondent_mobile}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: 20, 
                textAlign: 'center', 
                color: '#666',
                backgroundColor: '#fafafa',
                borderRadius: 8,
                border: '1px dashed #ccc'
              }}>
                No grievance records found.
              </div>
            )}
          </div>

          {/* Cancel Grievance Section */}
          {showCancelSection && (
            <div ref={cancelRef} style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              padding: '30px 40px',
              margin: '30px auto 0 auto',
              maxWidth: 600
            }}>
              <h3 style={{
                fontSize: '1.4em',
                color: '#c62828',
                marginBottom: 20,
                borderBottom: '2px solid #eee',
                paddingBottom: 10
              }}>
                Cancel Grievance
              </h3>
              <div style={{ marginBottom: 15 }}>
                <label htmlFor="grievance-select"><b>Select Pending Grievance:</b></label><br />
                <select
                  id="grievance-select"
                  value={selectedGrievanceId}
                  onChange={e => setSelectedGrievanceId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    marginTop: 8
                  }}
                >
                  <option value="">-- Select --</option>
                  {pendingGrievances.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.category} | {g.grievance_description.slice(0, 30)}... | {new Date(g.date_of_submission).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label htmlFor="cancel-reason"><b>Reason of Cancellation:</b></label><br />
                <textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    marginTop: 8
                  }}
                  placeholder="Enter your reason for cancelling this grievance (e.g. problem solved, misunderstanding, etc.)"
                />
              </div>
              <button
                style={{
                  padding: '10px 24px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#c62828',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1em',
                  marginBottom: 10
                }}
                onClick={handleSendCancel}
              >
                Send Response
              </button>
              {cancelStatus && (
                <div style={{
                  marginTop: 10,
                  color: cancelStatus.includes('success') ? 'green' : 'red',
                  fontWeight: 500
                }}>{cancelStatus}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
