
import React, { useEffect, useState } from 'react';
import API from '../../axios';
import { formatDistanceToNow } from 'date-fns';
import styles from './ActivityList.module.scss';
import { useNavigate } from 'react-router';
import { CheckSquare, FolderOpen, List, ShieldUser, Users } from 'lucide-react';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await API.get(`/activityList?page=${page}&limit=20`);
        setActivities(res.data.activities);
        setTotalPages(res.data.totalPages);
        setPage(res.data.currentPage);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [page]);

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const renderActivityDetails = (activity) => {
    const { type, meta } = activity;

    switch (type) {
      case 'PROJECT':
        return <>New Project <strong className={styles.project}>{meta.title}</strong> is created.</>;
      case 'TASK':
        return <>New Task <strong className={styles.task}>{meta.title}</strong> created for <strong className={styles.project}>{meta.projectTitle}</strong> project.</>;
      case 'SUBTASK':
        return <>New SubTask <strong className={styles.subtask}>{meta.title}</strong> is created for <strong className={styles.task}>{meta.taskTitle}</strong> Task and assigned to <strong className={styles.members}>{meta.memberNames?.join(', ')}</strong>.</>;
      case 'MEMBER':
        return <>New Member <strong className={styles.members}>{meta.name}</strong> joined Solidarity.</>;
      case 'USER':
      return <> New User account is created for <strong className={styles.members}>{meta.memberName}</strong> </>
        default:
        return <>{JSON.stringify(meta)}</>;
    }
  };

  const handleClick = (activity) => {
    const { type, targetId } = activity;

    switch (type) {
      case 'PROJECT':
        navigate(`/project/${targetId}`);
        break;
      case 'TASK':
        navigate(`/task/${targetId}`);
        break;
      case 'SUBTASK':
        navigate(`/subtask/${targetId}`);
        break;
      case 'MEMBER':
        navigate(`/member/${targetId}`);
        break;
      default:
        break;
    }
  };
  return (
     <>
      <div className={styles.pagination} style={{marginBottom:20}}>
        <button onClick={handlePrev} disabled={page === 1}>Previous</button>
        <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
        <button onClick={handleNext} disabled={page === totalPages}>Next</button>
      </div>
    <div className={styles.container}>
        
      <h2 className={styles.heading}>Activity List</h2>
      <div className={styles.activityList}>
        {activities.map((activity, index) => (
          <div key={index} className={styles.activityItem}  style={{cursor:'pointer'}} onClick={()=>handleClick(activity)}>
            <div className={styles.activityContent} >
            <div className={styles.activityIcon}>
                  {activity.type === 'TASK' && <CheckSquare size={16} />}
                  {activity.type === 'PROJECT' && <FolderOpen size={16} />}
                  {activity.type === 'MEMBER' && <Users size={16} />}
                  {activity.type === 'SUBTASK' && <List size={16} />}
                  {activity.type === 'USER' && <ShieldUser size={20} />}
                </div>
            
            <p>{renderActivityDetails(activity)}</p>
            </div>
            <div className={styles.timeInfo}>
              {new Date(activity.createdAt).toLocaleString('en-IN', {
                day: "numeric",
                month: "long",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{' • '}
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </div>
            
            </div>
          
        ))}
      </div>

      
    </div>
   
     </>
  );
};

export default ActivityList;
