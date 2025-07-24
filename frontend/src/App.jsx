import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Admin from './admin/Admin';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/Dashboard" element={<Dashboard/>}/>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;