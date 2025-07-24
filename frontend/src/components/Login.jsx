// src/components/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ADMIN_CREDENTIALS = {
  role: 'Admin',
  email: 'admin@gmail.com',
  mobile: '9023862130'
};

// Backend API URL
const API_URL = 'http://localhost:5000'; // Change this to match your backend port

const Login = () => {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    document.getElementById("role-dropdown").classList.toggle("active");
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    document.getElementById("role-dropdown").classList.remove("active");
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._-]+@(gmail\.com|ac\.in|org\.in|college\.edu|mail\.com)$/.test(email);
  };

  const validateMobile = (mobile) => {
    return /^[789]\d{9}$/.test(mobile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Validate all fields
      if (!role || !email || !mobile) {
        setMessage('Please fill all fields.');
        return;
      }

      if (!validateEmail(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }

      if (!validateMobile(mobile)) {
        setMessage('Please enter valid 10-digit mobile number');
        return;
      }

      if (role === 'Admin') {
        // Handle Admin login
        if (email === ADMIN_CREDENTIALS.email && mobile === ADMIN_CREDENTIALS.mobile) {
          localStorage.setItem('email', email);
          localStorage.setItem('role', role);
          toast.success('Login Successful!');
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        } else {
          setMessage('Invalid Admin credentials.');
        }
        return;
      }

      // Handle other roles (Student, Faculty, Non Teaching Staff)
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ role, email, mobile })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('email', email);
        localStorage.setItem('mobile', mobile);
        localStorage.setItem('role', role);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        
        toast.success('Login Successful!');
        setTimeout(() => {
          navigate('/Dashboard');
        }, 1500);
      } else {
        setMessage(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Failed to fetch')) {
        setMessage('Unable to connect to the server. Please check if the server is running.');
      } else {
        setMessage('Server error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
      />
      <div className="upperside">
        <button onClick={() => navigate('/')}>Home</button>
      </div>

      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="input-group">
            <label>Select Role</label>
            <div className="dropdown" id="role-dropdown">
              <button type="button" className="dropdown-btn" onClick={toggleDropdown}>
                <span>{role || 'Select your role'}</span>
                <i className="fa-solid fa-caret-down"></i>
              </button>
              <div className="dropdown-content">
                <a href="#" onClick={() => selectRole('Admin')}>Admin</a>
                <a href="#" onClick={() => selectRole('Student')}>Student</a>
                <a href="#" onClick={() => selectRole('Faculty')}>Faculty</a>
                <a href="#" onClick={() => selectRole('Non Teaching Staff')}>Non Teaching Staff</a>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Mobile Number (as Password) */}
          <div className="input-group">
            <label>Mobile Number (Password)</label>
            <input
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Submit */}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Error Message */}
        {message && <p id="message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
