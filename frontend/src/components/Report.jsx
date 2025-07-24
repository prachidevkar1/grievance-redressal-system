import React, { useState } from "react";
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png"; // Ensure this points to the correct logo file
import "./Report.css"; // Include the CSS styles below

export default function Report() {
    const [formData, setFormData] = useState({
        purpose: "",
        date: "",
        time: "",
        location: "",
        attendees: "",
        grievanceOverview: "",
        detailsPresented: "",
        keyDiscussions: "",
        preparedBy: "",
        approvedBy: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const requiredFields = [
            "purpose",
            "date",
            "time",
            "location",
            "attendees",
            "preparedBy",
            "approvedBy",
        ];
        for (const field of requiredFields) {
            if (!formData[field].trim()) {
                alert(`Please fill the ${field} field.`);
                return;
            }
        }

        const selectedDate = new Date(formData.date);
        const now = new Date();
        if (selectedDate > now) {
            alert("Error: The report date cannot be in the future.");
            return;
        }

        alert("Submitted Successfully!");
        setSubmitted(true);
    };

    const generatePDF = () => {
        if (!submitted) {
            alert("Please submit the form first before generating the PDF.");
            return;
        }

        const doc = new jsPDF();

        let y = 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        for (const [key, value] of Object.entries(formData)) {
            const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
            const text = `${label}: ${value}`;
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 10, y);
            y += splitText.length * 7;
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
        }

        doc.save("Grievance_Report.pdf");
    };

    function InputField({ label, name, value, onChange, required, type = "text", placeholder, readOnly }) {
        return (
            <label style={{ display: "block", marginBottom: 15 }}>
                {label}:
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    style={inputStyle}
                />
            </label>
        );
    }


    return (
        <div style={{ padding: 20, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            <div
                style={{
                    maxWidth: 700,
                    margin: "auto",
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 6,
                    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
                }}
            >
                {/* Header */}
                <div className="notice-header">
                    <img src={logo} alt="College Logo" className="logo" />
                    <div className="college-info">
                        <h2>Savitribai Phule Shikshan Prasarak Mandal's</h2>
                        <h1>SKN SINHGAD COLLEGE OF ENGINEERING</h1>
                        <p>(Approved by AICTE & Affiliated to PAH Solapur University, Solapur)</p>
                        <p>A/p- Korti, Tal- Pandharpur, Pin- 413304, Dist.- Solapur.</p>
                        <p>Phone: 02186-250146 | E-mail: principal@sknscoe.ac.in | Website: www.sknscoe.ac.in</p>
                    </div>
                </div>

                <h2
                    style={{
                        textAlign: "center",
                        color: "#000080",
                        marginBottom: 20,
                        fontWeight: "bold",
                    }}
                >
                    Grievance Meeting Report
                </h2>

                <form onSubmit={handleSubmit}>
                    <Section title="1. Introduction">
                        <InputField
                            label="Agenda Of Meeting"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            required
                            placeholder="Enter agenda of meeting"
                        />
                        <InputField label="Date of Meeting" name="date" type="date" value={formData.date} onChange={handleChange} required />
                        <InputField label="Time of Meeting" name="time" placeholder="Start Time - End Time" value={formData.time} onChange={handleChange} required />
                        <InputField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="Enter location"
                        />
                        <TextAreaField label="Attended Members" name="attendees" rows={3} value={formData.attendees} onChange={handleChange} required />
                    </Section>

                    <Section title="2. Minutes Of Meeting">
                        <TextAreaField label="Grievance Overview" name="grievanceOverview" rows={4} value={formData.grievanceOverview} onChange={handleChange} />
                        <TextAreaField label="Details Presented" name="detailsPresented" rows={4} value={formData.detailsPresented} onChange={handleChange} />
                    </Section>

                    <Section title="3. Discussion Summary">
                        <TextAreaField label="Key Discussions" name="keyDiscussions" rows={4} value={formData.keyDiscussions} onChange={handleChange} />
                    </Section>

                    <Section title="4. Signatures">
                        <InputField label="Prepared By" name="preparedBy" value={formData.preparedBy} onChange={handleChange} required />
                        <InputField label="Approved By" name="approvedBy" value={formData.approvedBy} onChange={handleChange} required />
                    </Section>

                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <button type="submit" style={buttonStyle}>Submit Report</button>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    purpose: "",
                                    date: "",
                                    time: "",
                                    location: "",
                                    attendees: "",
                                    grievanceOverview: "",
                                    detailsPresented: "",
                                    keyDiscussions: "",
                                    preparedBy: "",
                                    approvedBy: "",
                                });
                                setSubmitted(false);
                            }}
                            style={{ ...buttonStyle, marginLeft: 10, backgroundColor: "#000080" }}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={generatePDF}
                            style={{ ...buttonStyle, marginLeft: 10, backgroundColor: "#000080" }}
                        >
                            Generate PDF
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section style={{ marginBottom: 20 }}>
            <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: 5, fontWeight: "bold" }}>{title}</h3>
            {children}
        </section>
    );
}

function InputField({ label, name, value, onChange, required, type = "text", placeholder }) {
    return (
        <label style={{ display: "block", marginBottom: 15 }}>
            {label}:
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                style={inputStyle}
            />
        </label>
    );
}

function TextAreaField({ label, name, value, onChange, rows, required }) {
    return (
        <label style={{ display: "block", marginBottom: 15 }}>
            {label}:
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                required={required}
                style={textareaStyle}
            />
        </label>
    );
}

function SelectField({ label, name, value, onChange, required, options }) {
  return (
    <label style={{ display: "block", marginBottom: 15, marginTop: 10, position: 'relative', zIndex: 1  }}>
      {label}:
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{ ...inputStyle, height: '38px' ,
          zIndex: 1, }}
      >
        <option value="">-- Select Grievance Subject --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}


const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
    marginTop: 5,
    boxSizing: "border-box",
};

const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
};

const buttonStyle = {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 5,
    border: "none",
    color: "#fff",
    backgroundColor: "#000080",
    cursor: "pointer",
};
