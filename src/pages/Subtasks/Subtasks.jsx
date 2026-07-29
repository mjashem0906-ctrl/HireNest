import React, { useState,useEffect } from 'react'
import { Plus, List, Calendar, Flag, CheckSquare, User, Edit, Trash2,Tags, Search } from 'lucide-react';
import CustomCard from '../../components/UI/CustomCard';
import styles from './Subtasks.module.scss';
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import DataTable from '../../components/Table/DataTable';
import AddSubtask from '../../components/Models/AddSubTask';
import API from '../../axios';
import { useNavigate } from 'react-router';
import Filter from '../../components/Filter/Filter';
import { useAuth } from '../../context/AuthContext';
import RequestStatusModal from '../../components/Models/RequestStatusModal';
import { useData } from '../../context/DataContext';
import ReportDownloader from '../../components/Report/ReportDownloader';
import FilterStatus from '../../components/Filter/FIlterStatus';
import { useOutletContext } from 'react-router-dom';

const subtaskColumns = [
  {
    accessorKey: 'customId',
    header: 'Subtask ID',
  },
  {
    accessorKey: 'title',
    header: 'Subtask Name',
  },
  
  {
    accessorKey: 'taskId',
    header: 'Task ',
    cell: info => {
      const task = info.getValue();
      return task?.title || 'N/A'; // ✅ Display task name instead of object
    },
  },
  {
    accessorKey: 'projectId',
    header: 'Project',
    cell: info => {
      const project = info.getValue();
      return project?.title || 'N/A'; // ✅ Display project name instead of object
    },
  },
  
  
  // {
  //   accessorKey: 'endDate',
  //   header: 'End Date',
  //   cell: info => new Date(info.getValue()).toLocaleDateString(),
  // },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => {
      const status = info.getValue() ;
      const bgMap= {
        'planning': '#fbff00ff',
        'in-progress': '#3daae9ff',
        'completed': '#1ef102ff',
        'on-hold': '#f72525ff',
        'Assigned': '#a5ee74ff',
        'dropped' : '#f72525ff',
        'Idea' : '#ff9100c5',
      };
      return (
        <span style={{
          backgroundColor: bgMap[status] || '#e9ecef',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'inline-block'
        }}>
          {status.replace(/-/g, ' ')}
        </span>
      );
    },
  },
  
  // {
  //   accessorKey: 'priority',
  //   header: 'Priority',
  //   cell: info => {
  //     const priority = info.getValue() ;
  //     const color =
  //       priority === 'high' ? '#00ff2aff' :
  //         priority === 'medium' ? '#63b5ecff' :
  //           priority === 'low' ? '#e4ee8cff' : 
  //           priority=== 'urgent'? '#fd3300ff':'#63b5ecff';
  //     return (
  //       <span style={{ color, fontWeight: 400 }}>
  //         {priority.toUpperCase()}
  //       </span>
  //     );
  //   },
  // },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: info => {
      const members = info.getValue();
      return Array.isArray(members) && members.length > 0
        ? members.map(m => m.name).join(', ')
        : 'Unassigned'; // ✅ Display member names properly
    },
  },
   {
    accessorKey: 'place',
    header: 'District',
    cell: info => {
      const place = info.getValue();
      return place?.district || 'N/A'; // ✅ Display district name instead of object
    },
  },
   {
    accessorKey: 'place',
    header: 'Place',
    cell: info => {
      const place = info.getValue();
      return place?.place || 'N/A'; // ✅ Display place name instead of object
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Date',
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    }),
  },
  // {
  //   accessorKey: 'description',
  //   header: 'Description',
  //   cell: info => {
  //     const value = info.getValue() ;
  //     return value.length > 50 ? value.slice(0, 50) + '…' : value;
  //   },
  // },
  
];


function Subtasks() {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
  const [allSubTasks,setAllSubTasks] = useState([]); // all data
  const [subTasks,setSubTasks]=useState([]); // filtered data
  const [view,setView]=useState('card'); // for view changes
  const [globalFilter, setGlobalFilter] = useState(''); // for search bar filter
  const [showModal, setShowModal] = useState(false); // for open forms
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [projectOptions,setProjectOptions]= useState([]);
  const [taskOptions,setTaskOptions] =useState([]);
  const [memberOptions,setMemberOptions] =useState([]);
  const [placeOptions,setPlaceOptions] = useState([]);
  const [placeReport,setPlaceReport] = useState(null);
  const [statusRequestModalOpen, setStatusRequestModalOpen] = useState(false);
  const [request,setRequest] = useState([]);
  const [requestSubTask, setRequestSubTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const {subTaskContext,taskContext,memberContext,projectContext,setSubTaskContext,placeContext} = useData();
  const {user} = useAuth();
  const navigate = useNavigate();


  useEffect(()=>{
    
    if(user.role==="Admin"){
      setSubTasks(subTaskContext);
      setAllSubTasks(subTaskContext);
      
     
    }
    else{
      const filtered = subTaskContext.filter(subtask=> subtask.assignedTo?.some(
        (member) => String(member._id) === String(user.memberId)));
      setSubTasks(filtered);
      setAllSubTasks(filtered);
  
    }
 
    fetchOptions();
    
  },[subTaskContext,taskContext,memberContext,user,placeContext])

  const fetchOptions =()=>{
    setProjectOptions(projectContext.map(project=>({
      value:project._id,
      label:project.title,
    })))
    
    setTaskOptions(taskContext.map(task=>({
          value:task._id,
          label:task.title,
        })))
    setMemberOptions(memberContext.map(member=>({
      value:member._id,
      label:member.name,
    })))

    setPlaceOptions(placeContext.map(place=>({
       value:place._id,
      label:place.place,
      type:place.type,
      district:place.district
    })))
    setLoading(false);
  }



        // Filter the subtasks based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setSubTasks(allSubTasks); // ✅ show all again
          setPlaceReport(null);
          setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allSubTasks];
        const newActiveFilters = {};

        if (filters.priority) {
          filtered = filtered.filter(
            (p) => p.priority.toLowerCase() === filters.priority.toLowerCase()
          );
          newActiveFilters.priority = filters.priority;
        }

        if (filters.status) {
          filtered = filtered.filter(
            (p) => p.status.toLowerCase() === filters.status.toLowerCase()
          );
          newActiveFilters.status = filters.status;

        }

        if (filters.startDate) {
          const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (p) => new Date(p.startDate).setHours(0, 0, 0, 0) >= start
          );
         newActiveFilters.startDate = filters.startDate;
        
        }

        if (filters.endDate) {
          const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
          filtered = filtered.filter(
            (p) => new Date(p.startDate).setHours(0, 0, 0, 0) <= end
          );
           newActiveFilters.endDate = filters.endDate;
        }

        if (filters.task) {
          filtered = filtered.filter(
            (p) => p.taskId.title === filters.task
          );
          newActiveFilters.task = filters.task;
        }
         if (filters.project) {
          filtered = filtered.filter(
            (p) => p.projectId.title === filters.project
          );
          newActiveFilters.project = filters.project;
        }
      
        if (filters.place && filters.place.length > 0) {
            filtered = filtered.filter(
              (p) =>
                p?.place?.place && filters.place.includes(p.place.place)
            );
            setPlaceReport(filters.place);
            newActiveFilters.place = filters.place;
          }

        
        if (filters.assignto&& filters.assignto.length > 0) {
          filtered = filtered.filter(
            (p) => Array.isArray(p.assignedTo) && p.assignedTo.some((member) =>
            filters.assignto.includes(member.name)
          )
          );
          newActiveFilters.assignto = filters.assignto;
        }

         
      
        setSubTasks(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters); // Also store the raw filter values
      };


    const subtasksFilterConfig = {
        labels: {
            startDate: 'Date From',
            endDate: 'Date To', 
            project: 'Project',
            task: 'Task',
            place: 'Place',
            priority: 'Priority',
            status: 'Status',
            assignto: 'Assign To'
          },
        fieldTypes: {
              startDate: 'date',
              endDate: 'date',
              project: 'string',
              task: 'string',
              place: 'array',
              priority: 'string',
              status: 'string',
              assignto: 'array'
            },
            formatters: {
                priority: (value) => {
                  if (value === 'high') return 'High';
                  if (value === 'medium') return 'Medium';
                  if (value === 'low') return 'Low';
                  return value;
                },
                status: (value) => {
                  const statusMap = {
                    'planning': 'Planning',
                    'in-progress': 'In-Progress',
                    'completed': 'Completed',
                    'on-hold': 'On-Hold',
                    'idea': 'Idea',
                    'assigned': 'Assigned'
                  };
                  return statusMap[value.toLowerCase()] || value;
                }
              }
};

 
  // Modify clearFilter to also update filterValues
const clearFilter = (filterKey) => {
  const newActiveFilters = { ...activeFilters };
  const newFilterValues = { ...filterValues };
  
  delete newActiveFilters[filterKey];
  delete newFilterValues[filterKey];
  
  if (filterKey === 'place') {
    setPlaceReport(null);
  }
  
  setActiveFilters(newActiveFilters);
  setFilterValues(newFilterValues);
  
  applyFilters(newFilterValues);
};


  // Clear all filters
  const clearAllFilters = () => {
    setSubTasks(allSubTasks);
    setPlaceReport(null);
    setActiveFilters({});
    setFilterValues({});
  };
 
       const handleToggle = (newView) => {
       setView(newView);
     };
     const handleEdit = (subtask) => {
    setEditingSubtask(subtask);
    setShowModal(true);
  };

  const handleEditSubtask = (updated) => {
    const task = taskOptions.find(t => t.value === updated.taskId);
    const project = projectOptions.find(p => p.value === updated.projectId);
    const place = placeOptions.find(p => p.value === updated.place);
   const members = memberOptions.filter((m) =>
    updated.assignedTo.includes(m.value)
  );
     const updatedSubtaskWithNames = {
      ...updated,
      taskId: { _id: updated.taskId, title: task?.label || '' },
      projectId:{_id:updated.projectId,title:project?.label ||''},
      place:{_id:updated.place,place:place?.label ||'',type:place?.type||''},
      assignedTo: members.map((m) => ({ _id: m.value, name: m.label })),
    };

    setSubTasks(prev =>
      prev.map((subTask) => subTask._id === updated._id ? updatedSubtaskWithNames : subTask)
    );
    setAllSubTasks(prev =>
      prev.map((subTask) => subTask._id === updated._id ? updatedSubtaskWithNames : subTask)
    );
    setSubTaskContext(prev =>
      prev.map((subTask) => subTask._id === updated._id ? updatedSubtaskWithNames : subTask)
    );
    setEditingSubtask(null);
    setShowModal(false);
  };


  const handleAddSubtask = (subtaskData) => {
      const task = taskOptions.find(t => t.value === subtaskData.taskId);
      const project = projectOptions.find(p=>p.value ===subtaskData.projectId);
      const place = placeOptions.find(p=>p.value===subtaskData.place);
    const members = memberOptions.filter((m) =>
    subtaskData.assignedTo.includes(m.value)
  );

    const newSubtask = {
      ...subtaskData,
      taskId: { _id: subtaskData.taskId, title: task?.label || '' },
      projectId:{_id:subtaskData.projectId,title:project?.label ||''},
      place:{_id:subtaskData.place, place:place?.label||'',type:place?.type||''},
      assignedTo: members.map((m) => ({ _id: m.value, name: m.label })),
    };
    setSubTasks(prev => [...prev, newSubtask]);
    setAllSubTasks(prev => [...prev, newSubtask]);
    setSubTaskContext(prev => [...prev, newSubtask]);
  };


     const handleDelete = async(id) => {

       try{
        if (window.confirm('Are you sure you want to delete this subtask?')) {
            await API.delete(`/subTask/${id}`);
           setSubTasks(subTasks.filter(subtask => subtask._id !== id));
           setAllSubTasks(allSubTasks.filter(subtask => subtask._id !== id));
           setSubTaskContext(subTaskContext.filter(subtask => subtask._id !== id));
           alert("SubTask deleted successfully");
      }}
      catch(err){
        console.error("Error deleting subtask:", err);
      }
  };

  const handleRowClick = (row) => {
        navigate(`/subtask/${row._id}`);
    };
      
    // for status request
    const handleStatusRequest =(subtaskData) => {
  setRequest(prev=>[...prev,subtaskData]);
};

    const handleRequest = (subtask)=>{
      setRequestSubTask(subtask);
      setStatusRequestModalOpen(true);
    }

  //for handle edit request

  const handleEditRequest = (updated)=>{
    setRequest(prev=> prev.map((req)=>req._id===updated._id?updated:req));
    setRequestSubTask(null);
    setStatusRequestModalOpen(false);
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

  if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    <div className={styles.subtasks}>
          <div
            className={styles.headerWrapper}
            style={{ left: sidebarWidth + 'px' }} // dynamically adjust according to sidebarCollapsed
          >
      <div className={styles.headerContent}>
         {/* Global Filter Input */}
         
            <div className={styles.cardSearch}>
              <Search size={20}/>
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter || ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
        <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
      {user?.role==="Admin"&&(
        <>
         <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          Add Subtask
        </button>
        <button
                className={styles.addButton1}
                onClick={() => setShowModal(true)}
              >
                <Plus size={20} />
                
              </button>
        </>
      
        
      )}
        <Filter
            fields={[
              { name: "startDate", label: "Date From", type: "startDate" },
              { name: "endDate", label: "Date To", type: "endDate" },
              { name: "project", label: "Project", type: "select", options: projectOptions.map((p) => p.label) },
               { name: "task", label: "Task", type: "select", options: taskOptions.map((t) => t.label) },
               { name: "place", label: "Place", type: "multiselect", options: placeOptions.map((p) => p.label) },
              { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
              { name: "status", label: "Status", type: "select", options: ["Planning", "In-Progress", "Completed","On-Hold","Idea","Assigned"] },
              { name: "assignto", label: "Assign To", type: "multiselect", options: memberOptions.map((m) => m.label) }
            ]}
            onApplyFilters={(filters) => applyFilters(filters)}
            initialValues={filterValues}
          />
      </div>
      </div>
      <div style={{height:120}}></div>
      

                  <AddSubtask
                    isOpen={showModal}
                    onClose={() => {
                      setShowModal(false);
                      setEditingSubtask(null);
                    }}
                    onSubmit={handleAddSubtask}
                    onEdit={handleEditSubtask}
                    editSubtask={editingSubtask}
                  />
                          <RequestStatusModal
                              isOpen={statusRequestModalOpen}
                              onClose={() => {
                                setStatusRequestModalOpen(false);
                                setRequestSubTask(null);
                              }}
                              onSubmit={handleStatusRequest}
                              onEdit={handleEditRequest}
                              editRequest={requestSubTask}
                            />
                            
      {view === 'table' &&
      
        <div>
           {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={subtasksFilterConfig}
                data-page-type="subtasks"
              />
           {placeReport && placeReport.length > 0 &&
         <>
              <ReportDownloader  data={subTasks.filter(subtask => {
                      // Apply the same filtering logic to ensure only place-filtered data is included
                      return subtask?.place?.place && placeReport.includes(subtask.place.place);
                    })}
                     title={`${placeReport.join(', ')} - SubTasks`}
                     memberData ={{name: "Place Filter Report",
                                  
                                  currentDistrict: placeReport.join(', ')
                                }}
                    columns={[
                        { header: "SubTask Id", key: "customId" },
                        { header: "Title", key: "title" },
                        { header: "Place", key: "place.place" },
                        { header: "Assigned To", key: "assignedTo.name",},
                        { header: "Start Date", key: "startDate",type: "date"},
                        { header: "Deadline", key: "endDate",type: "date" },
                        { header: "Task", key: "taskId.title" },
                        { header: "Project", key: "projectId.title" },
                        { header: "Status", key: "status" },
                    ]} />
         </>}
          <DataTable data={subTasks} columns={subtaskColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick} />
        </div>
      }


     {
        view === 'card' &&

        <div className={styles.cardView}>
              {/* Filter Status Indicator */}
              {activeFilters&&<div className={styles.filterStatus}>
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={subtasksFilterConfig}
                data-page-type="subtasks"
              />
              </div>}
        {placeReport && placeReport.length > 0 &&
         <>
              <ReportDownloader  data={subTasks}
                     title={`${placeReport.join(', ')} - SubTasks`}
                     memberData ={{name: "Place Filter Report",
                                  
                                  currentDistrict: placeReport.join(', ')
                                }}
                    columns={[
                        { header: "SubTask Id", key: "customId" },
                        { header: "Title", key: "title" },
                        { header: "Place", key: "place.place" },
                        { header: "Assigned To", key: "assignedTo.name",},
                        { header: "Start Date", key: "startDate",type: "date"},
                        { header: "Deadline", key: "endDate",type: "date" },
                        { header: "Task", key: "taskId.title" },
                        { header: "Project", key: "projectId.title" },
                        { header: "Status", key: "status" },
                    ]} />
         </>}
              
         
         
           

        <div className={styles.subtasksList}>
         
          {subTasks.filter(subtask => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            subtask.title?.toLowerCase().includes(search) ||
            subtask.customId?.toLowerCase().includes(search) ||
            subtask.taskId?.title?.toLowerCase().includes(search) ||
            subtask.taskId?.projectId?.title?.toLowerCase().includes(search) ||
            Array.isArray(subtask.assignedTo)&&subtask.assignedTo.some(m=>m.name?.toLowerCase().includes(search))  
            
          );
        }).map((subtask) => {
            const decription = subtask.description;
            

            return (
              <CustomCard key={subtask._id} className={styles.subtaskCard} hover>
                <div className={styles.subtaskHeader}>
                  <div
                    className={styles.colorBar}
                    style={{ backgroundColor: getPriorityColor(subtask.priority) }}
                  />
                  <div onClick={()=>{navigate(`/subtask/${subtask._id}`)}} className={styles.subtaskInfo}>
                    <h3>{subtask.title}</h3>
                    <p><Tags size={12} />  {subtask.customId}</p>
                    <p>{ decription.length>20? decription.slice(0,20)+"...":decription }</p> 
                    <div className={styles.badges}>
                      {subtask.taskId && (
                        <span className={styles.taskBadge}>
                          <CheckSquare size={12} />
                          {subtask.taskId.title}
                        </span>
                      )}
                      
                    </div>
                  </div>
                 
                  <div className={styles.subtaskActions}>
                     {user.role==="Admin"&&(
                      <>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(subtask)}
                      title="Edit subtask"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(subtask._id)}
                      title="Delete subtask"
                    >
                      <Trash2 size={16} />
                    </button>
                    </>
                    )}
                    {user.role !== "Admin" && (
                        
                          <button
                            className={styles.editButton}
                            onClick={() => handleRequest(subtask)}
                            title="Request status change"
                          >
                            <Edit size={16} />
                          </button>
                          
                        )}
                  </div>
          
                </div>
                 <div onClick={()=>{navigate(`/subtask/${subtask._id}`)}} >
                <div className={styles.subtaskDetails}>
                   <div className={styles.badges}>
                        <span className={styles.badge} style={{ backgroundColor: getPriorityColor(subtask.priority) }}>
                          {subtask.priority}
                        </span>
                        <span className={styles.badge} style={{ backgroundColor: getStatusColor(subtask.status) }}>
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
                  <div>
                    {subtask?.place&&("District: " + subtask?.place?.district)}
                  
                  </div>
                  <div>
                    {subtask?.place?.place&&("Place: "+ subtask?.place?.place)}
                  
                  </div>
                   
                </div>
                </div>
              </CustomCard>
            );
          })}
        </div>
        </div>
      }
      </div>
  )
}

export default Subtasks