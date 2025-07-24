import React, { useState, useEffect, useRef } from 'react';
import './Admin.css';
import Notice from "../components/Notice";
import Report from "../components/Report";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  // State variables
  const [activeSection, setActiveSection] = useState('home');
  const [grievances, setGrievances] = useState([]);
  const [records, setRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Dropdown for status change
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownValue, setDropdownValue] = useState('');
  const [dropdownRecordId, setDropdownRecordId] = useState(null);
  const [dropdownWidth, setDropdownWidth] = useState(200);
  const dropdownRef = useRef(null);

  // Profile dropdown ref
  const profileRef = useRef(null);

  const dropdownOptions = ['pending', 'in-progress', 'resolved'];

  const navigate = useNavigate();

useEffect(() => {
  let url = '';
  if (activeSection === 'all-grievances' || activeSection === 'home') {
    url = 'http://localhost:5000/grievances';
  } else if (activeSection === 'pending-grievances') {
    url = 'http://localhost:5000/grievances/status/pending';
  } else if (activeSection === 'in-progress-grievances') {
    url = 'http://localhost:5000/grievances/status/in-progress';
  } else if (activeSection === 'resolved-grievances') {
    url = 'http://localhost:5000/grievances/status/resolved';
  }
  if (url) {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.grievances)) {
          setGrievances(data.grievances);
        } else {
          setGrievances([]);
        }
      })
      .catch(err => {
        setGrievances([]);
        console.error('Failed to fetch grievances:', err);
      });
  }
}, [activeSection]);

  // Fetch records for "All Records"
  useEffect(() => {
    if (activeSection === 'all-records') {
      fetch('http://localhost:3000/get-grievances')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.grievances)) {
            setRecords(data.grievances);
          } else {
            setRecords([]);
          }
        })
        .catch(err => console.error('Error fetching records:', err));
    }
  }, [activeSection]);

  // Fetch notifications
  const fetchNotifications = () => {
    fetch('http://localhost:3000/api/get-notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotifications(data.notifications);
      })
      .catch(err => console.error('Fetch notifications error:', err));
  };

  // Handle status change with confirmation
  const handleStatusChange = (id, newStatus) => {
    const prev = grievances.find(g => g.id === id);
    const prevStatus = prev ? prev.status : '';

    if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      fetch(`http://localhost:5000/update-grievance-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Status updated successfully.');
            setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
            setRecords(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
          } else {
            alert('Failed to update status: ' + data.message);
            // Revert on failure
            setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: prevStatus } : g));
            setRecords(prev => prev.map(g => g.id === id ? { ...g, status: prevStatus } : g));
          }
        })
        .catch(e => {
          console.error('Error updating status:', e);
          alert('Error updating status.');
          setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: prevStatus } : g));
          setRecords(prev => prev.map(g => g.id === id ? { ...g, status: prevStatus } : g));
        });
    }
  };

  // Handle delete grievance
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/delete-grievance/${id}`)
      .then(res => {
        if (res.data.success) {
          alert('Grievance deleted.');
          setGrievances(prev => prev.filter(g => g.id !== id));
          setRecords(prev => prev.filter(g => g.id !== id));
        } else {
          alert('Failed to delete grievance.');
        }
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('Error deleting grievance.');
      });
  };

  // Open dropdown for status change
  const openDropdown = (e, currentStatus, recordId) => {
    const rect = e.target.closest('.status-display');
    const width = rect ? rect.offsetWidth : 200;
    const rectPosition = rect ? rect.getBoundingClientRect() : { bottom: 0, left: 0 };
    setDropdownPosition({
      top: rectPosition.bottom + window.scrollY,
      left: rectPosition.left + window.scrollX,
    });
    setDropdownValue(currentStatus);
    setDropdownRecordId(recordId);
    setDropdownWidth(width);
    setDropdownOpen(true);
  };

  // Click outside handler for dropdown and profile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close dropdown if click is outside
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      // Close profile dropdown if click is outside
      if (showProfileDropdown && profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (dropdownOpen || showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, showProfileDropdown]);

  // Render dashboard cards
  const renderDashboardCards = () => (
    <>
      <div className="content">
        <div className="card">
          <h2>Total Grievances</h2>
          <div className="card-count">{grievances.length}</div>
        </div>
        <div className="card">
          <h2>Pending</h2>
          <div className="card-count">{grievances.filter(g => g.status === 'pending').length}</div>
        </div>
        <div className="card">
          <h2>In Progress</h2>
          <div className="card-count">{grievances.filter(g => g.status === 'in-progress').length}</div>
        </div>
        <div className="card">
          <h2>Resolved</h2>
          <div className="card-count">{grievances.filter(g => g.status === 'resolved').length}</div>
        </div>
      </div>
      {/* Recent Grievances Section */}
      <div className="recent-grievances-section">
        <h3>Recent Grievances</h3>
        <div className="recent-grievances-list">
          {grievances.slice(0, 5).map((g) => (
            <div key={g.id} className="recent-grievance-card">
              <div className="recent-grievance-header">
                <i className="fa-solid fa-user recent-grievance-fauser" style={{marginRight: '10px', fontSize: '1.3em', color: '#1976d2'}}></i>
                <span className="recent-grievance-user">{g.username}</span>
                <span className={`recent-grievance-status status-${g.status}`}>{g.status.charAt(0).toUpperCase() + g.status.slice(1)}</span>
              </div>
              <div className="recent-grievance-desc">{g.grievance_description.length > 60 ? g.grievance_description.slice(0, 60) + '...' : g.grievance_description}</div>
              <div className="recent-grievance-date">{new Date(g.date_of_submission).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // Render grievances table
  const renderGrievanceTable = () => (
    <div className="all-grievances-container">
      <table className="all-grievances-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grievances.length === 0 ? (
            <tr><td colSpan="5">No grievances found.</td></tr>
          ) : (
            grievances.map((g) => (
              <tr key={g.id}>
                <td>{g.username}</td>
                <td>{g.category}</td>
                <td>{g.grievance_description}</td>
                <td style={{ width: '200px' }}>
                  <div
                    className="status-display"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      backgroundColor: '#fff',
                    }}
                    onClick={(e) => openDropdown(e, g.status, g.id)}
                  >
                    <span>{g.status.charAt(0).toUpperCase() + g.status.slice(1)}</span>
                    <i className="fas fa-caret-down" style={{ marginLeft: '8px' }}></i>
                  </div>
                </td>
                <td className="action-icons">
                  <i
                    className="fas fa-eye"
                    title="View"
                    style={{ cursor: 'pointer', marginRight: '10px', color: '#000080' }}
                    onClick={() => {
                      setSelectedGrievance(g);
                      setShowPopup(true);
                    }}
                  ></i>
                  <i
                    className="fas fa-trash"
                    title="Delete"
                    style={{ cursor: 'pointer', color: '#000080' }}
                    onClick={() => {
                      if (window.confirm('Are you sure to delete this record?')) {
                        handleDelete(g.id);
                      }
                    }}
                  ></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Render "All Records" table
  const renderRecordsTable = () => (
    <div>
      <h3>All Records</h3>
      <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan="5">No records found.</td></tr>
          ) : (
            records.map((rec) => (
              <tr key={rec.id}>
                <td>{rec.username}</td>
                <td>{rec.category}</td>
                <td>{rec.grievance_description}</td>
                <td style={{ width: '200px' }}>
                  <div
                    className="status-display"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      backgroundColor: '#fff',
                    }}
                    onClick={(e) => openDropdown(e, rec.status, rec.id)}
                  >
                    <span>{rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}</span>
                    <i className="fas fa-caret-down" style={{ marginLeft: '8px' }}></i>
                  </div>
                </td>
                <td>
                  <i
                    className="fas fa-eye"
                    title="View"
                    style={{ cursor: 'pointer', marginRight: '10px', color: '#000080' }}
                    onClick={() => {
                      setSelectedGrievance(rec);
                      setShowPopup(true);
                    }}
                  ></i>
                  <i
                    className="fas fa-trash"
                    title="Delete"
                    style={{ cursor: 'pointer', color: '#000080' }}
                    onClick={() => {
                      if (window.confirm('Are you sure to delete this record?')) {
                        handleDelete(rec.id);
                      }
                    }}
                  ></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Render status table
  const renderStatusTable = (status) => (
    <div className="all-grievances-container">
      <table className="all-grievances-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grievances.filter(g => g.status === status).length === 0 ? (
            <tr><td colSpan="5">No grievances found.</td></tr>
          ) : (
            grievances.filter(g => g.status === status).map((g) => (
              <tr key={g.id}>
                <td>{g.username}</td>
                <td>{g.category}</td>
                <td>{g.grievance_description}</td>
                <td style={{ width: '200px' }}>
                  <div
                    className="status-display"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      backgroundColor: '#fff',
                    }}
                    onClick={(e) => openDropdown(e, g.status, g.id)}
                  >
                    <span>{g.status.charAt(0).toUpperCase() + g.status.slice(1)}</span>
                    <i className="fas fa-caret-down" style={{ marginLeft: '8px' }}></i>
                  </div>
                </td>
                <td className="action-icons">
                  <i
                    className="fas fa-eye"
                    title="View"
                    style={{ cursor: 'pointer', marginRight: '10px', color: '#000080' }}
                    onClick={() => {
                      setSelectedGrievance(g);
                      setShowPopup(true);
                    }}
                  ></i>
                  <i
                    className="fas fa-trash"
                    title="Delete"
                    style={{ cursor: 'pointer', color: '#000080' }}
                    onClick={() => {
                      if (window.confirm('Are you sure to delete this record?')) {
                        handleDelete(g.id);
                      }
                    }}
                  ></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Render section based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'home': return renderDashboardCards();
      case 'all-grievances': return renderGrievanceTable();
      case 'pending-grievances': return renderStatusTable('pending');
      case 'in-progress-grievances': return renderStatusTable('in-progress');
      case 'resolved-grievances': return renderStatusTable('resolved');
      case 'all-records': return renderRecordsTable();
      case 'notice-generation': return <Notice />;
      case 'report': return <Report />;
      default: return <h3 className="placeholder-section">{activeSection.replace(/-/g, ' ')}</h3>;
    }
  };

  // Sidebar menu items
  const sidebarMenu = [
    { key: 'home', label: 'Home' },
    { key: 'all-grievances', label: 'All Grievances' },
    { key: 'pending-grievances', label: 'Pending Grievances' },
    { key: 'in-progress-grievances', label: 'In Progress Grievances' },
    { key: 'resolved-grievances', label: 'Resolved Grievances' },
    { key: 'notice-generation', label: 'Notice Generation' },
    { key: 'report', label: 'Report' },
    // Remove Grievance Community, add Logout below
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarVisible ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h6>Dashboard</h6>
        </div>
        <ul className="sidebar-menu">
          {sidebarMenu.map((section) => (
            <li key={section.key}>
              <a
                href="#"
                className={activeSection === section.key ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(section.key);
                  setSidebarVisible(false);
                }}
              >
                {section.label}
              </a>
            </li>
          ))}
          {/* Logout anchor tag at the end */}
          <li>
            <a
              href="#"
              onClick={e => { e.preventDefault(); navigate('/'); }}
              style={{ color: '#fff', fontWeight: 600 }}
            >
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top bar */}
        <div className="top-bar">
          {/* Hamburger icon for small screens */}
          <div
            className="menu-toggle"
            onClick={() => setSidebarVisible(prev => !prev)}
            title="Menu"
          >
            <i className="fas fa-bars"></i>
          </div>

          {/* Search box */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>

          {/* Icons: Notifications & Profile */}
          <div className="top-right-icons">
            {/* Notifications Icon */}
            <div
              className="icon"
              onClick={() => {
                setShowNotifications(!showNotifications);
                fetchNotifications();
              }}
              title="Notifications"
            >
              <i className="fas fa-bell"></i>
            </div>
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="dropdown-content notifications-dropdown">
                {notifications.length === 0 ? (
                  <p>No new notifications</p>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="notification">
                      <strong>{n.user || 'System'}</strong>
                      <span>{n.message}</span>
                      <br />
                      <small>{new Date(n.timestamp).toLocaleString()}</small>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Profile Icon */}
            <div style={{ position: 'relative' }}>
              <i
                ref={profileRef}
                className="fa-solid fa-user"
                style={{ fontSize: '22px', cursor: 'pointer', color:'#000080' }}
                onClick={() => setShowProfileDropdown(prev => !prev)}
                title="Profile"
              ></i>
              {showProfileDropdown && (
                <div className="profile-card" style={{ right: '0px', top: '30px', position: 'absolute' }} ref={profileRef}>
                  <div className="profile-card-header">
                    <i className="fa-solid fa-user" style={{ fontSize: '54px', background: '#fff', borderRadius: '50%', padding: '10px', color: '#09c' }}></i>
                    <div>
                      <div className="profile-card-name">Admin</div>
                      <div className="profile-card-email">incharge@sknscoe.ac.in</div>
                    </div>
                  </div>
                  <div className="profile-card-actions">
                    <button className="profile-card-action" disabled><i className="fa-solid fa-gear"></i> Settings</button>
                    <button className="profile-card-action" disabled><i className="fa-solid fa-share-nodes"></i> Share</button>
                    <button className="profile-card-action" disabled><i className="fa-solid fa-lock"></i> Change Password</button>
                  </div>
                  <button className="profile-card-logout" onClick={() => navigate('/') }>
                    <i className="fa-solid fa-right-from-bracket" style={{marginRight: '5px'}}></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content based on active section */}
        <div className="main-container">{renderSection()}</div>
      </div>

      {/* Status change overlay dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="dropdown-list"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownWidth,
          }}
        >
          {dropdownOptions.map((opt) => (
            <div
              key={opt}
              className={`dropdown-item ${opt === dropdownValue ? 'selected' : ''}`}
              onClick={() => {
                handleStatusChange(dropdownRecordId, opt);
                setDropdownOpen(false);
              }}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </div>
          ))}
        </div>
      )}

      {/* Details popup */}
      {showPopup && selectedGrievance && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h2>Record Details</h2>
            <div>
              <p><strong>Name:</strong> {selectedGrievance.username}</p>
              <p><strong>Mobile:</strong> {selectedGrievance.mobile}</p>
              <p><strong>Email:</strong> {selectedGrievance.email}</p>
              <p><strong>Category:</strong> {selectedGrievance.category}</p>
              <p><strong>Description:</strong> {selectedGrievance.grievance_description}</p>
              <p><strong>Respondent Name:</strong> {selectedGrievance.respondent_name}</p>
              <p><strong>Respondent Department:</strong> {selectedGrievance.respondent_department}</p>
              <p><strong>Respondent Role:</strong> {selectedGrievance.respondent_role}</p>
              <p><strong>Respondent Mobile:</strong> {selectedGrievance.respondent_mobile}</p>
              <p><strong>Date of Submission:</strong> {new Date(selectedGrievance.date_of_submission).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;