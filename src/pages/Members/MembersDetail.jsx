//-----------------------20/01-----------------------------6.49----------------------------
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MembersDetail.module.scss';
import API from '../../axios';
import { useData } from '../../context/DataContext';
import { parseDOB } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { Edit, ChevronDown, ChevronUp, Users, FileText, Briefcase, Building } from 'lucide-react'; 
import AddMember from '../../components/Models/AddMember';

function MembersDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State for Jobs & Expanded Rows
    const [postedJobs, setPostedJobs] = useState([]);
    const [expandedJobIds, setExpandedJobIds] = useState([]);

    const { memberContext, userContext } = useData();
    const [age, setAge] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const { user } = useAuth();
    
    // Define Backend URL for local uploads
    const BACKEND_URL = "http://localhost:5000";

    useEffect(() => {
        fetchMember();
    }, [memberContext, id, userContext]);

    const fetchMember = async () => {
        try {
            let filtered = null;

            if (user?.role === "Admin") {
                filtered = memberContext.find(m => String(m._id) === String(id));
            } else if (user?.role === "Member") {
                filtered = userContext;
                // If user is viewing someone else's profile, find that specific member
                if (filtered?._id !== id && memberContext.length > 0) {
                    filtered = memberContext.find(m => String(m._id) === String(id));
                }
            }
            
            setMember(filtered);
            
            if (filtered?.dateOfBirth) {
                const calculated = calculateAge(filtered.dateOfBirth);
                setAge(calculated);
            }
            
            // Fetch related jobs
            if (filtered) fetchMemberJobs(filtered._id); 
            
        } catch (err) {
            console.error("Error in fetching Members", err);
        } finally {
            setLoading(false);
        }
    }

    const fetchMemberJobs = async (memberId) => {
        try {
            const res = await API.get('/service'); 
            const allJobs = res.data.data || res.data;
            const myJobs = allJobs.filter(job => 
                String(job.memberId?._id || job.memberId) === String(memberId)
            );
            setPostedJobs(myJobs);
        } catch (err) {
            console.error("Error fetching member jobs:", err);
        }
    };

    const toggleJobDetails = (jobId) => {
        setExpandedJobIds(prev => 
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    };

    const calculateAge = (dob) => {
        if (!dob) return;
        const birthDate = parseDOB(dob);
        if (!birthDate || isNaN(birthDate)) return;
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        if (days < 0) {
            months -= 1;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }
        return { years, months, days };
    };

    const handleEdit = (member) => { 
        setEditingMember(member); 
        setShowModal(true); 
    };
    
    // --- 1. Helper for Profile Images ---
    const getProfileImageUrl = (url) => {
        if (!url) return "/members/AnonymousImage.jpg";

        // Handle Local Uploads
        if (url.startsWith("uploads") || url.includes("\\")) {
            return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
        }

        // Handle Google Drive
        let fileId = null;
        let match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
        if (!fileId) { 
            match = url.match(/\/d\/([^/]+)/); 
            if (match) fileId = match[1]; 
        }
        if (!fileId) { 
            match = url.match(/uc\?id=([^&]+)/); 
            if (match) fileId = match[1]; 
        }
        if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(url)) { 
            fileId = url; 
        }
        
        if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}`;
        
        // If it's already a full internet link
        if (url.startsWith("http")) return url;
        
        return url;
    };

    // --- 2. Helper for Resumes/Files (Non-thumbnail) ---
    const getFileUrl = (url) => {
        if (!url) return null;
        
        // If it's already a full internet link
        if (url.startsWith("http") || url.startsWith("https")) return url;

        // Handle Local Uploads
        if (url.startsWith("uploads") || url.includes("\\")) {
            const cleanPath = url.replace(/\\/g, "/");
            const finalPath = cleanPath.startsWith("uploads/") ? cleanPath : `uploads/${cleanPath}`;
            return `${BACKEND_URL}/${finalPath}`;
        }

        return url;
    };

    // --- 3. Helper to safely render Arrays ---
    const safeRender = (value) => {
        if (Array.isArray(value)) {
            return value.filter(v => v).join(', ');
        }
        return value || "";
    };

    if (loading) {
        return (
            <div className={styles.app}>
                <div className={styles.loader}></div>
            </div>
        );
    }
    
    if (!member) {
        return (
            <div className={styles.detailsContainer}>
                <p>Member not found.</p>
            </div>
        );
    }

    // Handle both old and new data field names
    const displayPhoto = member.photo || member.photoUrl;
    const displayResume = member.resume || member.resumeLink;
    const displayAge = member.age || (age ? `${age.years} years` : "N/A");
    
    // Check if member is Referee type
    const isReferee = member?.memberType === 'Referee';

    return (
        <div className={styles.detailsContainer}>
            {/* Sidebar */}
            <div className={styles.profileSidebar}>
                 <img
                 src={getProfileImageUrl(displayPhoto)}
                 alt={member?.name}
                 className={styles.profilePhoto}
                 onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                />
                <h3>{member?.name}</h3>
                <p className='my-3'>Ref No. {member?.memberReferenceNumber || "N/A"}</p>
                <p className='my-3'>{member?.memberType || "N/A"}</p>
                
                {/* Show Occupation in sidebar if available */}
                {member?.occupation && (
                    <p className='my-3' style={{ color: '#4f46e5', fontWeight: '500' }}>
                        <Briefcase size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        {member.occupation}
                    </p>
                )}
                
                {/* Show Company Details in sidebar if available */}
                {member?.companyDetails && (
                    <p className='my-3' style={{ color: '#666', fontSize: '0.9rem' }}>
                        <Building size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        {member.companyDetails}
                    </p>
                )}
                
                <p className='my-3'>{member?.currentInstitutionOrCompany || "N/A"}</p>
                <p className='my-3'>{member?.district || "N/A"}</p>
            </div>
            
            {(user?.role === 'Admin' || user?.memberId === member?._id) && (
                <button className={styles.addButton1} onClick={() => handleEdit(member)}>
                    <Edit size={20} />
                </button>
            )}

            <AddMember
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editMember={editingMember}
                onSuccess={(updatedMember) => { 
                    setMember(updatedMember); 
                }}
            />

            {/* Main Content */}
            <div className={styles.profileMain}>
                <h3>Personal Info</h3>
                <div className={styles.infoGrid}>
                    <div><strong>Age:</strong> {displayAge}</div>
                    <div><strong>Gender:</strong> {member?.gender || "N/A"}</div>
                    <div><strong>Mobile No:</strong> {member?.mobileNumber || "N/A"}</div>
                    <div><strong>Email:</strong> {member?.email || "N/A"}</div>
                    
                    {/* Solidarity Member Status - Show for Referees */}
                    {isReferee ? (
                        <div><strong>Solidarity Member Status:</strong> {member?.referrerStatus || "Active"}</div>
                    ) : (
                        <div><strong>Solidarity Member Status:</strong> {member?.symMemberStatus || "Active"}</div>
                    )}
                    
                    <div><strong>District:</strong> {member?.district || "N/A"}</div>
                    <div><strong>Address:</strong> {member?.address || "N/A"}</div>
                    
                    {/* NEW: Occupation Field */}
                    {member?.occupation && (
                        <div>
                            <strong>Occupation:</strong> {member.occupation}
                        </div>
                    )}
                    
                    {/* NEW: Company Details Field */}
                    {member?.companyDetails && (
                        <div>
                            <strong>Company Details:</strong> {member.companyDetails}
                        </div>
                    )}
                </div>

                <h3>Professional Info</h3>
                <div className={styles.infoGrid}>
                    {member?.memberType === 'Mentor' && (
                        <>
                            <div><strong>Current Institution/Company:</strong> {member?.currentInstitutionOrCompany || "N/A"}</div>
                            <div><strong>Designation:</strong> {member?.designation || "N/A"}</div>
                            <div><strong>Expertise/Field:</strong> {member?.fieldofStudy_Interest || "N/A"}</div>
                            <div><strong>Experience:</strong> {member?.workExp ? `${member.workExp} Years` : "N/A"}</div>
                        </>
                    )}
                    
                    {member?.memberType === 'Job Seeker' && (
                        <>
                            <div><strong>Member Need:</strong> {safeRender(member?.seekerNeed)}</div>
                            <div><strong>Highest Education:</strong> {member?.highest_education || "N/A"}</div>
                            <div><strong>Field of Study/Interest:</strong> {member?.fieldofStudy_Interest || "N/A"}</div>
                            <div><strong>Preferred Job Role/Sector:</strong> {member?.preferredJobRole_Sector || "N/A"}</div>
                            <div><strong>Work Experience:</strong> {member?.workExp || "N/A"}</div>
                            <div><strong>Relocation Status:</strong> {member?.relocationStatus || "N/A"}</div>
                            <div><strong>Preferred Job Location:</strong> {member?.preferredJobLocation || "N/A"}</div>
                            <div>
                                <strong>Resume: </strong> 
                                {displayResume ? (
                                    <a 
                                        href={getFileUrl(displayResume)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginLeft: '8px',
                                            backgroundColor: '#4f46e5',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            border: 'none'
                                        }}
                                    >
                                        <FileText size={16} />
                                        View Resume
                                    </a>
                                ) : "N/A"}
                            </div>
                        </>
                    )}
                    
                    {member?.memberType === 'Opportunity Provider' && (
                        <>
                            <div><strong>Job Offer Type:</strong> {safeRender(member?.jobOfferType)}</div>
                            <div><strong>Offering Sector:</strong> {safeRender(member?.offeringSector)}</div>
                            <div><strong>Description:</strong> {member?.opportunityDescription || "N/A"}</div>
                            <div><strong>Offer Location:</strong> {member?.offer_Location || "N/A"}</div>
                            <div><strong>Contact:</strong> {member?.contactForSeekers || "N/A"}</div>
                        </>
                    )}
                    
                    {/* UPDATED: Referee specific fields */}
                    {member?.memberType === 'Referee' && (
                        <>
                            <div><strong>Job Offer Type:</strong> {safeRender(member?.referringOfferType)}</div>
                            <div><strong>Offering Sector:</strong> {safeRender(member?.referringSector)}</div>
                            <div><strong>Description:</strong> {member?.opportunityDescription || "N/A"}</div>
                            <div><strong>Offer Location:</strong> {member?.offer_Location || "N/A"}</div>
                            <div><strong>Contact:</strong> {member?.referrerContact || "N/A"}</div>
                            <div><strong>Referring For:</strong> {member?.referringFor || "N/A"}</div>
                            <div><strong>Level of Support:</strong> {member?.levelOfSupport || "N/A"}</div>
                            <div><strong>Referrer Status:</strong> {member?.referrerStatus || "Active"}</div>
                            
                            {/* Show Occupation and Company Details for Referees if not already shown in Personal Info */}
                            {!member?.occupation && member?.occupation && (
                                <div><strong>Occupation:</strong> {member.occupation}</div>
                            )}
                            
                            {!member?.companyDetails && member?.companyDetails && (
                                <div><strong>Company Details:</strong> {member.companyDetails}</div>
                            )}
                        </>
                    )}
                    
                    {member?.memberType === 'In need of Upskilling' && (
                        <>
                            <div><strong>Interest in Skill Building Program:</strong> {member?.interest_SkillBuildingProgram || "N/A"}</div>
                            <div><strong>Skills to Improve:</strong> {safeRender(member?.skillsToImprove)}</div>
                        </>
                    )}
                </div>

                {/* Referred Opportunities */}
                {postedJobs.length > 0 && (
                    <>
                        <h3 style={{ marginTop: '30px' }}>Referred Opportunities ({postedJobs.length})</h3>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Posted On</th>
                                        <th>Applicants</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postedJobs.map(job => (
                                        <React.Fragment key={job._id}>
                                            <tr style={{ borderBottom: expandedJobIds.includes(job._id) ? 'none' : '1px solid #eee' }}>
                                                <td style={{ fontWeight: '600' }}>{job.title}</td>
                                                <td>{job.companyName}</td>
                                                <td>{job.location}</td>
                                                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{ display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold', color: '#4f46e5'}}>
                                                        <Users size={16}/> {job.appliedMembers?.length || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => toggleJobDetails(job._id)}
                                                        style={{
                                                            padding: '6px 12px', 
                                                            backgroundColor: '#f3f4f6', 
                                                            color: '#333',
                                                            border: '1px solid #ccc', 
                                                            borderRadius: '4px', 
                                                            cursor: 'pointer', 
                                                            fontSize: '0.8rem', 
                                                            display:'flex', 
                                                            alignItems:'center', 
                                                            gap:'5px'
                                                        }}
                                                    >
                                                        {expandedJobIds.includes(job._id) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>

                                            {expandedJobIds.includes(job._id) && (
                                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                                    <td colSpan="6" style={{ padding: '15px' }}>
                                                        <div style={{ marginLeft: '10px' }}>
                                                            <h5 style={{ margin: '0 0 10px 0', color:'#555', fontSize:'0.95rem' }}>Applicant Status:</h5>
                                                            
                                                            {job.appliedMembers?.length > 0 ? (
                                                                <table style={{ 
                                                                    width: '100%', 
                                                                    borderCollapse: 'collapse', 
                                                                    fontSize:'0.9rem', 
                                                                    backgroundColor:'white', 
                                                                    border:'1px solid #e5e7eb' 
                                                                }}>
                                                                    <thead>
                                                                        <tr style={{ borderBottom:'1px solid #eee', color:'#6b7280' }}>
                                                                            <th style={{ padding:'8px', textAlign:'left' }}>Name</th>
                                                                            <th style={{ padding:'8px', textAlign:'left' }}>Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {job.appliedMembers.map((app, idx) => (
                                                                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                                                <td style={{ padding:'8px' }}>{app.memberId?.name || "Unknown"}</td>
                                                                                <td style={{ padding:'8px' }}>
                                                                                    <span style={{
                                                                                        padding: '2px 8px', 
                                                                                        borderRadius: '4px', 
                                                                                        fontSize: '0.8rem', 
                                                                                        fontWeight:'500',
                                                                                        backgroundColor: app.status === 'Accepted' ? '#dcfce7' : 
                                                                                                         app.status === 'Rejected' ? '#fee2e2' : 
                                                                                                         app.status === 'Shortlisted' ? '#fef3c7' : '#e0f2fe',
                                                                                        color: app.status === 'Accepted' ? '#166534' : 
                                                                                               app.status === 'Rejected' ? '#991b1b' : 
                                                                                               app.status === 'Shortlisted' ? '#d97706' : '#0369a1'
                                                                                    }}>
                                                                                        {app.status || 'Applied'}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p style={{ color:'#888', fontStyle:'italic', fontSize:'0.9rem' }}>No applicants yet.</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MembersDetail;