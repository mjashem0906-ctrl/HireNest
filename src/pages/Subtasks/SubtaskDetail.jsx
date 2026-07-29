import { useAuth } from '../../context/AuthContext';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import API from '../../axios';
import styles from './SubtaskDetail.module.scss'
import { Plus, List, Calendar, Flag, CheckSquare, User, Edit, Trash2, ListFilter,Tags, LandPlot, Split } from 'lucide-react';
import CustomCard from '../../components/UI/CustomCard';
import styles1 from './Subtasks.module.scss'
import AddSubtask from '../../components/Models/AddSubTask';
import { useData } from '../../context/DataContext';

function SubtaskDetail() {
  const {id} = useParams();
  const [subTask,setSubTask] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const {subTaskContext} = useData();
  const navigate = useNavigate();
  const [loading , setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(()=>{
    fetchSubTask();
  },[subTaskContext])
  const fetchSubTask =async()=>{
    try{
     // const res = await API.get(`/subTask/${id}`);
      const filtered = await subTaskContext.find(subtask=> String(subtask._id)===String(id));
      setSubTask(filtered);
      setLoading(false);
    }catch(err){
      console.log("Error in fetching subtask:",err);
      setLoading(false);
    }
  }
const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#00ff2aff';
      case 'medium': return '#63b5ecff';
      case 'low': return '#e4ee8cff';
      case 'urgent': return '#fd3300ff' ;
      default: return '#63b5ecff';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#1ef102ff';
      case 'in-progress': return '#3daae9ff';
      case 'planning': return '#fbff00ff';
      case 'on-hold': return '#f72525ff';
      case 'Assigned': return '#a5ee74ff';
      case 'dropped' : return '#f72525ff';
      case 'Idea' : return '#ff9100c5';
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
// const getDirectImageUrl = (driveUrl) => {
//   if (!driveUrl) return null;
//   const match = driveUrl.match(/id=([^&]+)/);
//   return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
// };
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

 const handleEdit = (subtask) => {
    setEditingSubtask(subtask);
    setShowModal(true);
  };

  const handleEditSubtask = (updated) => {
  
    setEditingSubtask(null);
    setShowModal(false);
  };

 if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  if (!subTask) return ;
 
  return (
  <div className={styles.detailContainer}>
    <div className={styles.editSubtask}>
      <h2>{subTask.title}</h2>
      {user?.role === 'Admin' && (
        <button 
        className={styles.addButton}
        onClick={() => handleEdit(subTask)}
        >
          <Edit size={20} />
        </button>
      )}
    </div>
    {user?.role === 'Admin' && (
      <button
      className={styles.addButton1}
      onClick={() => handleEdit(subTask)}
      >
        <Edit size={20} />
      </button>
    )}
             
            <AddSubtask
            isOpen={showModal}
            onClose={() => {
              setShowModal(false)
                setEditingSubtask(null); // ✅ Also clear on modal close
            }}
            onEdit={handleEditSubtask} 
            editSubtask={editingSubtask}
          />


      <div className={styles.meta}>
        <p><Tags size={16} /><strong>SubTask ID:</strong>{subTask.customId}</p>
        <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/task/${subTask.taskId?._id}`)}><CheckSquare size={16} /> <strong>Task:</strong> {subTask.taskId?.title}</p>
        <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${subTask.projectId?._id}`)}><Flag size={16} /> <strong>Project:</strong> {subTask.projectId?.title}</p>
        {subTask.description&&<p><List size={16} /><strong>Description:</strong>{subTask.description}</p>}
         {subTask?.place?.district&&<p><LandPlot  size={16} /><strong>District:</strong>{subTask?.place?.district}</p>}
         {subTask?.place?.place&&<p><LandPlot  size={16} /><strong>Place:</strong>{subTask?.place?.place}</p>}
         {subTask?.place?.type&&<p><LandPlot  size={16} /><strong>Type:</strong>{subTask?.place?.type}</p>}
         {subTask?.place?.
organisationalStatus&&<p><Split size={16} /><strong>
Organisational Status:</strong>{subTask?.place?.
organisationalStatus}</p>}
      </div>

      <div className={styles.badges}>
        <span style={{ backgroundColor: getPriorityColor(subTask.priority) }}>
          Priority: {subTask.priority}
        </span>
        <span style={{ backgroundColor: getStatusColor(subTask.status) }}>
          Status: {subTask.status}
        </span>
      </div>
      

      <div className={styles.dates}>
        <p><Calendar size={16} /> <strong>Created:</strong> {new Date(subTask.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</p>
        <p><Calendar size={16} /> <strong>Deadline:</strong> {new Date(subTask.endDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</p>
      </div>

      <div className={styles.assignees}>
        <h4><User size={18} /> Assigned To Member(s)</h4>
        {subTask.assignedTo?.length > 0 ? (
          <ul>
            {subTask.assignedTo.map((member) => (
              <li key={member._id} style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${member._id}`)} >
                <img src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} alt={member.name}  onError={(e) => {
                                        e.target.src = "/members/AnonymousImage.jpg";
                                      }} />
                <span>{member.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Unassigned</p>
        )}
      </div>
     

    </div>
  )
}

export default SubtaskDetail
 
