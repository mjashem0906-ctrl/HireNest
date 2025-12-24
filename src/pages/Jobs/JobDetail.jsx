import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../axios";
import styles from "./JobDetail.module.scss";
import { useData } from "../../context/DataContext";
import { useAuth } from '../../context/AuthContext';

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const {jobContext} = useData();   
  const {user} = useAuth();

  useEffect(() => {
    fetchJob();
  }, [jobContext]);

  const fetchJob = async () => {
    try {
      const job = jobContext.find(job => job._id === id);
      setJob(job);
    } catch (error) {
      console.error("Fetch job failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div className={styles.container}>
      <h1>{job.title}</h1>
      <p className={styles.date}>
        Posted on {new Date(job.createdAt).toLocaleString()}
      </p>
      <p className={styles.description}>{job.description}</p>

      {user.role==="Admin" && job.appliedMembers && job.appliedMembers.length > 0 && (
  <div className={styles.applications}>
    <br></br>
    <h3>Applied Members</h3>

    {job.appliedMembers.map((app) => (
      <div key={app._id} className={styles.applicant}>
        <p><strong>{app?.memberId?.name}</strong></p>
        <p>{app?.memberId?.email}</p>
        <small>
          Applied on {new Date(app.appliedAt).toLocaleString()}
        </small>
      </div>
    ))}
  </div>
)}

    </div>
  );
}

export default JobDetail;