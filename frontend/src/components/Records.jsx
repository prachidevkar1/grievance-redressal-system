import React, { useEffect, useState } from 'react';
import './Records.css';

const Records = () => {
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  const fetchGrievances = async () => {
    try {
      const response = await fetch('http://localhost:3000/get-grievances');
      const data = await response.json();
      if (data.success) {
        setGrievances(data.grievances || []);
      } else {
        alert('Error fetching grievances: ' + data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('There was an error fetching grievances.');
    }
  };

  const fetchGrievanceDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/get-grievance-details/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedGrievance(data.grievance);
      } else {
        alert('Error fetching grievance details');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching grievance details');
    }
  };

  const deleteGrievance = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/delete-grievance/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Grievance deleted');
        setGrievances(grievances.filter(g => g.id !== id));
      } else {
        alert('Failed to delete grievance');
      }
    } catch (error) {
      console.error('Error deleting grievance:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3000/update-grievance-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        setGrievances(grievances.map(g => g.id === id ? { ...g, status } : g));
      } else {
        alert('Error updating status');
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  return (
    <>
      <div className="recent-grievances">
        {grievances.length === 0 ? (
          <p>No grievances found.</p>
        ) : grievances.map(grievance => (
          <div key={grievance.id} className="grievance-entry">
            <span className="student-name">{grievance.username || 'N/A'}</span>

            <div className="status-dropdown-container">
              <div className="status-dropdown">
                <span>{grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}</span>
                <i className="fa-solid fa-caret-down"></i>
              </div>
              <div className="status-options">
                {['pending', 'approved', 'resolved'].map(status => (
                  <div key={status} className="status-option" onClick={() => updateStatus(grievance.id, status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <i className="fas fa-eye view-icon" onClick={() => fetchGrievanceDetails(grievance.id)}></i>
            <i className="fas fa-trash delete-icon" onClick={() => {
              if (window.confirm('Are you sure you want to delete this grievance?')) {
                deleteGrievance(grievance.id);
              }
            }}></i>
          </div>
        ))}
      </div>

      {selectedGrievance && (
        <div className="popup" onClick={() => setSelectedGrievance(null)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedGrievance(null)}>&times;</button>
            <h2>Grievance Details</h2>
            {Object.entries(selectedGrievance).map(([key, value]) => (
              <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Records;
