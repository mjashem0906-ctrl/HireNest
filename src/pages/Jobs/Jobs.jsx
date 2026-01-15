//-----------------------------------15/01-------------------------------------12.24
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Jobs.module.scss';
import { BriefcaseBusiness, NotebookPen, Plus, Search, CheckCircle, XCircle, Clock, Loader, Trash2, Pencil, X, FileText, User, Edit, Check, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import classNames from "classnames";
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';
import { useData } from '../../context/DataContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 👇 IMPORT THE PIPELINE COMPONENT
import StatusPipeline from './StatusPipeline'; 

const EMPLOYMENT_TYPES = [
    "Full-time",
    "Part-time",
    "Internship",
    "Remote",
    "Contract",
    "Freelance"
];

// =========================================================================================
// COMPONENT 1: BulkCSVReviewModal (Handles editing/reviewing CSV data before upload)
// =========================================================================================
const BulkCSVReviewModal = ({ isOpen, onClose, jobsData, onSave, onBulkSubmit, refereesList }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedJobs, setEditedJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [expandedRows, setExpandedRows] = useState({});
    const jobsPerPage = 5;

    useEffect(() => {
        if (isOpen && jobsData) {
            setEditedJobs([...jobsData]);
            setExpandedRows({});
        }
    }, [isOpen, jobsData]);

    if (!isOpen || !jobsData) return null;

    const totalPages = Math.ceil(editedJobs.length / jobsPerPage);
    const startIndex = currentPage * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const currentJobs = editedJobs.slice(startIndex, endIndex);

    const handleEdit = (index) => {
        setEditingIndex(startIndex + index);
    };

    const handleSaveEdit = (index) => {
        setEditingIndex(null);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        if (jobsData) {
            setEditedJobs([...jobsData]);
        }
    };

    const handleFieldChange = (pageIndex, field, value) => {
        const actualIndex = startIndex + pageIndex;
        const updatedJobs = [...editedJobs];
        updatedJobs[actualIndex] = {
            ...updatedJobs[actualIndex],
            [field]: value
        };
        setEditedJobs(updatedJobs);
    };

    const handleSaveAll = () => {
        onSave(editedJobs);
    };

    const handleSubmitAll = () => {
        onBulkSubmit(editedJobs);
    };

    const handleRemoveJob = (pageIndex) => {
        const actualIndex = startIndex + pageIndex;
        const updatedJobs = [...editedJobs];
        updatedJobs.splice(actualIndex, 1);
        setEditedJobs(updatedJobs);
        
        if (currentJobs.length === 1 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const toggleRowExpansion = (pageIndex) => {
        const actualIndex = startIndex + pageIndex;
        setExpandedRows(prev => ({
            ...prev,
            [actualIndex]: !prev[actualIndex]
        }));
    };

    // ... (Inline styles from original file preserved below for brevity)
    const modalStyles = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
        modal: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', width: '1100px', maxWidth: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 },
        stats: { backgroundColor: '#f3f4f6', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
        tableContainer: { flex: 1, overflowY: 'auto', marginBottom: '20px' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { backgroundColor: '#f9fafb', padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', color: '#374151', fontWeight: '600', fontSize: '0.875rem', position: 'sticky', top: 0 },
        td: { padding: '12px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' },
        input: { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' },
        select: { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', backgroundColor: 'white', cursor: 'pointer' },
        textarea: { width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', minHeight: '60px', resize: 'vertical', boxSizing: 'border-box' },
        actionButton: { padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: '500' },
        expandButton: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' },
        expandedRow: { backgroundColor: '#f8fafc', borderTop: '1px solid #e5e7eb' },
        expandedContent: { padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
        fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
        fieldLabel: { fontSize: '0.75rem', fontWeight: '600', color: '#4b5563' },
        pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #e5e7eb' },
        pageButton: { padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
        disabledButton: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
        footerButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
        saveButton: { padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' },
        submitButton: { padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' },
        cancelButton: { padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>Review & Edit CSV Jobs</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={modalStyles.stats}>
                    <span>Total Jobs: <strong>{editedJobs.length}</strong></span>
                    <span>Page: <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong></span>
                    <span>Editing: <strong>{editingIndex !== null ? 'Yes' : 'No'}</strong></span>
                </div>

                <div style={modalStyles.tableContainer}>
                    <table style={modalStyles.table}>
                        <thead>
                            <tr>
                                <th style={{ ...modalStyles.th, width: '20px' }}>#</th>
                                <th style={{ ...modalStyles.th, width: '160px' }}>Job Title</th>
                                <th style={{ ...modalStyles.th, width: '120px' }}>Company</th>
                                <th style={{ ...modalStyles.th, width: '80px' }}>Job Role</th>
                                <th style={{ ...modalStyles.th, width: '80px' }}>Type</th>
                                <th style={{ ...modalStyles.th, width: '100px' }}>Location</th>
                                <th style={{ ...modalStyles.th, width: '90px' }}>Experience</th>
                                <th style={{ ...modalStyles.th, width: '90px' }}>Salary</th>
                                <th style={{ ...modalStyles.th, width: '60px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentJobs.map((job, index) => {
                                const actualIndex = startIndex + index;
                                const isEditing = editingIndex === actualIndex;
                                const isExpanded = expandedRows[actualIndex];
                                
                                return (
                                    <React.Fragment key={actualIndex}>
                                        <tr>
                                            <td style={modalStyles.td}>{startIndex + index + 1}</td>
                                            <td style={modalStyles.td}>{isEditing ? <input style={modalStyles.input} value={job.title} onChange={(e) => handleFieldChange(index, 'title', e.target.value)} /> : job.title}</td>
                                            <td style={modalStyles.td}>{isEditing ? <input style={modalStyles.input} value={job.companyName} onChange={(e) => handleFieldChange(index, 'companyName', e.target.value)} /> : job.companyName}</td>
                                            <td style={modalStyles.td}>{isEditing ? <input style={modalStyles.input} value={job.role || ''} onChange={(e) => handleFieldChange(index, 'role', e.target.value)} /> : job.role || 'N/A'}</td>
                                            <td style={modalStyles.td}>
                                                {isEditing ? (
                                                    <select style={modalStyles.select} value={job.employmentType} onChange={(e) => handleFieldChange(index, 'employmentType', e.target.value)}>
                                                        {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                                    </select>
                                                ) : job.employmentType}
                                            </td>
                                            <td style={modalStyles.td}>{isEditing ? <input style={modalStyles.input} value={job.location} onChange={(e) => handleFieldChange(index, 'location', e.target.value)} /> : job.location}</td>
                                            <td style={modalStyles.td}>{isEditing ? <input style={modalStyles.input} value={job.experience} onChange={(e) => handleFieldChange(index, 'experience', e.target.value)} /> : job.experience}</td>
                                            <td style={modalStyles.td}>{isEditing ? <input style={modalStyles.input} value={job.salary} onChange={(e) => handleFieldChange(index, 'salary', e.target.value)} /> : job.salary}</td>
                                            <td style={modalStyles.td}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => handleSaveEdit(index)} style={{ ...modalStyles.actionButton, backgroundColor: '#10b981', color: 'white' }}><Check size={16} /></button>
                                                                <button onClick={handleCancelEdit} style={{ ...modalStyles.actionButton, backgroundColor: '#ef4444', color: 'white' }}><X size={16} /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleEdit(index)} style={{ ...modalStyles.actionButton, backgroundColor: '#3b82f6', color: 'white' }}><Edit size={16} /></button>
                                                                <button onClick={() => handleRemoveJob(index)} style={{ ...modalStyles.actionButton, backgroundColor: '#f3f4f6', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button onClick={() => toggleRowExpansion(index)} style={modalStyles.expandButton}>
                                                        {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />} {isExpanded ? 'Show Less' : 'Show More'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr style={modalStyles.expandedRow}>
                                                <td colSpan="9" style={modalStyles.td}>
                                                    <div style={modalStyles.expandedContent}>
                                                        <div style={modalStyles.fieldGroup}>
                                                            <label style={modalStyles.fieldLabel}>Education</label>
                                                            {isEditing ? <input style={modalStyles.input} value={job.education || ''} onChange={(e) => handleFieldChange(index, 'education', e.target.value)} /> : <div>{job.education || 'N/A'}</div>}
                                                        </div>
                                                        <div style={modalStyles.fieldGroup}>
                                                            <label style={modalStyles.fieldLabel}>Passed Out Year</label>
                                                            {isEditing ? <input style={modalStyles.input} value={job.passedOutYear || ''} onChange={(e) => handleFieldChange(index, 'passedOutYear', e.target.value)} /> : <div>{job.passedOutYear || 'N/A'}</div>}
                                                        </div>
                                                        <div style={modalStyles.fieldGroup}>
                                                            <label style={modalStyles.fieldLabel}>Key Skills</label>
                                                            {isEditing ? <input style={modalStyles.input} value={job.keySkills || ''} onChange={(e) => handleFieldChange(index, 'keySkills', e.target.value)} /> : <div>{job.keySkills || 'N/A'}</div>}
                                                        </div>
                                                        <div style={modalStyles.fieldGroup}>
                                                            <label style={modalStyles.fieldLabel}>Refereed Person (ID)</label>
                                                            {isEditing ? (
                                                                <select style={modalStyles.select} value={job.refereedBy || ''} onChange={(e) => handleFieldChange(index, 'refereedBy', e.target.value)}>
                                                                    <option value="">Select a Referee (Optional)</option>
                                                                    {refereesList && refereesList.map((referee) => (
                                                                        <option key={referee._id} value={referee._id}>{referee.name || referee.email || "Unknown Name"}</option>
                                                                    ))}
                                                                </select>
                                                            ) : <div>{job.refereedBy ? (refereesList?.find(r => r._id === job.refereedBy)?.name || 'Referee Selected') : 'None'}</div>}
                                                        </div>
                                                        <div style={modalStyles.fieldGroup}>
                                                            <label style={modalStyles.fieldLabel}>Description</label>
                                                            {isEditing ? <textarea style={modalStyles.textarea} value={job.description || ''} onChange={(e) => handleFieldChange(index, 'description', e.target.value)} /> : <div style={{ maxHeight: '120px', overflowY: 'auto' }}>{job.description || 'N/A'}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={modalStyles.pagination}>
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={currentPage === 0} style={{ ...modalStyles.pageButton, ...(currentPage === 0 && modalStyles.disabledButton) }}>
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={currentPage === totalPages - 1} style={{ ...modalStyles.pageButton, ...(currentPage === totalPages - 1 && modalStyles.disabledButton) }}>
                        Next <ChevronRight size={16} />
                    </button>
                </div>

                <div style={modalStyles.footerButtons}>
                    <button onClick={handleSaveAll} style={modalStyles.saveButton}>Save Changes</button>
                    <button onClick={handleSubmitAll} style={modalStyles.submitButton}>Submit All Jobs</button>
                    <button onClick={onClose} style={modalStyles.cancelButton}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

// =========================================================================================
// COMPONENT 2: ProvidedForm (Create/Edit Modal with CSV Upload)
// =========================================================================================
const ProvidedForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [education, setEducation] = useState('');
    const [passedOutYear, setPassedOutYear] = useState('');
    const [experience, setExperience] = useState('');
    const [salary, setSalary] = useState('');
    const [role, setRole] = useState('');
    const [keySkills, setKeySkills] = useState('');
    
    // Get Member Data for Referees
    const { memberContext } = useData(); 
    const [refereedBy, setRefereedBy] = useState('');
    const [refereesList, setRefereesList] = useState([]);

    useEffect(() => {
        if (memberContext) {
            const filtered = memberContext.filter(m => m.memberType === 'Referee');
            setRefereesList(filtered);
        }
    }, [memberContext]);

    // Initialize Form Data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setCompanyName(initialData.companyName || '');
                setEmploymentType(initialData.employmentType || EMPLOYMENT_TYPES[0]);
                setLocation(initialData.location || '');
                setDescription(initialData.description || '');
                setEducation(initialData.education || '');
                setPassedOutYear(initialData.passedOutYear || '');
                setExperience(initialData.experience || '');
                setSalary(initialData.salary || '');
                setRole(initialData.role || '');
                setKeySkills(initialData.keySkills || '');
                
                const refId = initialData.refereedBy && typeof initialData.refereedBy === 'object' 
                    ? initialData.refereedBy._id 
                    : (initialData.refereedBy || '');
                    
                setRefereedBy(refId);
            } else {
                // Reset
                setTitle('');
                setCompanyName('');
                setEmploymentType(EMPLOYMENT_TYPES[0]);
                setLocation('');
                setDescription('');
                setEducation('');
                setPassedOutYear('');
                setExperience('');
                setSalary('');
                setRole('');
                setKeySkills('');
                setRefereedBy('');
            }
        }
    }, [isOpen, initialData]);

    // --- CSV File Handling ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.split('\n').filter(row => row.trim() !== '');
            if (rows.length < 2) return alert("CSV is empty or invalid format");

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
            const bulkData = [];

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',').map(v => v.trim());
                const entry = {};
                headers.forEach((header, index) => {
                    entry[header] = values[index] || "";
                });
                
                bulkData.push({
                    title: entry.title,
                    companyName: entry.companyname || entry.companyName || "",
                    role: entry.role || "",
                    employmentType: entry.employmenttype || entry.employmentType || "Full-time",
                    location: entry.location || "",
                    experience: entry.experience || "",
                    salary: entry.salary || "",
                    education: entry.education || "",
                    passedOutYear: entry.passedoutyear || entry.passedOutYear || "",
                    keySkills: entry.keyskills || entry.keySkills || "",
                    description: entry.description || "",
                    refereedBy: "" 
                });
            }

            if (bulkData.length === 1) {
                // Scenario 1: Only one job - auto-fill the form
                const job = bulkData[0];
                setTitle(job.title);
                setCompanyName(job.companyName);
                setRole(job.role);
                setEmploymentType(job.employmentType);
                setLocation(job.location);
                setExperience(job.experience);
                setSalary(job.salary);
                setEducation(job.education);
                setPassedOutYear(job.passedOutYear);
                setKeySkills(job.keySkills);
                setDescription(job.description);
                setRefereedBy('');
                alert("Data loaded into form. Review and click Post.");
            } else {
                // Scenario 2: Multiple jobs - Trigger bulk upload with review modal
                onSubmit(bulkData, true);
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            title, companyName, employmentType, location, description,
            education, passedOutYear, experience, salary, role, keySkills,
            refereedBy: refereedBy || null 
        }, false);
    };

    if (!isOpen) return null;

    const modalStyles = {
        overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '600px', maxWidth: '90%', position: 'relative', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', maxHeight: '90vh', overflowY: 'auto' },
        label: { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px', color: '#374151' },
        input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box' },
        select: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '15px', backgroundColor: 'white', cursor: 'pointer', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '80px', resize: 'vertical', marginBottom: '15px', boxSizing: 'border-box' },
        button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '10px' },
        csvButton: { width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' },
        row: { display: 'flex', gap: '15px' }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#111827' }}>{initialData ? 'Edit Job Post' : 'Create Job Post'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* CSV Upload Section */}
                {!initialData && (
                    <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px', paddingBottom: '10px' }}>
                        <input type="file" accept=".csv" id="csv-upload" style={{ display: 'none' }} onChange={handleFileChange} />
                        <label htmlFor="csv-upload" style={modalStyles.csvButton}>
                            <FileText size={18} /> Upload CSV Format
                        </label>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Job Title */}
                    <label style={modalStyles.label}>Job Title *</label>
                    <input style={modalStyles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Developer" required />

                    {/* Company & Role */}
                    <div style={modalStyles.row}>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Company Name</label>
                            <input style={modalStyles.input} type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Job Role</label>
                            <input style={modalStyles.input} type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. System Admin" />
                        </div>
                    </div>

                    {/* Employment Type & Location */}
                    <div style={modalStyles.row}>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Employment Type</label>
                            <select style={modalStyles.select} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                                {EMPLOYMENT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Location</label>
                            <input style={modalStyles.input} type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore" />
                        </div>
                    </div>

                    {/* Experience & Salary */}
                    <div style={modalStyles.row}>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Experience</label>
                            <input style={modalStyles.input} type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 2-5 Years" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Salary</label>
                            <input style={modalStyles.input} type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 4-6 LPA" />
                        </div>
                    </div>

                    {/* Education & Year */}
                    <div style={modalStyles.row}>
                        <div style={{ flex: 2 }}>
                            <label style={modalStyles.label}>Education</label>
                            <input style={modalStyles.input} type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.E / B.Tech" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={modalStyles.label}>Passout Year</label>
                            <input style={modalStyles.input} type="text" value={passedOutYear} onChange={(e) => setPassedOutYear(e.target.value)} placeholder="e.g. 2023" />
                        </div>
                    </div>

                    {/* REFEREED PERSON DROPDOWN */}
                    <label style={modalStyles.label}>Refereed Person (Optional)</label>
                    <select 
                        style={modalStyles.select} 
                        value={refereedBy} 
                        onChange={(e) => setRefereedBy(e.target.value)}
                    >
                        <option value="">Select a Referee (Optional)</option>
                        {refereesList.length > 0 ? (
                            refereesList.map((referee) => (
                                <option key={referee._id} value={referee._id}>
                                    {referee.name || referee.email || "Unknown Name"}
                                </option>
                            ))
                        ) : (
                            <option disabled>No referees found</option>
                        )}
                    </select>

                    {/* Skills */}
                    <label style={modalStyles.label}>Key Skills</label>
                    <input style={modalStyles.input} type="text" value={keySkills} onChange={(e) => setKeySkills(e.target.value)} placeholder="e.g. React, Node.js, SQL" />
                    
                    {/* Description */}
                    <label style={modalStyles.label}>Description</label>
                    <textarea style={modalStyles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the job role..." required />

                    <button type="submit" style={modalStyles.button}>
                        {initialData ? 'Update Job' : 'Post Job'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// =========================================================================================
// MAIN COMPONENT: Jobs
// =========================================================================================
function Jobs() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [jobPosts, setJobPosts] = useState([]);
    const [myPost, setMyPost] = useState([]);
    const [view, setView] = useState('request');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showProvidedModal, setShowProvidedModal] = useState(false);
    
    // Bulk CSV Modal States
    const [showBulkReviewModal, setShowBulkReviewModal] = useState(false);
    const [bulkReviewJobs, setBulkReviewJobs] = useState([]);
    
    // Edit state
    const [editingJob, setEditingJob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const { jobContext, memberContext } = useData();
    const navigate = useNavigate();

    // Referees List
    const [refereesList, setRefereesList] = useState([]);

    // Backend URL for Local file serving
    const BACKEND_URL = "http://localhost:5000";

    useEffect(() => {
        if (memberContext) {
            const filtered = memberContext.filter(m => m.memberType === 'Referee');
            setRefereesList(filtered);
        }
    }, [memberContext]);

    useEffect(() => {
        fetchJobPosts();
    }, [user, jobContext]);

    const handleClick = (job) => {
        navigate(`/jobs/${job._id}`);
    };

    // --- HELPER: FILE URL ---
    const getFileUrl = (url) => {
        if (!url) return "#";
        // Handle Local Uploads vs Cloud links
        if (url.startsWith("uploads") || url.includes("\\")) {
            return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
        }
        return url;
    };

    // --- CRUD OPERATIONS ---

    const handleDelete = async (jobId, e) => {
        e.stopPropagation(); 
        if (!window.confirm("Are you sure you want to delete this job post?")) return;

        try {
            await API.delete(`/service/${jobId}`);
            setJobPosts(prev => prev.filter(job => job._id !== jobId));
            setMyPost(prev => prev.filter(job => job._id !== jobId));
            alert("Job deleted successfully");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete job.");
        }
    };

    const checkIsApplied = (job, userId) => {
        if (!job.appliedMembers || !userId) return false;
        return job.appliedMembers.some(
            app => String(app.memberId?._id || app.memberId) === String(userId)
        );
    };

    const getMyApplicationStatus = (job) => {
        if (!job.appliedMembers || !user?.memberId) return null;
        const application = job.appliedMembers.find(
            app => String(app.memberId?._id || app.memberId) === String(user.memberId)
        );
        return application ? application.status || "Applied" : null;
    };

    const getPipelineStatus = (dbStatus) => {
        switch (dbStatus) {
            case 'Applied': return 'Submitted';
            case 'Review': return 'Review';
            case 'Shortlisted': return 'Interview'; 
            case 'Offer': return 'Offer';
            case 'Accepted': return 'Hired';
            case 'Rejected': return 'Rejected';
            default: return 'Submitted';
        }
    };

    // --- EDIT & MODAL HANDLERS ---

    const handleEditClick = (e, job) => {
        e.stopPropagation();
        setEditingJob(job);
        setShowProvidedModal(true);
    };

    const handleCloseModal = () => {
        setShowProvidedModal(false);
        setEditingJob(null);
    };

    const handleUpdateProvided = async (jobData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const dataToSend = {
            ...jobData,
            refereedBy: jobData.refereedBy || null
        };

        try {
            const response = await API.patch(`/service/${editingJob._id}`, dataToSend);
            const updatedJob = response.data.data || response.data;

            setJobPosts(prev => prev.map(job => (job._id === updatedJob._id ? updatedJob : job)));
            setMyPost(prev => prev.map(job => (job._id === updatedJob._id ? updatedJob : job)));
            
            alert("Job updated successfully!");
            handleCloseModal();
        } catch (error) {
            console.error("Error updating Job:", error);
            alert("Failed to update job.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- BULK CSV HANDLERS ---
    const handleBulkCSVUpload = (data) => {
        setBulkReviewJobs(data);
        setShowBulkReviewModal(true);
    };

    const handleSaveBulkJobs = (editedJobs) => {
        setBulkReviewJobs(editedJobs);
        alert(`Saved ${editedJobs.length} jobs. Ready to submit.`);
    };

    const handleSubmitBulkJobs = async (editedJobs) => {
        if (!editedJobs.length) return;
        
        setIsSubmitting(true);
        try {
            const jobsToSubmit = editedJobs.map(job => ({
                ...job,
                refereedBy: job.refereedBy || null
            }));
            
            const uploadPromises = jobsToSubmit.map(job => API.post('/service', job));
            await Promise.all(uploadPromises);
            
            alert(`${editedJobs.length} jobs uploaded successfully!`);
            fetchJobPosts();
            setShowBulkReviewModal(false);
        } catch (error) {
            alert("Error during bulk upload. Some jobs may not have posted.");
            console.error(error);
            fetchJobPosts();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = async (data, isBulk = false) => {
        if (isBulk) {
            // Show bulk review modal instead of immediate posting
            handleBulkCSVUpload(data);
        } else {
            if (editingJob) {
                handleUpdateProvided(data);
            } else {
                handleAddProvided(data);
            }
        }
    };

    // --- EXPORT HANDLERS ---

    const buildJobsExportRows = () => {
        const source = view === "myPost" ? myPost : jobPosts;

        return source
            .filter(job => {
            const search = globalFilter.toLowerCase();
            return (
                job.title?.toLowerCase().includes(search) ||
                job.companyName?.toLowerCase().includes(search) ||
                job.location?.toLowerCase().includes(search)
            );
            })
            .map(j => ({
            JobTitle: j.title || "",
            CompanyName: j.companyName || "",
            EmploymentType: j.employmentType || "",
            Location: j.location || "",
            Role: j.role || "",
            Education: j.education || "",
            Experience: j.experience || "",
            Salary: j.salary || "",
            PassoutYear: j.passedOutYear || "",
            KeySkills: j.keySkills || "",
            RefereedBy: j.refereedBy?.name || "",
            Description: j.description || "",
            PostedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "",
            Applicants: j.appliedMembers?.length || 0
            }));
    };

    const exportJobsToExcel = () => {
        const data = buildJobsExportRows();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Jobs");

        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer]), `Jobs_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const exportJobsToCSV = () => {
        const data = buildJobsExportRows();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);

        saveAs(
            new Blob([csv], { type: "text/csv;charset=utf-8;" }),
            `Jobs_${new Date().toISOString().slice(0,10)}.csv`
        );
    };

    // --- API CALLS ---

    const fetchJobPosts = async () => {
        try {
            const res = await API.get('/service');
            const allJobs = res.data.data;
            setJobPosts(allJobs);

            if (user) {
                if (user.role === 'Admin') {
                    const adminJobs = allJobs.filter(job => 
                        String(job.memberId?._id || job.memberId) === String(user.memberId)
                    );
                    setMyPost(adminJobs);
                } else {
                    const myApplications = allJobs.filter(job => 
                        checkIsApplied(job, user.memberId)
                    );
                    setMyPost(myApplications);
                }
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            if (jobContext && jobContext.length > 0) setJobPosts(jobContext);
        }
    };

    const handleStatusChange = async (jobId, memberId, newStatus) => {
        try {
            await API.patch(`/service/status`, { jobId, memberId, status: newStatus });
            alert(`Status updated to ${newStatus}`);
            fetchJobPosts(); 
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleAddProvided = async (jobData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const dataToSend = {
            ...jobData,
            refereedBy: jobData.refereedBy || null
        };

        try {
            const response = await API.post('/service', dataToSend);
            const newJob = response.data.data || response.data;

            setJobPosts(prev => [newJob, ...prev]);
            
            if (user.role === 'Admin') {
                setMyPost(prev => [newJob, ...prev]);
            }
            
            handleCloseModal();
            alert("Job posted successfully!");

        } catch (error) {
            console.error("Error adding Job:", error);
            alert("Failed to save job.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApply = async (job) => {
        try {
            await API.post(`/service/${job._id}/apply`);
            alert("Applied successfully");
            fetchJobPosts(); 
        } catch (error) {
            alert(error.response?.data?.message || "Failed to apply");
        }
    };

    const isApplied = (job) => checkIsApplied(job, user?.memberId);

    const renderStatusBadge = (status) => {
        let styles = { bg: '#e0f2fe', color: '#0369a1', icon: <Clock size={16} />, text: 'Applied' };
        if (status === 'Review') styles = { bg: '#f3e8ff', color: '#7e22ce', icon: <NotebookPen size={16} />, text: 'Under Review' };
        else if (status === 'Shortlisted') styles = { bg: '#fef3c7', color: '#d97706', icon: <Loader size={16} />, text: 'Shortlisted' };
        else if (status === 'Offer') styles = { bg: '#ccfbf1', color: '#0f766e', icon: <BriefcaseBusiness size={16} />, text: 'Offer Sent' };
        else if (status === 'Accepted') styles = { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={16} />, text: 'Accepted' };
        else if (status === 'Rejected') styles = { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={16} />, text: 'Rejected' };

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: styles.bg, color: styles.color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                {styles.icon} <span>{styles.text}</span>
            </div>
        );
    };

    const renderAdminActionButtons = (request) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={(e) => handleEditClick(e, request)} title="Edit Post" style={{ padding: '8px', color: '#2563eb', backgroundColor: '#dbeafe', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pencil size={20} />
            </button>
            <button onClick={(e) => handleDelete(request._id, e)} title="Delete Post" style={{ padding: '8px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} />
            </button>
        </div>
    );

    return (
        <div className={styles.jobs}>
            <div className={styles.header}>
                {/* EXPORT BUTTONS (New Feature) */}
                {user?.role === 'Admin' && (
                    <div className={styles.exportButtons} style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={exportJobsToExcel} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>Export Excel</button>
                        <button onClick={exportJobsToCSV} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>Export CSV</button>
                    </div>
                )}

                <div className={styles.cardSearch}>
                    <Search size={20} />
                    <input type="text" placeholder="Search..." value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)} />
                </div>
                <div className={styles.center1}>
                    <div className={classNames(styles.center, { [styles.active]: view === "request", })} onClick={() => setView("request")} >
                        <NotebookPen size={35} /> <button className={styles.label}>Job Posts</button>
                    </div>
                    <div className={classNames(styles.center, { [styles.active]: view === "myPost", })} onClick={() => setView("myPost")}>
                        <BriefcaseBusiness size={35} /> <button className={styles.label}>My Jobs</button>
                    </div>
                </div>
                <div className={styles.right}></div>
            </div>

            {/* VIEW 1: JOB REQUESTS (Public/All) */}
            {view === 'request' && <>
                <div className={styles.pagination} style={{ marginBottom: 20, marginTop: 120 }}>
                    <button onClick={() => page > 1 && setPage(page-1)} disabled={page === 1}>Previous</button>
                    <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                    <button onClick={() => page < totalPages && setPage(page+1)} disabled={page === totalPages}>Next</button>
                </div>
                <div className={styles.container}>
                    <h2 className={styles.heading}>Job Posts</h2>
                    <ul className={styles.activityList}>
                        {jobPosts.map((request) => (
                            <li key={request?._id} className={styles.activityItem} style={{ cursor: 'pointer' }} onClick={() => handleClick(request)}>
                                <div className={styles.details} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                    <h5 className={styles.title} style={{ marginBottom: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}>{request?.title}</h5>
                                    
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
                                        {request?.companyName && (
                                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                                {request.companyName}
                                            </span>
                                        )}
                                        {request?.location && (
                                            <span>
                                                {request.location}
                                            </span>
                                        )}
                                        {request?.employmentType && (
                                             <span style={{ 
                                                backgroundColor: '#e0e7ff', color: '#3730a3', 
                                                padding: '2px 8px', borderRadius: '4px', 
                                                fontSize: '0.8rem', fontWeight: '500' 
                                            }}>
                                                {request.employmentType}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {request?.refereedBy && (
                                        <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', color:'#4b5563', marginBottom:'5px' }}>
                                            <User size={14} />
                                            <span>
                                                Refereed by: <strong>{request.refereedBy.name || "Unknown"}</strong>
                                            </span>
                                        </div>
                                    )}

                                    {request?.description && <p className={styles.description} style={{ margin: 0, marginTop: '5px' }}>{request.description}</p>}
                                </div>
                                <div>
                                    {user.role === "Member" && (
                                        <button className={isApplied(request) ? styles.appliedButton : styles.applyButton} disabled={isApplied(request)} onClick={(e) => { e.stopPropagation(); if (!isApplied(request)) handleApply(request); }}>
                                            {isApplied(request) ? "Applied" : "Apply"}
                                        </button>
                                    )}
                                    {user.role === "Admin" && renderAdminActionButtons(request)}
                                </div>
                                <div className={styles.timeInfo}>
                                    {request?.createdAt && !isNaN(new Date(request?.createdAt)) ? (
                                        <>{new Date(request?.createdAt).toLocaleDateString()}{' • '}{formatDistanceToNow(new Date(request?.createdAt), { addSuffix: true })}</>
                                    ) : <span>Just Now</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </>}

            {/* VIEW 2: MY POSTS / ADMIN VIEW */}
            {view === "myPost" && (
                <>
                    <div className={styles.pagination} style={{ marginBottom: 20, marginTop: 120 }}></div>
                    <div className={styles.container}>
                        <h2 className={styles.heading}>{user.role === 'Admin' ? "Manage Applications" : "My Applications"}</h2>
                        {myPost.length === 0 ? (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>{user.role === 'Admin' ? "No jobs posted yet." : "You haven't applied to any jobs yet."}</p>
                        ) : (
                            <ul className={styles.activityList}>
                                {myPost.map((request) => {
                                    const myStatus = getMyApplicationStatus(request);
                                    const pipelineStatus = getPipelineStatus(myStatus);

                                    return (
                                        <li key={request._id} className={styles.activityItem} style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: '15px' }}>
                                            <div className={styles.details} style={{ cursor: 'pointer', width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                                    
                                                    <div onClick={() => handleClick(request)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                                        <h5 className={styles.title} style={{ fontSize: '1.2rem', margin: 0, marginBottom: '5px' }}>{request.title}</h5>
                                                        
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
                                                            {request?.companyName && <span style={{ fontWeight: '600', color: '#1f2937' }}>{request.companyName}</span>}
                                                            {request?.location && <span>{request.location}</span>}
                                                            {request?.employmentType && <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>{request.employmentType}</span>}
                                                        </div>

                                                        {request?.refereedBy && (
                                                            <div style={{ fontSize:'0.85rem', color:'#4b5563' }}>
                                                                Refereed by: <strong>{request.refereedBy.name || "Unknown"}</strong>
                                                            </div>
                                                        )}

                                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Posted on: {new Date(request.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    {user.role === 'Admin' && renderAdminActionButtons(request)}
                                                </div>
                                            </div>
                                            
                                            {/* MEMBER VIEW: Pipeline */}
                                            {user.role === 'Member' && (
                                                <div style={{ width: '100%', borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
                                                     {myStatus === 'Rejected' ? (
                                                        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', textAlign: 'center' }}>
                                                            Application Rejected
                                                        </div>
                                                     ) : (
                                                        <StatusPipeline status={pipelineStatus} />
                                                     )}
                                                </div>
                                            )}

                                            {/* ADMIN VIEW: Applicants Table */}
                                            {user.role === 'Admin' && (
                                                <div style={{ width: '100%', marginTop:'10px' }}>
                                                    <h6 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '10px' }}>Applicants ({request.appliedMembers?.length || 0})</h6>
                                                    {request.appliedMembers?.length > 0 ? (
                                                        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                                <thead style={{ backgroundColor: '#f9fafb' }}>
                                                                    <tr style={{ textAlign: 'left', color: '#4b5563' }}>
                                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Resume</th> {/* 👈 Resume Column */}
                                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {request.appliedMembers.map((app, idx) => (
                                                                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                                            <td style={{ padding: '10px' }}>{app.memberId?.name}</td>
                                                                            <td style={{ padding: '10px' }}>
                                                                                {app.memberId?.resumeLink ? (
                                                                                    <a 
                                                                                        href={getFileUrl(app.memberId.resumeLink)} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer"
                                                                                        style={{ color: '#2563eb', textDecoration: 'underline', display:'flex', alignItems:'center', gap:'5px' }}
                                                                                    >
                                                                                        <FileText size={14} /> View
                                                                                    </a>
                                                                                ) : (
                                                                                    <span style={{ color: '#9ca3af', fontStyle:'italic' }}>No Resume</span>
                                                                                )}
                                                                            </td>
                                                                            <td style={{ padding: '10px' }}>{renderStatusBadge(app.status || 'Applied')}</td>
                                                                            <td style={{ padding: '10px' }}>
                                                                                <select style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={app.status || 'Applied'} onChange={(e) => handleStatusChange(request._id, app.memberId?._id, e.target.value)}>
                                                                                    <option value="Applied">Applied</option>
                                                                                    <option value="Review">Review</option>
                                                                                    <option value="Shortlisted">Shortlisted</option>
                                                                                    <option value="Offer">Offer</option>
                                                                                    <option value="Accepted">Accepted</option>
                                                                                    <option value="Rejected">Rejected</option>
                                                                                </select>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : <p style={{ fontStyle:'italic', color:'#888' }}>No applicants yet.</p>}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </>
            )}

            {/* ADD BUTTON (Admin Only) */}
            {user.role === "Admin" &&
                <button className={styles.addButton1} onClick={() => { setEditingJob(null); setShowProvidedModal(true); }}>
                    <Plus size={20} />
                </button>
            }

            {/* MODALS */}
            <ProvidedForm
                isOpen={showProvidedModal}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                initialData={editingJob}
            />

            <BulkCSVReviewModal
                isOpen={showBulkReviewModal}
                onClose={() => setShowBulkReviewModal(false)}
                jobsData={bulkReviewJobs}
                onSave={handleSaveBulkJobs}
                onBulkSubmit={handleSubmitBulkJobs}
                refereesList={refereesList}
            />

            {/* LOADING OVERLAY */}
            {isSubmitting && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Loader className="animate-spin" /> <span>Processing data, please wait...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Jobs;