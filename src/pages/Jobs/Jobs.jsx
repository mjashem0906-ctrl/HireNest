import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from "react-router-dom";
import styles from './Jobs.module.scss'
import { BriefcaseBusiness, NotebookPen, Plus, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns';
import classNames from "classnames";
import ProvidedForm from './JobForm/ProvidedForm';
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';
import { useData } from '../../context/DataContext';

function Jobs() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [jobPosts,setJobPosts] = useState([]);
    const [myPost,setMyPost] = useState([]);
    const [view,setView] = useState('request');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showProvidedModal,setShowProvidedModal] = useState(false);
    const {user} = useAuth();
    const {jobContext} = useData();
    const navigate = useNavigate();

    useEffect(()=>{
        fetchJobPosts();
    },[jobContext])

    const handleClick = (job) => {
      navigate(`/jobs/${job._id}`);
    };

    const fetchJobPosts = async()=>{
    //  const res =await API.get('/service');
      setJobPosts(jobContext);
      console.log("jobContext",jobContext);
    //  setJobPosts( res.data.data);
      // const filtered = res.data.data.filter(service=>String(service.memberId._id)===String(user.memberId));
      
      setMyPost( jobContext);
    }


      const provided =
      [
        {
          title:" Demo 1",
          date:"2025-07-25"
        },
         {
          title:" Demo 2",
          date:"2025-07-24"
        },
         {
          title:" Demo 3",
          date:"2025-07-23"
        },
         {
          title:" Demo 4",
          date:"2025-07-22"
        },
      ]


      const handleAddProvided = async(jobData) =>{
        try{
          setJobPosts(prev=>[...prev,jobData]);
        }catch (error) {
            console.error("Error adding Job:", error);
          }
      }
     const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleView = (newView) => {setView(newView); };
  
  const handleApply = async (job) => {
  try {
    await API.post(`/service/${job._id}/apply`);
    alert("Applied successfully");
  } catch (error) {
    alert(error.response?.data?.message || "Failed to apply");
  }
};

const isApplied = (job) => {
  if (!job.appliedMembers || !user?.memberId) return false;

  return job.appliedMembers.some(
    app => String(app.memberId._id) === String(user.memberId)
  );
};



return (
<div className={styles.jobs} >
  <div className={styles.header}>
    <div className={styles.cardSearch}>
      <Search size={20}/>
      <input
        type="text"
        placeholder="Search..."
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
    </div>

    {/* <div className={styles.center1}>
      <div className={classNames(styles.center, {[styles.active]: view === "request",})} onClick={()=>handleView("request")} >
        <NotebookPen size={35}  />
        <button className={styles.label}>Job Posts</button>
      </div>
      
      <div className={classNames(styles.center, {[styles.active]: view === "provided",})} onClick={()=>handleView("provided")}>
        <BriefcaseBusiness size={35}  />
        <button className={styles.label}>Service Provided</button>
      </div>
      
      <div className={classNames(styles.center, {[styles.active]: view === "myPost",})} onClick={()=>handleView("myPost")}>
        <BriefcaseBusiness size={35}  />
        <button className={styles.label}>My Posts</button>
      </div>
      
    </div> */}
    
    <div className={styles.right}></div>
  </div>
  
  {view==='request'&& <>
  <div className={styles.pagination} style={{marginBottom:20, marginTop:120}}>
    <button onClick={handlePrev} disabled={page === 1}>Previous</button>
    <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
    <button onClick={handleNext} disabled={page === totalPages}>Next</button>
  </div>
  
  <div className={styles.container}>
    <h2 className={styles.heading}>Job Posts</h2>
    <ul className={styles.activityList}>
      {jobPosts.map((request) => (
        <li key={request?._id} className={styles.activityItem} style={{cursor:'pointer'}} onClick={()=>handleClick(request)}>
          <div className={styles.details}>
            <h5 className={styles.title}>{request?.title}</h5>
            
            {request?.description && (
              <p className={styles.description}>
                {request.description}
              </p>
            )}
          </div>

          <div>
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
          </div>

          <div className={styles.timeInfo}>
            {request?.createdAt && !isNaN(new Date(request?.createdAt)) ? (
              <>
              {new Date(request?.createdAt).toLocaleString('en-IN', {
                day: "numeric",
                month: "long",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{' • '}
            {formatDistanceToNow(new Date(request?.createdAt), { addSuffix: true })}
              </>
            ) : (
              <span>Just Now</span>
            )}
            
          </div>
          {/* <div className={styles.timeInfo}>
          <p>Post created by {request.memberId.name}</p>
          </div> */}
        </li>
      ))}
    </ul> 
  </div>
  </>} 
  
  {view==='provided'&& <>
  <div className={styles.pagination} style={{marginBottom:20, marginTop:120}}>
    <button onClick={handlePrev} disabled={page === 1}>Previous</button>
      <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
    <button onClick={handleNext} disabled={page === totalPages}>Next</button>
  </div>
  
  <div className={styles.container}>
    <h2 className={styles.heading}>Service Provided List</h2>
    {/* <ul className={styles.activityList}>
    {provided.map((provide, index) => (
      <li key={index} className={styles.activityItem} style={{cursor:'pointer'}} onClick={()=>handleClick(provide)}>
        <div className={styles.details}>
          <p>
          {/*
          {provide.title}
          </p>
        </div> 
        <div className={styles.timeInfo}>
          {new Date(provide.date).toLocaleString('en-IN', {
          day: "numeric",
          month: "long",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          })}{' • '}
          {formatDistanceToNow(new Date(provide.date), { addSuffix: true })}
        </div>
      </li>
    ))}
    </ul> */}
  </div>
  </>}
  
  {view==="myPost"&& <>
    <div className={styles.pagination} style={{marginBottom:20, marginTop:120}}>
      <button onClick={handlePrev} disabled={page === 1}>Previous</button>
      <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
      <button onClick={handleNext} disabled={page === totalPages}>Next</button>
    </div>
    
    <div className={styles.container}>    
      <h2 className={styles.heading}>My Posts</h2>
      <ul className={styles.activityList}>
        {myPost.map((request) => (
          <li key={request._id} className={styles.activityItem} style={{cursor:'pointer'}} onClick={()=>handleClick(request)}>
            <div className={styles.details}>
              <p>
                {/* {renderActivityDetails(activity)} */}
                {request.title}
              </p>
            </div> 
            
            <div className={styles.timeInfo}>
              {new Date(request.createdAt).toLocaleString('en-IN', {
                day: "numeric",
                month: "long",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                })
              }{' • '}
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </div>
            
            <div className={styles.timeInfo}>
              <p>Post created by {request.memberId.name}</p>
            </div>
            </li>
          ))}
      </ul> 
    </div>
    </>}
    
    {/* Add button */}
    {user.role==="Admin"&&
    <button
    className={styles.addButton1}
    onClick={() => setShowProvidedModal(true)}
    >
      <Plus size={20} />      
    </button>
    }  

    <ProvidedForm
    isOpen={showProvidedModal}
    onClose={()=>{
      setShowProvidedModal(false);
    }}
    onSubmit={handleAddProvided}
    />
    
  </div> 
  )
}

export default Jobs