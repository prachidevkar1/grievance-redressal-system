const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Create email message options
const createMailOptions = (to, subject, html) => ({
  from: process.env.EMAIL_USER,
  to,
  subject,
  html,
});

// Helper: Get grievance table name based on category
const getGrievanceTable = () => 'all_grievances';

// Route: Submit grievance
router.post('/submit-grievance', (req, res) => {
  const {
    username, mobile, email, department, role,
    grievanceDescription, respondentName, respondentDepartment, respondentRole,
    respondentMobile, dateOfSubmission, category
  } = req.body;

  // Basic validation
  if (!username || !mobile || !email || !department || !role || !grievanceDescription ||
      !respondentName  || !respondentDepartment || !respondentRole || !respondentMobile || !dateOfSubmission || !category) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled out.' });
  }

  const table = getGrievanceTable();

  // const { query, values } = buildInsertQuery(table, req.body);
  const fields = [
    'username', 'mobile', 'email', 'department', 'role',
    'grievance_description', 'respondent_name', 'respondent_department', 'respondent_role',
    'respondent_mobile', 'status', 'date_of_submission', 'category'
  ];

   const placeholders = fields.map(() => '?').join(', ');
  const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
  const values = [
    username, mobile, email, department, role,
    grievanceDescription, respondentName, respondentDepartment, respondentRole,
    respondentMobile, 'pending', dateOfSubmission, category,
  ];

  // Insert grievance into database
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Database insertion error:', err);
      return res.status(500).json({ success: false, message: 'Error while submitting grievance.' });
    }

    const grievanceId = result.insertId;

    // Email: Student confirmation
    const studentMailHtml = `
      <p>Dear <strong>${username}</strong>,</p>
      <p>Your grievance has been submitted successfully.</p>
       <li><strong>Category:</strong> ${category}</li>
      <p><strong>Login Info</strong><br/>Username: ${email}<br/>Password: ${mobile}</p>
      <p>We will get back to you after reviewing your grievance.</p>
      <p>Regards,<br/>Grievance Committee</p>
    `;
    const studentMailOptions = createMailOptions(email, 'Grievance Submission Confirmation', studentMailHtml);

    transporter.sendMail(studentMailOptions, (error) => {
      if (error) console.error('Student email failed:', error);
    });

    // Email: Grievance in-charge notification
    const inchargeEmail = process.env.GRIEVANCE_INCHARGE_EMAIL || 'prachidevkar1328@gmail.com';
    const inchargeMailHtml = `
      <p><strong>New Grievance Submitted</strong></p>
      <ul>
        <li><strong>Category:</strong> ${category}</li>
        <li><strong>Name:</strong> ${username}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Mobile:</strong> ${mobile}</li>
        <p><strong>Complainer department and role:</strong> ${department} (${role})</p>
        <li><strong>Description:</strong><br/>${grievanceDescription}</li>
        <p><strong>Respondent Name:</strong> ${respondentName}</p>
        <p><strong>Respondent department and role:</strong> ${respondentDepartment} (${respondentRole})</p>
        <li><strong>Respondent Mobile:</strong> ${respondentMobile}</li>
        <li><strong>Date:</strong> ${dateOfSubmission}</li>
      </ul>
      <p>Please log in to the system to review and take action.</p>
    `;
    const inchargeMailOptions = createMailOptions(inchargeEmail, 'New Grievance Received', inchargeMailHtml);

    transporter.sendMail(inchargeMailOptions, (error) => {
      if (error) console.error('In-charge email failed:', error);
    });

   return res.status(201).json({ success: true, message: 'Grievance submitted successfully!' });
  });
});

// POST /login
router.post('/login', (req, res) => {
  const { role, email, mobile } = req.body;

  // For admin, we don't need to check database
  if (role === 'Admin') {
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      role: 'Admin'
    });
  }

  // For other roles, check in all_grievances table
  const query = `
    SELECT * FROM all_grievances 
    WHERE email = ? 
    AND mobile = ? 
    AND category = ?
    LIMIT 1
  `;

  db.query(query, [email, mobile, role], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Return user data along with success response
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      role: role,
      userData: results[0]
    });
  });
});

// All grievances, ordered by date_of_submission DESC
router.get('/grievances', (req, res) => {
  db.query('SELECT * FROM all_grievances ORDER BY date_of_submission DESC', (err, results) => {
    if (err) {
      console.error('Error fetching grievances:', err);
      return res.status(500).json({ success: false, message: 'Database query error.' });
    }
    res.json({ success: true, grievances: results });
  });
});

// Grievances by status, ordered by date_of_submission DESC
router.get('/grievances/status/:status', (req, res) => {
  const { status } = req.params;
  db.query('SELECT * FROM all_grievances WHERE status = ? ORDER BY date_of_submission DESC', [status], (err, results) => {
    if (err) {
      console.error('Error fetching grievances by status:', err);
      return res.status(500).json({ success: false, message: 'Database query error.' });
    }
    res.json({ success: true, grievances: results });
  });
});

// --- Update grievance status ---
router.put('/update-grievance-status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'in-progress', 'resolved', 'approved'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const sql = 'UPDATE all_grievances SET status = ? WHERE id = ?';

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ success: false, message: 'Database update failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }
    res.json({ success: true, message: 'Status updated' });
  });
});

// --- Delete grievance ---
router.delete('/delete-grievance/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM all_grievances WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting grievance:', err);
      return res.status(500).json({ success: false, message: 'Error deleting grievance' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }
    res.json({ success: true, message: 'Grievance deleted successfully' });
  });
});

module.exports = router;
