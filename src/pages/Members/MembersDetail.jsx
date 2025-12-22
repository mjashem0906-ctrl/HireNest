import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './MembersDetail.module.scss'
import API from '../../axios';
import { useData } from '../../context/DataContext';
import ReportDownloader from '../../components/Report/ReportDownloader';
import { parseDOB } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { Edit } from 'lucide-react';
import AddMember from '../../components/Models/AddMember';


function MembersDetail() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subTasks, setSubTasks] = useState([]);
    const [comments,setComments] = useState([]);
    const [assignFor,setAssignFor] = useState([]);
    const {memberContext,subTaskContext,memberCommentsContext,assignForContext,userContext} = useData();
    const [age,setAge] = useState(null);
    const navigate = useNavigate();
    const [showModal, setShowModal]=useState(false);
    const [editingMember,setEditingMember]=useState(null);
    const {user} = useAuth();
    

    useEffect(()=>{
        fetchMember();
  
        
    }
        ,[memberContext,id,subTaskContext,memberCommentsContext,assignForContext,userContext])


        const fetchMember = async()=>{
            try{
              let filtered;
           if(user.role==="Admin"){
            filtered =await memberContext.find(member=>String(member._id)===String(id));
            
           }
           if (user.role==="Member"){
               filtered =userContext;
           }
            
            setMember(filtered);
                  if (filtered?.dateOfBirth) {
                  const calculated = calculateAge(filtered.dateOfBirth);
                  setAge(calculated);
                }
            fetchSubTask( id);
            fetchMemberComments(id);
            fetchAssignFor(id);
            setLoading(false);
            
            }
           catch(err){
            console.error("Error in fetching Members",err);
            setLoading(false);
           }
        }

        const fetchSubTask = async(memberId)=>{
            try{
                const filteredSubTask = subTaskContext.filter(subtask =>
                        Array.isArray(subtask.assignedTo) &&
                        subtask.assignedTo.some(user => String(user._id) === String(memberId))
                        );

                setSubTasks(filteredSubTask);
                
            }
            catch(err){
                console.error("Error in fetching SubTasks", err)
            }
        }
        const fetchMemberComments = async(memberId)=>{
            try{
                const filteredComments = memberCommentsContext.filter(comment =>
                        String(comment?.memberId?._id) === String(memberId)
                        );

                setComments(filteredComments);
                
            }
            catch(err){
                console.error("Error in fetching comments", err)
            }
        }
        const fetchAssignFor = async(memberId)=>{
            try{
                const filteredAssignFor = assignForContext.filter(assignFor =>
                        Array.isArray(assignFor.assignedFor) &&
                        assignFor.assignedFor.some(user => String(user._id) === String(memberId))
                        );

                setAssignFor(filteredAssignFor);
                
            }
            catch(err){
                console.error("Error in fetching assign for", err)
            }
        }
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
         const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#1ef102ff';
      case 'in-progress': return '#3daae9ff';
      case 'planning': return '#fbff00ff';
      case 'on-hold': return '#f72525ff';
      case 'Assigned': return '#a5ee74ff';
      case 'dropped' : return '#f72525ff'
      default: return '#f0ab2cff';
    }
  };
  const getStatusColor2 = (status) => {
    switch (status) {
      case 'Invited': return '#f0ab2cff';
      case 'Not-Attended': return '#ff0000ff';
      case 'Attended': return '#1ef102ff';
      case 'Completed': return '#2bff00ff';
      case 'Permission': return '#0084ffff';
      case 'Not-Possible': return '#ff80f4ff';
      case 'Waiting': return '#ff8800ff';
      default: return '#f0ab2cff';
    }
  };

    const handleEdit = (member) => {
    setEditingMember(member); // force new reference
    setShowModal(true);
  };


const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;

  let fileId = null;

  // Case 1: id= in query params (open?id=FILE_ID, uc?id=FILE_ID, etc.)
  let match = driveUrl.match(/[?&]id=([^&]+)/);
  if (match) fileId = match[1];

  // Case 2: /d/{fileId}/ in path
  if (!fileId) {
    match = driveUrl.match(/\/d\/([^/]+)/);
    if (match) fileId = match[1];
  }

  // Case 3: uc?id=FILE_ID format
  if (!fileId) {
    match = driveUrl.match(/uc\?id=([^&]+)/);
    if (match) fileId = match[1];
  }

  // Case 4: direct fileId pasted (25+ chars, alphanumeric + _-)
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
    fileId = driveUrl;
  }

  // If still not found, return original link
  if (!fileId) return driveUrl;

  // Default: always return a working thumbnail link
  return `https://drive.google.com/thumbnail?id=${fileId}`;
};

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
                 onError={(e) => {
                  e.target.src = "/members/AnonymousImage.jpg";
                }}
                />
                <h3>{member?.name}</h3>
                <p className='my-3'>Ref No. {member?.memberReferenceNumber}</p>
                <p className='my-3'>{member?.memberType}</p>
                <p className='my-3'>{member?.currentInstitutionOrCompany}</p>
                <p className='my-3'>{member?.district}</p>
                
                
            </div>
            
           
        <button
          className={styles.addButton1}
          onClick={() => handleEdit(member)}
        >
          <Edit size={20} />
        </button>
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
                  <div><strong>Age:</strong> {member?.age}</div>
                  <div><strong>Gender:</strong> {member?.gender}</div>
                  <div><strong>Mobile No:</strong> {member?.mobileNumber}</div>
                  <div><strong>Email:</strong> {member?.email}</div>
                  <div><strong>Member Status:</strong> {member?.symMemberStatus} </div>
                </div>
                <h3>Professional Info</h3>
                <div className={styles.infoGrid}>
                  {/* seeker data */}
                  {member?.memberType === 'Job Seeker' && (
                    <>
                    <div><strong>Member Need:</strong> {member?.seekerNeed}</div>
                    <div><strong>Highest Education:</strong> {member?.highest_education}</div>
                    <div><strong>Field of Study/Interest:</strong> {member?.fieldofStudy_Interest}</div>
                    <div><strong>Preferred Job Role/Sector:</strong> {member?.preferredJobRole_Sector}</div>
                    <div><strong>Work Experience:</strong> {member?.workExp}</div>
                    <div><strong>Relocation Status:</strong> {member?.relocationStatus}</div>
                    <div><strong>Preferred Job Location:</strong> {member?.preferredJobLocation}</div>
                    <div>
                      <strong>Resume Link:</strong>{' '}
                      <a
                      href={member?.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      >
                        {member?.resumeLink}
                      </a>
                      </div>
                      </>
                    )}
                    
                  {/* Oppurtunity Provider */}
                  {member?.memberType === 'Oppurtunity Provider' && (
                    <>
                    <div><strong>Job Offer Type:</strong> {member?.jobOfferType}</div>
                    <div><strong>Offering Sector:</strong> {member?.offeringSector}</div>
                    <div><strong>Opportunity Description:</strong> {member?.opportunityDescription}</div>
                    <div><strong>Offer Location:</strong> {member?.offer_Location}</div>
                    <div><strong>Contact for Seekers:</strong> {member?.contactForSeekers}</div>
                      </>
                    )}
                    
                  {/* Referee */}
                  {member?.memberType === 'Referee' && (
                    <>
                    <div><strong>Referrer Status:</strong> {member?.referrerStatus}</div>
                    <div><strong>Referring Offer Type:</strong> {member?.referringOfferType}</div>
                    <div><strong>Referring Sector:</strong> {member?.referringSector}</div>
                    <div><strong>Offer Location:</strong> {member?.offer_Location}</div>
                    <div><strong>Referring For:</strong> {member?.referringFor}</div>
                    <div><strong>Level of Support:</strong> {member?.levelOfSupport}</div>
                    <div><strong>Referrer Contact:</strong> {member?.referrerContact}</div>
                    </>
                    )}
                                        
                  {/* Upskiller */}
                  {member?.memberType === 'In need of Upskilling' && (
                    <>
                    <div><strong>Interest in Skill Building Program:</strong> {member?.interest_SkillBuildingProgram}</div>
                    <div><strong>Skills to Improve:</strong> {member?.skillsToImprove}</div>
                    </>
                    )}

                    {/* null(job seeker if not member type not choosen in the form) */}
                  {member?.memberType === '' && (
                    <>
                    <div><strong>Member Need:</strong> {member?.seekerNeed}</div>
                    <div><strong>Highest Education:</strong> {member?.highest_education}</div>
                    <div><strong>Field of Study/Interest:</strong> {member?.fieldofStudy_Interest}</div>
                    <div><strong>Preferred Job Role/Sector:</strong> {member?.preferredJobRole_Sector}</div>
                    <div><strong>Work Experience:</strong> {member?.workExp}</div>
                    <div><strong>Relocation Status:</strong> {member?.relocationStatus}</div>
                    <div><strong>Preferred Job Location:</strong> {member?.preferredJobLocation}</div>
                    <div>
                      <strong>Resume Link:</strong>{' '}
                      <a
                      href={member?.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      >
                        {member?.resumeLink}
                      </a>
                      </div>
                      </>
                    )}
                </div>
                
                 {comments.length>0&&(
                    <>
                        <h3>About him</h3>
                       

                        <div  className={styles.tableContainer}>
                            <table className={styles.table}>
                            <thead>
                                <tr>
                                <th>Id</th>
                                <th>Comment</th>                  
                                </tr>
                            </thead>
                            <tbody>
                                {comments.map(comment => (
                                <tr key={comment._id}>
                                    <td >{comment?.customId}</td>
                                    <td>{comment?.comment}</td>
                                   
                                </tr>
                                ))}
                            </tbody>
                            </table>
                            </div>
                    </>)
                }
                      {subTasks.length>0&&(
                    <>
                        <h3>Related SubTasks</h3>
                         {/* Pass your data */}
                         <ReportDownloader data={subTasks}
                            title={`${member?.name} - SubTasks`}
                            memberData ={member}
                            columns={[
                                { header: "SubTask Id", key: "customId" },
                                { header: "Title", key: "title" },
                                { header: "Place", key: "place.place" },
                                // { header: "Type", key: "place.type" },
                                // { header: "Organisational Status", key: "place.organisationalStatus" },
                                { header: "Start Date", key: "startDate",type: "date"},
                                { header: "Deadline", key: "endDate",type: "date" },
                                { header: "Task", key: "taskId.title" },
                                { header: "Project", key: "projectId.title" },
                                { header: "Status", key: "status" },
                            ]} />

                            {/* <ReportDownloader data={subTasks} fileName="Members Report" /> */}

                        <div  className={styles.tableContainer}>
                            <table className={styles.table}>
                            <thead>
                                <tr>
                                <th>SubTask Id</th>
                                <th>SubTask</th>
                                <th>Place</th>
                                <th>Type</th>
                                <th>Organisational Status</th>
                                <th>Created At</th>
                                <th>DeadLine</th>
                                <th>Task</th>
                                <th>Project</th>
                                <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subTasks.map(subtask => (
                                <tr key={subtask._id}>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${subtask._id}`)}>{subtask.customId}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${subtask._id}`)}>{subtask.title}</td>
                                    <td style={{cursor:"pointer"}}>{subtask?.place?.place}</td>
                                    <td style={{cursor:"pointer"}}>{subtask?.place?.type}</td>
                                    <td style={{cursor:"pointer"}}>{subtask?.place?.organisationalStatus}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${subtask._id}`)}>{new Date(subtask?.startDate).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"short",
                                      year:"numeric"
                                    })}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${subtask._id}`)}>{new Date(subtask?.endDate).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"short",
                                      year:"numeric"
                                    })}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/task/${subtask.taskId._id}`)}>{subtask.taskId?.title}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/project/${subtask?.projectId._id}`)}>{subtask?.projectId?.title}</td>
                                     <td>
                                    <div className={styles.badges}>
                                    <span style={{ backgroundColor: getStatusColor(subtask.status) }}>{subtask.status}</span>
                                    </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                            </div>
                    </>)
                }

                  {assignFor.length>0&&(
                    <>
                        <h3>Related Assign For</h3>
                       

                        <div  className={styles.tableContainer}>
                            <table className={styles.table}>
                            <thead>
                                <tr>
                                <th>Id</th>
                                <th>SubTask</th>
                                <th>Task</th>
                                <th>Project</th>    
                                <th>Date</th>
                                <th>Status</th>
                                <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignFor.map(assignfor => (
                                <tr key={assignfor._id}>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/assignFor/${assignfor._id}`)}>{assignfor.customId}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${assignfor?.subTaskId._id}`)}>{assignfor?.subTaskId?.title}</td>
                                     <td style={{cursor:"pointer"}} onClick={()=>navigate(`/task/${assignfor?.taskId._id}`)}>{assignfor.taskId?.title}</td>
                                    <td style={{cursor:"pointer"}} onClick={()=>navigate(`/project/${assignfor?.projectId._id}`)}>{assignfor?.projectId?.title}</td>
                                    <td >{new Date(assignfor?.date).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"short",
                                      year:"numeric"
                                    })}</td>
                                     <td>
                                    <div className={styles.badges}>
                                    <span style={{ backgroundColor: getStatusColor2(assignfor?.status) }}>{assignfor?.status}</span>
                                    </div>
                                    </td>
                                     <td >{assignfor?.description}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                            </div>
                    </>)
                }
               
              
            </div>
        </div>
    );
 }

 export default MembersDetail