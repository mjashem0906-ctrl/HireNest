import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Jobs.module.scss';
import { BriefcaseBusiness, NotebookPen, Plus, Search, CheckCircle, XCircle, Clock, Loader, Trash2, Pencil, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import classNames from "classnames";
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';
import { useData } from '../../context/DataContext';

// --- CONSTANTS ---
const EMPLOYMENT_TYPES = [
    "Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance"
];

// --- INTERNAL COMPONENT: ProvidedForm ---
const ProvidedForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    // State
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
            } else {
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
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            title, companyName, employmentType, location, description,
            education, passedOutYear, experience, salary, role, keySkills
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>{initialData ? 'Edit Job Post' : 'Create Job Post'}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label>Job Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Developer" required />

                    <div className={styles.formRow}>
                        <div>
                            <label>Company Name</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Infosys" />
                        </div>
                        <div>
                            <label>Job Role</label>
                            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. System Admin" />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div>
                            <label>Employment Type</label>
                            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                                {EMPLOYMENT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Location</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore" />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div>
                            <label>Experience Required</label>
                            <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 2-5 years" />
                        </div>
                        <div>
                            <label>Salary Range</label>
                            <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 4-6 LPA" />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div style={{ flex: 2 }}>
                            <label>Education</label>
                            <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.E / B.Tech" />
                        </div>
                        <div>
                            <label>Passed Out Year</label>
                            <input type="text" value={passedOutYear} onChange={(e) => setPassedOutYear(e.target.value)} placeholder="e.g. 2023" />
                        </div>
                    </div>

                    <label>Key Skills</label>
                    <input type="text" value={keySkills} onChange={(e) => setKeySkills(e.target.value)} placeholder="e.g. React, Node.js, SQL" />

                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the job role..." required />

                    <button type="submit" className={styles.submitBtn}>
                        {initialData ? 'Update Job Post' : 'Post Job'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: Jobs ---
function Jobs() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [jobPosts, setJobPosts] = useState([]);
    const [myPost, setMyPost] = useState([]);
    const [view, setView] = useState('request');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showProvidedModal, setShowProvidedModal] = useState(false);
    
    // Edit state
    const [editingJob, setEditingJob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const { jobContext } = useData();
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobPosts();
    }, [user, jobContext]);

    const handleClick = (job) => {
        navigate(`/jobs/${job._id}`);
    };

    // --- HELPER FUNCTIONS ---
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

    // --- EDIT & FORM HANDLERS ---
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
        try {
            const response = await API.patch(`/service/${editingJob._id}`, jobData);
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

    const handleFormSubmit = (formData) => {
        if (editingJob) {
            handleUpdateProvided(formData);
        } else {
            handleAddProvided(formData);
        }
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
        try {
            const response = await API.post('/service', jobData);
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

    // --- RENDER HELPERS ---
    const renderStatusBadge = (status) => {
        let badgeStyle = styles.applied;
        let icon = <Clock size={16} />;
        const statusKey = status ? status.toLowerCase() : 'applied';
        
        if (statusKey === 'shortlisted') {
            badgeStyle = styles.shortlisted;
            icon = <Loader size={16} />;
        } else if (statusKey === 'accepted') {
            badgeStyle = styles.accepted;
            icon = <CheckCircle size={16} />;
        } else if (statusKey === 'rejected') {
            badgeStyle = styles.rejected;
            icon = <XCircle size={16} />;
        }

        return (
            <div className={classNames(styles.statusBadge, badgeStyle)}>
                {icon} <span>{status}</span>
            </div>
        );
    };

    const renderAdminActionButtons = (request) => (
        <div className={styles.adminActions}>
            <button onClick={(e) => handleEditClick(e, request)} title="Edit Post" className={styles.btnEdit}>
                <Pencil size={20} />
            </button>
            <button onClick={(e) => handleDelete(request._id, e)} title="Delete Post" className={styles.btnDelete}>
                <Trash2 size={20} />
            </button>
        </div>
    );

    return (
        <div className={styles.jobs}>
            <div className={styles.header}>
                <div className={styles.cardSearch}>
                    <Search size={20} />
                    <input type="text" placeholder="Search..." value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)} />
                </div>
                <div className={styles.center1}>
                    <div 
                        className={classNames(styles.center, { [styles.active]: view === "request" })} 
                        onClick={() => setView("request")} 
                    >
                        <NotebookPen size={35} /> 
                        <button className={styles.label}>Job Posts</button>
                    </div>
                    <div 
                        className={classNames(styles.center, { [styles.active]: view === "myPost" })} 
                        onClick={() => setView("myPost")}
                    >
                        <BriefcaseBusiness size={35} /> 
                        <button className={styles.label}>My Jobs</button>
                    </div>
                </div>
                <div className={styles.right}></div>
            </div>

            {view === 'request' && <>
                <div className={styles.pagination}>
                    <button onClick={() => page > 1 && setPage(page-1)} disabled={page === 1}>Previous</button>
                    <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                    <button onClick={() => page < totalPages && setPage(page+1)} disabled={page === totalPages}>Next</button>
                </div>
                <div className={styles.container}>
                    <h2 className={styles.heading}>Job Posts</h2>
                    <ul className={styles.activityList}>
                        {jobPosts.map((request) => (
                            <li key={request?._id} className={styles.activityItem} onClick={() => handleClick(request)}>
                                <div className={styles.details}>
                                    <h5 className={styles.title}>{request?.title}</h5>
                                    <div className={styles.metaTags}>
                                        {request?.companyName && <span className={styles.company}>{request.companyName}</span>}
                                        {request?.location && <span>{request.location}</span>}
                                        {request?.employmentType && (
                                           <span className={styles.badge}>{request.employmentType}</span>
                                        )}
                                    </div>
                                    {request?.description && <p className={styles.description}>{request.description}</p>}
                                </div>
                                <div className={styles.sidebar}>
                                    <div className={styles.timeInfo}>
                                        {request?.createdAt && !isNaN(new Date(request?.createdAt)) ? (
                                            <>{new Date(request?.createdAt).toLocaleDateString()}{' • '}{formatDistanceToNow(new Date(request?.createdAt), { addSuffix: true })}</>
                                        ) : <span>Just Now</span>}
                                    </div>
                                    
                                    {user.role === "Member" && (
                                        <button 
                                            className={isApplied(request) ? styles.appliedButton : styles.applyButton} 
                                            disabled={isApplied(request)} 
                                            onClick={(e) => { e.stopPropagation(); if (!isApplied(request)) handleApply(request); }}
                                        >
                                            {isApplied(request) ? "Applied" : "Apply"}
                                        </button>
                                    )}
                                    {user.role === "Admin" && renderAdminActionButtons(request)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </>}

            {view === "myPost" && (
                <>
                    <div className={styles.pagination}></div>
                    <div className={styles.container}>
                        <h2 className={styles.heading}>{user.role === 'Admin' ? "Manage Applications" : "My Applications"}</h2>
                        {myPost.length === 0 ? (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>{user.role === 'Admin' ? "No jobs posted yet." : "You haven't applied to any jobs yet."}</p>
                        ) : (
                            <ul className={styles.activityList}>
                                {myPost.map((request) => (
                                    <li key={request._id} className={styles.activityItem} style={{ flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', cursor:'pointer' }}>
                                            <div className={styles.details} onClick={() => handleClick(request)}>
                                                <h5 className={styles.title}>{request.title}</h5>
                                                <div className={styles.metaTags}>
                                                    {request?.companyName && <span className={styles.company}>{request.companyName}</span>}
                                                    {request?.location && <span>{request.location}</span>}
                                                    {request?.employmentType && <span className={styles.badge}>{request.employmentType}</span>}
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>Posted on: {new Date(request.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            
                                            <div className={styles.sidebar}>
                                                {user.role === 'Admin' ? renderAdminActionButtons(request) : 
                                                 renderStatusBadge(getMyApplicationStatus(request))
                                                }
                                            </div>
                                        </div>

                                        {user.role === 'Admin' && (
                                            <div className={styles.applicantsSection}>
                                                <h6>Applicants ({request.appliedMembers?.length || 0})</h6>
                                                {request.appliedMembers?.length > 0 ? (
                                                    <div className={styles.tableWrapper}>
                                                        <table>
                                                            <thead>
                                                                <tr><th>Name</th><th>Status</th><th>Action</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {request.appliedMembers.map((app, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{app.memberId?.name}</td>
                                                                        <td>{renderStatusBadge(app.status || 'Applied')}</td>
                                                                        <td>
                                                                            <select 
                                                                                className={styles.statusSelect} 
                                                                                value={app.status || 'Applied'} 
                                                                                onChange={(e) => handleStatusChange(request._id, app.memberId?._id, e.target.value)}
                                                                            >
                                                                                <option value="Applied">Applied</option>
                                                                                <option value="Shortlisted">Shortlisted</option>
                                                                                <option value="Accepted">Accepted</option>
                                                                                <option value="Rejected">Rejected</option>
                                                                            </select>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : <p style={{ fontStyle:'italic', color:'#888', fontSize:'0.9rem' }}>No applicants yet.</p>}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}

            {user.role === "Admin" &&
                <button className={styles.addButton1} onClick={() => { setEditingJob(null); setShowProvidedModal(true); }}>
                    <Plus size={20} />
                </button>
            }

            <ProvidedForm
                isOpen={showProvidedModal}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                initialData={editingJob}
            />
        </div>
    );
}

export default Jobs;