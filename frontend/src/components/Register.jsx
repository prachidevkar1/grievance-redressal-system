import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
   const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-CA'); // returns YYYY-MM-DD in local time
};

    const initialFormData = {
        username: '',
        mobile: '',
        email: '',
        department: '',
        role: '',
        grievanceDescription: '',
        respondentName: '',
        respondentDepartment: '',
        respondentRole: '',
        respondentMobile: '',
        dateOfSubmission: getCurrentDate(),
    };

    const [category, setCategory] = useState('student');
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [dateError, setDateError] = useState('');
    const usernameRef = useRef(null);
    const respondentNameRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const resetForm = () => {
        setFormData(initialFormData);
        setDateError('');
    };

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value.toLowerCase();
        setCategory(selectedCategory);
        resetForm();
    };

    const formatName = (name) => {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    };

     

    const handleNameInput = (e, ref) => {
        const { name, value, selectionStart } = e.target;
        const previous = formData[name];

        if (selectionStart < value.length) {
            setFormData(prev => ({ ...prev, [name]: value }));
            return;
        }

        const parts = value.split(' ');
        const lastIndex = parts.length - 1;
        parts[lastIndex] = formatName(parts[lastIndex]);

        if (value.length > previous.length && value.endsWith(' ')) {
            for (let i = 0; i < lastIndex; i++) {
                parts[i] = formatName(parts[i]);
            }
        }

        const formatted = parts.join(' ');
        setFormData(prev => ({ ...prev, [name]: formatted }));

        setTimeout(() => {
            if (ref.current) {
                const pos = formatted.length;
                ref.current.setSelectionRange(pos, pos);
            }
        }, 0);
    };

    const handleChange = (e) => {
        const { name } = e.target;
        if (name === 'username') return handleNameInput(e, usernameRef);
        if (name === 'respondentName') return handleNameInput(e, respondentNameRef);
        setFormData(prev => ({ ...prev, [name]: e.target.value }));
    };

    const handleDateChange = (e) => {
        const selected = e.target.value;
        const today = getCurrentDate();
        if (selected > today) {
            setDateError('Date cannot be in the future');
        } else {
            setDateError('');
        }
        setFormData(prev => ({ ...prev, dateOfSubmission: selected }));
    };

    const validateForm = () => {
        const errors = [];
        const mobilePattern = /^[789]\d{9}$/;
        // const emailPattern = /^[a-zA-Z0-9._-]+@(gmail\.com|ac\.in|org\.in|college\.edu|mail\.com)$/;
        const emailPattern = /^[a-zA-Z0-9._-]+@(gmail\.com|ac\.in|org\.in|college\.edu|mail\.com|sknscoe\.ac\.in)$/;

        const { username, mobile, email, grievanceDescription, respondentMobile, dateOfSubmission } = formData;

        if (!username || !grievanceDescription) errors.push('Fill in all required fields.');
        if (!mobilePattern.test(mobile)) errors.push('Invalid mobile number.');
        if (!emailPattern.test(email)) errors.push('Invalid email address.');
        if (grievanceDescription.length < 10) errors.push('Description too short.');
        if (!mobilePattern.test(respondentMobile)) errors.push('Invalid respondent mobile.');
        if (dateOfSubmission > getCurrentDate()) errors.push('Date must not be in the future.');

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const errors = validateForm();
        if (errors.length > 0) {
            setMessage({ text: errors.join(' '), type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/submit-grievance', {
                category,
                ...formData
            });
            if (res.data.success) {
                setMessage({ text: 'Grievance submitted successfully!', type: 'success' });
                resetForm();
            } else {
                setMessage({ text: res.data.message || 'Submission error', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Submission failed. Try again later.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCategorySpecificFields = () => {
        switch (category) {
            case 'student':
                return (
                    <>
                         <TextInput id="department" label="Class and Department" name="department" value={formData.department} onChange={handleChange} placeholder="Enter as E.g. FYBtech" />
                        <SelectInput id="role" label="Role" name="role" value={formData.role} onChange={handleChange} options={['Student','Professor']} />
                    </>
                );
            case 'faculty':
            case 'other':
                return (
                    <>
                        <SelectInput id="department" label="Department" name="department" value={formData.department} onChange={handleChange} options={['CSE', 'ENTC', 'Electrical', 'MECH', 'Civil']} />
                        <SelectInput id="role" label="Role" name="role" value={formData.role} onChange={handleChange} options={['Assistant Professor','Associate Professor','Professor','HOD', 'Non Teaching Staff','Student']} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="register-page">
            <div className="upperside">
                <button onClick={() => navigate('/')}>Home</button>
            </div>

            {message.text && (
                <div className={`popup-message ${message.type}`}>
                    <div className="popup-content">
                        <span className="close-popup" onClick={() => setMessage({ text: '', type: '' })}>×</span>
                        <p>{message.text}</p>
                    </div>
                </div>
            )}

            <div className="register-container">
                <h1>Grievance Registration Form</h1>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-columns-container">
                        <div className="form-left-column">
                            <SelectInput id="category" label="Category" value={category} onChange={handleCategoryChange} options={['student', 'faculty', 'other']} />

                            <TextInput id="username" label="Name" name="username" value={formData.username} onChange={handleChange} inputRef={usernameRef} required placeholder="Enter your full name" />
                            <TextInput id="mobile" label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="Enter mobile number" />
                            <TextInput id="email" label="Email" name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="Enter email address" />

                            {renderCategorySpecificFields()}
                        </div>

                        <div className="form-right-column">
                            <div className="form-group">
                                <label htmlFor="grievanceDescription">Grievance Description:</label>
                                <textarea id="grievanceDescription" name="grievanceDescription" value={formData.grievanceDescription} onChange={handleChange} required placeholder="Describe your grievance here..." rows={3} autoComplete="off" />
                            </div>

                            <TextInput id="respondentName" label="Respondent Name" name="respondentName" value={formData.respondentName} onChange={handleChange} inputRef={respondentNameRef} required placeholder="Enter respondent name" />

                            {category === 'student' ? (
                                <>
                                 <SelectInput id="respondentDepartment" label="Respondent Department" name="respondentDepartment" value={formData.respondentDepartment} onChange={handleChange} options={['CSE', 'ENTC', 'Electrical', 'MECH', 'Civil']} />
                                <SelectInput id="respondentRole" label="Respondent Role" name="respondentRole" value={formData.respondentRole} onChange={handleChange} options={['Professor', 'Student', 'Non Teaching Staff']} />
                                </>
                            ) : (
                                <>
                                    <SelectInput id="respondentDepartment" label="Respondent Department" name="respondentDepartment" value={formData.respondentDepartment} onChange={handleChange} options={['CSE', 'ENTC', 'Electrical', 'MECH', 'Civil']} />
                                    <SelectInput id="respondentRole" label="Respondent Role" name="respondentRole" value={formData.respondentRole} onChange={handleChange} options={['Professor', 'Student', 'Non Teaching Staff']} />
                                </>
                            )}

                            <TextInput id="respondentMobile" label="Respondent Mobile" name="respondentMobile" value={formData.respondentMobile} onChange={handleChange} required placeholder="Enter mobile number" />

                            <div className="form-group">
                                <label htmlFor="dateOfSubmission">Date of Submission:</label>
                                <input type="date" id="dateOfSubmission" name="dateOfSubmission" value={formData.dateOfSubmission} onChange={handleDateChange} max={getCurrentDate()} autoComplete="off" />

                                {dateError && <div className="error-message">{dateError}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Register Grievance'}
                        </button>
                        <button type="button" onClick={() => navigate('/Login')}>Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TextInput = ({ id, label, name, value, onChange, required = false, type = "text", inputRef, placeholder }) => (
    <div className="form-group">
        <label htmlFor={id}>{label}:</label>
        <input id={id} name={name} type={type} value={value} onChange={onChange} required={required} ref={inputRef} placeholder={placeholder} autoComplete="off" />
    </div>
);

const SelectInput = ({ id, label, name, value, onChange, options }) => (
    <div className="form-group">
        <label htmlFor={id}>{label}:</label>
        <select id={id} name={name} value={value} onChange={onChange} required autoComplete="off">
            <option value="" disabled>Select {label}</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt.toLowerCase()}>{opt}</option>
            ))}
        </select>
    </div>
);

export default Register;
