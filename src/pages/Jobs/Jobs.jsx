import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './Jobs.module.scss';
import { BriefcaseBusiness, NotebookPen, Plus, Search, CheckCircle, XCircle, Clock, Loader, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import classNames from "classnames";
import ProvidedForm from './JobForm/ProvidedForm';
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';
import { useData } from '../../context/DataContext';

function Jobs() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [jobPosts, setJobPosts] = useState([]);
    const [myPost, setMyPost] = useState([]);
    const [view, setView] = useState('request');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showProvidedModal, setShowProvidedModal] = useState(false);
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

    // 2. NEW DELETE FUNCTION
    const handleDelete = async (jobId, e) => {
        e.stopPropagation(); // Stop the click from opening the details page
        
        if (!window.confirm("Are you sure you want to delete this job post?")) {
            return;
        }

        try {
            await API.delete(`/service/${jobId}`);
            
            // Remove the deleted job from the lists immediately
            setJobPosts(prev => prev.filter(job => job._id !== jobId));
            setMyPost(prev => prev.filter(job => job._id !== jobId));
            
            alert("Job deleted successfully");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete job. You might not have permission.");
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
            setJobPosts(jobContext);
        }
    };

    const handleStatusChange = async (jobId, memberId, newStatus) => {
        try {
            await API.patch(`/service/status`, {
                jobId,
                memberId,
                status: newStatus
            });
            
            alert(`Status updated to ${newStatus}`);
            fetchJobPosts(); 
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleAddProvided = async (jobData) => {
        try {
            const response = await API.post('/service', jobData);
            const savedJob = response.data.data || response.data;

            setJobPosts(prev => [...prev, savedJob]);
            if (user.role === 'Admin') {
                setMyPost(prev => [...prev, savedJob]);
            }
            
            setShowProvidedModal(false);
            alert("Job posted successfully!");
        } catch (error) {
            console.error("Error adding Job:", error);
            alert("Failed to save job.");
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

    const isApplied = (job) => {
        return checkIsApplied(job, user?.memberId);
    };

    const renderStatusBadge = (status) => {
        let styles = {
            bg: '#e0f2fe', color: '#0369a1', icon: <Clock size={16} />, text: 'Applied'
        };

        if (status === 'Shortlisted') {
            styles = { bg: '#fef3c7', color: '#d97706', icon: <Loader size={16} />, text: 'Shortlisted' };
        } else if (status === 'Accepted') {
            styles = { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={16} />, text: 'Accepted' };
        } else if (status === 'Rejected') {
            styles = { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={16} />, text: 'Rejected' };
        }

        return (
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                backgroundColor: styles.bg, color: styles.color, 
                padding: '6px 12px', borderRadius: '20px', 
                fontSize: '0.9rem', fontWeight: '600'
            }}>
                {styles.icon}
                <span>{styles.text}</span>
            </div>
        );
    };

    return (
        <div className={styles.jobs}>
            <div className={styles.header}>
                <div className={styles.cardSearch}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={globalFilter || ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>

                <div className={styles.center1}>
                    <div className={classNames(styles.center, { [styles.active]: view === "request", })} onClick={() => setView("request")} >
                        <NotebookPen size={35} />
                        <button className={styles.label}>Job Posts</button>
                    </div>
                    <div className={classNames(styles.center, { [styles.active]: view === "myPost", })} onClick={() => setView("myPost")}>
                        <BriefcaseBusiness size={35} />
                        <button className={styles.label}>My Jobs</button>
                    </div>
                </div>
                <div className={styles.right}></div>
            </div>

            {/* --- VIEW: JOB POSTS (ALL) --- */}
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
                                <div className={styles.details}>
                                    <h5 className={styles.title}>{request?.title}</h5>
                                    {request?.description && <p className={styles.description}>{request.description}</p>}
                                </div>
                                
                                {/* Right Side Actions: Apply (Member) OR Delete (Admin) */}
                                <div>
                                    {/* MEMBER VIEW: Apply Button */}
                                    {user.role === "Member" && (
                                        <button
                                            className={isApplied(request) ? styles.appliedButton : styles.applyButton}
                                            disabled={isApplied(request)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isApplied(request)) handleApply(request);
                                            }}
                                        >
                                            {isApplied(request) ? "Applied" : "Apply"}
                                        </button>
                                    )}

                                    {/* 3. ADMIN VIEW: Delete Button */}
                                    {user.role === "Admin" && (
                                        <button
                                            onClick={(e) => handleDelete(request._id, e)}
                                            title="Delete Post"
                                            style={{
                                                padding: '8px',
                                                color: '#ef4444', 
                                                backgroundColor: '#fee2e2', 
                                                borderRadius: '50%',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>

                                <div className={styles.timeInfo}>
                                    {request?.createdAt && !isNaN(new Date(request?.createdAt)) ? (
                                        <>
                                            {new Date(request?.createdAt).toLocaleDateString()}{' • '}
                                            {formatDistanceToNow(new Date(request?.createdAt), { addSuffix: true })}
                                        </>
                                    ) : <span>Just Now</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </>}

            {/* --- VIEW: MY JOBS (Conditional Rendering) --- */}
            {view === "myPost" && (
                <>
                    <div className={styles.pagination} style={{ marginBottom: 20, marginTop: 120 }}>
                         {/* Pagination controls... */}
                    </div>

                    <div className={styles.container}>
                        <h2 className={styles.heading}>
                            {user.role === 'Admin' ? "Manage Applications" : "My Applications"}
                        </h2>
                        
                        {myPost.length === 0 ? (
                            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                                {user.role === 'Admin' ? "No jobs posted yet." : "You haven't applied to any jobs yet."}
                            </p>
                        ) : (
                            <ul className={styles.activityList}>
                                {myPost.map((request) => (
                                    <li
                                        key={request._id}
                                        className={styles.activityItem}
                                        style={{ 
                                            cursor: 'default', 
                                            flexDirection: user.role === 'Admin' ? 'column' : 'row', 
                                            alignItems: user.role === 'Admin' ? 'flex-start' : 'center', 
                                            justifyContent: 'space-between',
                                            gap: '15px'
                                        }}
                                    >
                                        <div className={styles.details} onClick={() => handleClick(request)} style={{ cursor: 'pointer', width: user.role === 'Admin' ? '100%' : 'auto' }}>
                                            <h5 className={styles.title} style={{ fontSize: '1.2rem', margin: 0 }}>{request.title}</h5>
                                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                                                Posted on: {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {user.role === 'Admin' && (
                                            <div style={{ width: '100%', marginTop:'10px' }}>
                                                <h6 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                                    Applicants ({request.appliedMembers?.length || 0})
                                                </h6>
                                                {request.appliedMembers?.length > 0 ? (
                                                    <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                            <thead style={{ backgroundColor: '#f9fafb' }}>
                                                                <tr style={{ textAlign: 'left', color: '#4b5563' }}>
                                                                    <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                                                    <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                                                    <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {request.appliedMembers.map((app, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                                        <td style={{ padding: '10px' }}>{app.memberId?.name}</td>
                                                                        <td style={{ padding: '10px' }}>
                                                                            {renderStatusBadge(app.status || 'Applied')}
                                                                        </td>
                                                                        <td style={{ padding: '10px' }}>
                                                                            <select 
                                                                                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
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
                                                ) : <p style={{ fontStyle:'italic', color:'#888' }}>No applicants yet.</p>}
                                            </div>
                                        )}

                                        {user.role === 'Member' && (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {renderStatusBadge(getMyApplicationStatus(request))}
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
                <button className={styles.addButton1} onClick={() => setShowProvidedModal(true)}>
                    <Plus size={20} />
                </button>
            }

            <ProvidedForm
                isOpen={showProvidedModal}
                onClose={() => setShowProvidedModal(false)}
                onSubmit={handleAddProvided}
            />
        </div>
    );
}

export default Jobs;