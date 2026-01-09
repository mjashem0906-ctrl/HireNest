import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './MembersDetail.module.scss'
import API from '../../axios';
import { useData } from '../../context/DataContext';
import ReportDownloader from '../../components/Report/ReportDownloader';
import { parseDOB } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { Edit, ChevronDown, ChevronUp, Users } from 'lucide-react'; // Added Icons
import AddMember from '../../components/Models/AddMember';

function MembersDetail() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subTasks, setSubTasks] = useState([]);
    const [comments,setComments] = useState([]);
    const [assignFor,setAssignFor] = useState([]);
    
    // 👇 State for Jobs & Expanded Rows
    const [postedJobs, setPostedJobs] = useState([]);
    const [expandedJobIds, setExpandedJobIds] = useState([]);

    const {memberContext,subTaskContext,memberCommentsContext,assignForContext,userContext} = useData();
    const [age,setAge] = useState(null);
    const navigate = useNavigate();
    const [showModal, setShowModal]=useState(false);
    const [editingMember,setEditingMember]=useState(null);
    const {user} = useAuth();
    

    useEffect(()=>{
        fetchMember();
    }, [memberContext, id, subTaskContext, memberCommentsContext, assignForContext, userContext])


    const fetchMember = async()=>{
        try{
            let filtered;
            if(user.role==="Admin"){
                filtered = await memberContext.find(member=>String(member._id)===String(id));
            }
            if (user.role==="Member"){
                filtered = userContext;
            }
            
            setMember(filtered);
            if (filtered?.dateOfBirth) {
                const calculated = calculateAge(filtered.dateOfBirth);
                setAge(calculated);
            }
            
            fetchSubTask(id);
            fetchMemberComments(id);
            fetchAssignFor(id);
            fetchMemberJobs(id); // Fetch Jobs
            
            setLoading(false);
        }
        catch(err){
            console.error("Error in fetching Members",err);
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

    // 👇 Helper to Toggle Applicant View
    const toggleJobDetails = (jobId) => {
        setExpandedJobIds(prev => 
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    };

    // ... (Your existing fetch functions: fetchSubTask, fetchMemberComments, fetchAssignFor) ...
    const fetchSubTask = async(memberId)=>{ /* ... existing logic ... */ }
    const fetchMemberComments = async(memberId)=>{ /* ... existing logic ... */ }
    const fetchAssignFor = async(memberId)=>{ /* ... existing logic ... */ }

    const calculateAge = (dob) => { /* ... existing logic ... */ };
    const getStatusColor = (status) => { /* ... existing logic ... */ };
    const getStatusColor2 = (status) => { /* ... existing logic ... */ };

    const handleEdit = (member) => { setEditingMember(member); setShowModal(true); };
    const getDirectImageUrl = (driveUrl) => { /* ... existing logic ... */ };

    if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
    if (!member) return;

    return (
        <div className={styles.detailsContainer}>
            {/* Sidebar */}
            <div className={styles.profileSidebar}>
                 <img
                 src={member?.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
                 alt={member?.name}
                 className={styles.profilePhoto}
                 onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                />
                <h3>{member?.name}</h3>
                <p className='my-3'>Ref No. {member?.memberReferenceNumber}</p>
                <p className='my-3'>{member?.memberType}</p>
                <p className='my-3'>{member?.currentInstitutionOrCompany}</p>
                <p className='my-3'>{member?.district}</p>
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
                onSuccess={(updatedMember) => { setMember(updatedMember); }}
            />

            {/* Main Content */}
            <div className={styles.profileMain}>
                <h3>Personal Info</h3>
                <div className={styles.infoGrid}>
                  <div><strong>Age:</strong> {member.age ? `${member.age} Years` : "N/A"}</div>
                  <div><strong>Gender:</strong> {member?.gender || "N/A"}</div>
                  <div><strong>Mobile No:</strong> {member?.mobileNumber || "N/A"}</div>
                  <div><strong>Email:</strong> {member?.email || "N/A"}</div>
                  <div><strong>Member Status:</strong> {member?.symMemberStatus || "Active"}</div>
                  <div><strong>District:</strong> {member?.district || "N/A"}</div>
                  <div><strong>Address:</strong> {member?.address || "N/A"}</div>
                </div>

                <h3>Professional Info</h3>
                <div className={styles.infoGrid}>
                  {/* ... (Existing Professional Info Logic) ... */}
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
                    <div><strong>Member Need:</strong> {member?.seekerNeed}</div>
                    <div><strong>Highest Education:</strong> {member?.highest_education}</div>
                    <div><strong>Field of Study/Interest:</strong> {member?.fieldofStudy_Interest}</div>
                    <div><strong>Preferred Job Role/Sector:</strong> {member?.preferredJobRole_Sector}</div>
                    <div><strong>Work Experience:</strong> {member?.workExp}</div>
                    <div><strong>Relocation Status:</strong> {member?.relocationStatus}</div>
                    <div><strong>Preferred Job Location:</strong> {member?.preferredJobLocation}</div>
                    <div><strong>Resume Link:</strong> <a href={member?.resumeLink} target="_blank" rel="noopener noreferrer">{member?.resumeLink}</a></div>
                    </>
                  )}
                  {(member?.memberType === 'Oppurtunity Provider' || member?.memberType === 'Referee') && (
                    <>
                    <div><strong>Job Offer Type:</strong> {member?.jobOfferType || member?.referringOfferType}</div>
                    <div><strong>Offering Sector:</strong> {member?.offeringSector || member?.referringSector}</div>
                    <div><strong>Description:</strong> {member?.opportunityDescription}</div>
                    <div><strong>Offer Location:</strong> {member?.offer_Location}</div>
                    <div><strong>Contact:</strong> {member?.contactForSeekers || member?.referrerContact}</div>
                    </>
                  )}
                  {member?.memberType === 'In need of Upskilling' && (
                    <>
                    <div><strong>Interest in Skill Building Program:</strong> {member?.interest_SkillBuildingProgram}</div>
                    <div><strong>Skills to Improve:</strong> {member?.skillsToImprove}</div>
                    </>
                  )}
                </div>

                {/* 👇 UPDATED SECTION: Referred Jobs with Applicant Details */}
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
                                            {/* Main Job Row */}
                                            <tr style={{borderBottom: expandedJobIds.includes(job._id) ? 'none' : '1px solid #eee'}}>
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
                                                            padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#333',
                                                            border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', 
                                                            fontSize: '0.8rem', display:'flex', alignItems:'center', gap:'5px'
                                                        }}
                                                    >
                                                        {expandedJobIds.includes(job._id) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* 👇 THE NEW ROW: Shows Applicants & Status */}
                                            {expandedJobIds.includes(job._id) && (
                                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                                    <td colSpan="6" style={{ padding: '15px' }}>
                                                        <div style={{ marginLeft: '10px' }}>
                                                            <h5 style={{ margin: '0 0 10px 0', color:'#555', fontSize:'0.95rem' }}>Applicant Status:</h5>
                                                            
                                                            {job.appliedMembers?.length > 0 ? (
                                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize:'0.9rem', backgroundColor:'white', border:'1px solid #e5e7eb' }}>
                                                                    <thead>
                                                                        <tr style={{ borderBottom:'1px solid #eee', color:'#6b7280' }}>
                                                                            <th style={{ padding:'8px', textAlign:'left' }}>Name</th>
                                                                            <th style={{ padding:'8px', textAlign:'left' }}>Status</th>
                                                                            <th style={{ padding:'8px', textAlign:'left' }}>Applied Date</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {job.appliedMembers.map((app, idx) => (
                                                                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                                                <td style={{ padding:'8px' }}>{app.memberId?.name || "Unknown"}</td>
                                                                                <td style={{ padding:'8px' }}>
                                                                                    {/* Simple Badge Logic */}
                                                                                    <span style={{
                                                                                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight:'500',
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
                                                                                <td style={{ padding:'8px' }}>
                                                                                    {/* Assuming timestamp exists, else show N/A */}
                                                                                    {/* Note: appliedMembers array in DB usually needs a timestamp field if you want precise date */}
                                                                                    N/A
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
                {/* 👆 END UPDATED SECTION */}
                
                {/* ... (Existing Subtasks & AssignFor tables) ... */}
                {subTasks.length > 0 && (
                    <>
                        <h3>Related SubTasks</h3>
                         {/* ... table code ... */}
                    </>
                )}
                {/* ... */}
            </div>
        </div>
    );
}

export default MembersDetail;