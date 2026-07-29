import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import API from '../../axios';
import styles from './ProjectDetail.module.scss';
import CustomCard from '../../components/UI/CustomCard';
import styles1 from '../Subtasks/Subtasks.module.scss'
import { Plus, List, Calendar, Flag, CheckSquare, User, Edit, Trash2, ListFilter, Pointer, Tags, ArrowLeft } from 'lucide-react';
import AddTask from '../../components/Models/AddTask';
import AddSubtask from '../../components/Models/AddSubTask';
import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';



function ProjectDetail() {
    const {id} = useParams();
    const [project ,setProject] = useState('');
    const [tasks,setTasks] =useState([]);
    const [subTasks , setSubTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showSubtaskModal, setShowSubtaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);
    const {projectContext,taskContext,subTaskContext, setSubTaskContext, memberContext,placeContext} = useData();
    const [loading,setLoading] = useState(true);
    const topScrollRef = useRef(null);
    const mainScrollRef = useRef(null);
    const {user} = useAuth();
    const taskCount = tasks.length;
    const subtaskCount = subTasks.length;
    const navigate = useNavigate();
    useEffect(()=>{
        fetchProject();
    },[projectContext,taskContext,subTaskContext,placeContext]);

    useEffect(() => {
  const main = mainScrollRef.current;
  const top = topScrollRef.current;

  if (!main || !top) return;

  // Sync widths
  top.innerHTML = `<div style="width: ${main.scrollWidth}px"></div>`;

  const syncScroll = () => {
    top.scrollLeft = main.scrollLeft;
  };

  const syncScrollTop = () => {
    main.scrollLeft = top.scrollLeft;
  };

  main.addEventListener('scroll', syncScroll);
  top.addEventListener('scroll', syncScrollTop);

  return () => {
    main.removeEventListener('scroll', syncScroll);
    top.removeEventListener('scroll', syncScrollTop);
  };
}, [tasks]); // Re-run if task list changes

    const fetchProject = async()=>{
        try{
        //const res = await API.get(`/project/${id}`);
        const filtered = await projectContext.find(project=>String(project._id)===String(id))
        setProject(filtered);
         fetchTask( id);
         
        }
        catch(error){
            console.error("Error fetching Project:", error);
            setLoading(false);
                
        }
    }
const fetchTask = async(projectId)=>{
        try{
       // const res = await API.get(`/task`);
        const filteredTasks = taskContext.filter((task) => String(task.projectId._id) === String(projectId) );
        setTasks(filteredTasks);
        fetchSubTask(filteredTasks);
        // console.log(res.data.data);
        
        }
        catch(error){
            console.error("Error fetching Tasks:", error);
        }
    }
    const fetchSubTask = async(tasksArray)=>{
        try{
      //  const res = await API.get(`/subTask`);
      //  const allSubTasks = res.data.data;
        const filteredSubTasks = subTaskContext.filter((subtask) =>tasksArray.some((task)=> String(subtask.taskId._id) === String(task._id)));
        setSubTasks(filteredSubTasks);
        // Count subtasks per task
          const taskWithSubtaskCounts = tasksArray.map(task => {
            const count = filteredSubTasks.filter(st => st.taskId._id === task._id).length;
            return { ...task, subtaskCount: count };
          });

          // Sort by subtask count descending
          const sortedTasks = taskWithSubtaskCounts.sort((a, b) => b.subtaskCount - a.subtaskCount);
          setTasks(sortedTasks);
          setLoading(false);
                
        }
        catch(error){
            console.error("Error fetching Subtasks:", error);
        }
    }

    const handleform = (type , task = null , project=null)=>{
      if (type === 'task') setShowTaskModal(true);
      if (type === 'subtask') {
        setEditingSubtask(null); // ✅ Clear old edit state
        setSelectedProject(project); // Set selected project
        setSelectedTask(task); // Set selected task
        setShowSubtaskModal(true);
  }

  const handleSubTaskEdit = (subtask) => {
    setEditingSubtask(subtask);
    setShowSubtaskModal(true);
  };

        const handleAddTask = (newTask) => {
        setTasks(prev => [...prev, newTask]);
      };


const handleAddSubtask = (newSubtask) => {
  // Ensure the subtask has the proper structure with populated fields
  const enrichedSubtask = {
    ...newSubtask,
    // Make sure these fields are properly populated
    taskId: {
      _id: newSubtask.taskId,
      title: taskContext.find(t => t._id === newSubtask.taskId)?.title || 'Unknown Task'
    },
     place: {
      _id: newSubtask.place,
      place: placeContext.find(p => p._id === newSubtask.place)?.place || 'Unknown place',
      type:placeContext.find(p => p._id === newSubtask.place)?.type || 'Unknown type'
    },
    projectId: {
      _id: newSubtask.projectId,
      title: projectContext.find(p => p._id === newSubtask.projectId)?.title || 'Unknown Project'
    },
    assignedTo: Array.isArray(newSubtask.assignedTo) 
      ? newSubtask.assignedTo.map(memberId => {
          const member = memberContext.find(m => m._id === memberId);
          return member ? { _id: member._id, name: member.name } : { _id: memberId, name: 'Unknown Member' };
        })
      : []
  };

  // Update both local and context state
  const updatedSubTasks = [...subTasks, enrichedSubtask];
  setSubTasks(updatedSubTasks);
  setSubTaskContext(prev => [...prev, enrichedSubtask]);
  
  // Update the specific task's count
  const updatedTasks = tasks.map(task => {
    if (task._id === newSubtask.taskId) {
      return { ...task, subtaskCount: (task.subtaskCount || 0) + 1 };
    }
    return task;
  });
  
  // Sort by subtask count
  const sortedTasks = updatedTasks.sort((a, b) => (b.subtaskCount || 0) - (a.subtaskCount || 0));
  setTasks(sortedTasks);
};

const handleEditSubtask = (updatedSubtask) => {
  // Check if the task changed
  const oldSubtask = subTasks.find(st => st._id === updatedSubtask._id);
  const taskChanged = oldSubtask && oldSubtask.taskId._id !== updatedSubtask.taskId._id;
  
  // Enrich the subtask data with proper structure
  const enrichedSubtask = {
    ...updatedSubtask,
    taskId: {
      _id: updatedSubtask.taskId,
      title: taskContext.find(t => t._id === updatedSubtask.taskId)?.title || 'Unknown Task'
    }, 
    place: {
      _id: updatedSubtask.place,
      place: placeContext.find(p => p._id === updatedSubtask.place)?.place || 'Unknown place',
      type:placeContext.find(p => p._id === updatedSubtask.place)?.type || 'Unknown type'
    },
    projectId: {
      _id: updatedSubtask.projectId,
      title: projectContext.find(p => p._id === updatedSubtask.projectId)?.title || 'Unknown Project'
    },
    assignedTo: Array.isArray(updatedSubtask.assignedTo) 
      ? updatedSubtask.assignedTo.map(memberId => {
          const member = memberContext.find(m => m._id === memberId);
          return member ? { _id: member._id, name: member.name } : { _id: memberId, name: 'Unknown Member' };
        })
      : []
  };
  
  // Update both local and context state
  const updatedSubTasks = subTasks.map(subtask => 
    subtask._id === updatedSubtask._id ? enrichedSubtask : subtask
  );
  
  setSubTasks(updatedSubTasks);
  setSubTaskContext(prev => 
    prev.map(subtask => subtask._id === updatedSubtask._id ? enrichedSubtask : subtask)
  );
  
  if (taskChanged) {
    // If task changed, update counts for both old and new tasks
    const updatedTasks = tasks.map(task => {
      if (task._id === oldSubtask.taskId._id) {
        return { ...task, subtaskCount: Math.max(0, (task.subtaskCount || 0) - 1) };
      } else if (task._id === updatedSubtask.taskId._id) {
        return { ...task, subtaskCount: (task.subtaskCount || 0) + 1 };
      }
      return task;
    });
    
    const sortedTasks = updatedTasks.sort((a, b) => (b.subtaskCount || 0) - (a.subtaskCount || 0));
    setTasks(sortedTasks);
  }
  
  // Close modal and reset state
  setEditingSubtask(null);
  setShowSubtaskModal(false);
};
      
      const handleDelete = async(id) => {
    
      
       try{
        if (window.confirm('Are you sure you want to delete this subtask?')) {
            await API.delete(`/subTask/${id}`);
           setSubTasks(subTasks.filter(subtask => subtask._id !== id));
           setSubTaskContext(subTaskContext.filter(subtask => subtask._id !== id));
      }}
      catch(err){
        console.error("Error deleting subtask:", err);
      }
   
    
  };

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
      case 'planning': return '#f0ab2cff';
      case 'on-hold': return '#f72525ff';
      default: return '#f0ab2cff';
    }
  };
  const handleBack = () => {
  if (window.history.state && window.history.state.idx > 0) {
    navigate(-1); // go back if possible
  } else {
    navigate("/projects"); // fallback
  }
};

   if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    <div className={styles.projectBoard}>
       
                <header className={styles.header}>
                            <h3>{project?.title}</h3>
                        
                        <div className={styles.projectInfo}>
                        
                         <button className={styles.addBtn} onClick={() => handleBack()}><ArrowLeft size={20} /></button> 
                        </div>
                        
                    </header>
                    
                        <div className={styles.statsGrid} style={{ margin: 10 }}>
                        <CustomCard className={styles.statCard}  hover>
                        <div className={styles.statIcon} style={{ backgroundColor: '#FFEAA7' }}>
                        <CheckSquare size={24} />
                        </div>
                        <div className={styles.statInfo}>
                             <p><strong>No.of Tasks</strong></p>
                        <h3>{taskCount}</h3>
                       
                        </div>
                        
                    </CustomCard>
                     <CustomCard  className={styles.statCard} hover>
                        <div className={styles.statIcon} style={{ backgroundColor: '#DDA0DD' }}>
                        <List size={24} />
                        </div>
                        <div className={styles.statInfo}>
                             <p><strong>No.of SubTasks</strong></p>
                        <h3>{subtaskCount}</h3>
                       
                        </div>
                        
                    </CustomCard>
                    
                       </div>
                        
                        <div className={styles.detailContainer}>
                        <p><Tags size={16}/> <strong>Project ID: </strong>{project?.customId}</p>
                        {project?.description&&<p><List size={16}/> <strong>Description: </strong>{project?.description}</p>}

                        <div className={styles.badges}>
                        <span style={{ backgroundColor: getPriorityColor(project?.priority) }}><strong>Status: </strong>{project?.status}</span>
                        <span style={{ backgroundColor: getStatusColor(project?.status) }}><strong>Priority: </strong>{project?.priority}</span>
                        </div>
                        <div className={styles.dates}>
                          <p><Calendar size={16} /> <strong>Created at: </strong> {new Date(project?.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })} </p>
                           <p><Calendar size={16} /> <strong>Deadline: </strong> {new Date(project?.endDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</p>
                          </div>
                        </div>
                        <AddTask
                              isOpen={showTaskModal}
                              onClose={() => setShowTaskModal(false)}
                              onSubmit={handleAddTask}
                              editTask={null}
                            />
                        <AddSubtask
                            isOpen={showSubtaskModal}
                            onClose={() => {
                              setShowSubtaskModal(false)
                              setSelectedTask(null); // Clear after close
                               setEditingSubtask(null); // ✅ Also clear on modal close
                               setSelectedProject(null);
                            }}
                            onSubmit={handleAddSubtask}
                            selectedTask={selectedTask} // Pass selected task
                            selectedProject={selectedProject} // Pass selected project
                            onEdit={handleEditSubtask} 
                            editSubtask={editingSubtask}
                          />
      <div className={styles.scrollWrapper}>
        <div className={styles.scrollMirror} ref={topScrollRef}></div>
        <div className={styles.boardScroll} ref={mainScrollRef}>
        {tasks.map((task) => ( 
         
              <div className={styles.column} key={task._id}>
                  <div className={styles.taskHead} >
                    <div className={styles.taskHeader}>
                      <span style={{cursor:"pointer"}} onClick={()=>navigate(`/task/${task._id}`)} className={styles.taskTitle}>{task.title} ({task.subtaskCount})</span>
                      {user?.role==="Admin"&&(
                      <button className={styles.addButton} onClick={() => handleform("subtask",task,task.projectId)}>
                        <Plus size={12} />
                      </button>
                      )}
                    </div>
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(`/task/${task._id}`)} className={styles.taskTitle}>{task.customId}</span>
                    </div>
                    
                

                 <div className={styles1.subtasksList} style={{width: 300}}>
                {subTasks.filter((s) => s.taskId._id === task._id).map((subtask) => (
                       <CustomCard key={subtask._id} className={styles1.subtaskCard} hover >
                <div className={styles1.subtaskHeader}>
                  <div className={styles1.colorBar} style={{ backgroundColor: getPriorityColor(subtask.priority) }}/>
                  <div className={styles1.subtaskInfo}>
                    <h3>{subtask.title}</h3>
                     <p>{subtask.customId}</p>  
                    <div className={styles1.badges}>
                      {subtask.taskId && (
                        <span className={styles1.taskBadge}>
                          <CheckSquare size={12} />
                          {subtask.taskId.title}
                        </span>
                      )}
                      
                    </div>
                  </div>
                   {user?.role==="Admin"&&(
                  <div className={styles1.subtaskActions}>
                    <button
                      className={styles1.editButton}
                      onClick={() => handleSubTaskEdit(subtask)}
                      title="Edit subtask"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles1.deleteButton}
                      onClick={() => handleDelete(subtask._id)}
                      title="Delete subtask"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                   )}
                </div>
                 <div onClick={()=>{navigate(`/subtask/${subtask._id}`)}} >
                <div className={styles1.subtaskDetails}>
                   <div className={styles1.badges}>
                        <span className={styles1.badge}  style={{ backgroundColor: getPriorityColor(subtask.priority) }}>
                        
                          {subtask.priority}
                        </span>
                        <span className={styles1.badge} style={{ backgroundColor: getStatusColor(subtask.status) }}>
                        
                          {subtask.status}
                        </span>
                  </div>
                  <div><Calendar size={16} /> {new Date(subtask.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}  -  {new Date(subtask.endDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</div>
             
                  <div>
                    <User size={16} />{" "}
                    {Array.isArray(subtask.assignedTo) && subtask.assignedTo.length > 0 ? (
                      subtask.assignedTo.length === 1 ? (
                        subtask.assignedTo[0].name
                      ) : (
                     //   "Multiple Members";
                          subtask.assignedTo.map(m => m.name).join(", ") 
                      )
                    ) : (
                      "Unassigned"
                    )}
                  </div>
                </div>
                </div>
              </CustomCard>
               
                ))}
                </div>
              </div>

        ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
