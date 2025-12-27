import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./JobDetail.module.scss";
import { useData } from "../../context/DataContext";
import { useAuth } from '../../context/AuthContext';

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { jobContext } = useData();
  const { user } = useAuth();

  useEffect(() => {
    fetchJob();
  }, [jobContext]);

  const fetchJob = async () => {
    try {
      const foundJob = jobContext.find(job => job._id === id);
      if (foundJob) {
          setJob(foundJob);
      }
    } catch (error) {
      console.error("Fetch job failed:", error);
    } finally {
      if (jobContext.length > 0) setLoading(false);
    }
  };
  
  if (loading && jobContext.length === 0) return <p>Loading...</p>;
  if (!job && !loading) return <p>Job not found</p>;

  return (
    <div className={styles.container}>
      {/* 1. TITLE */}
      <h1 style={{ marginBottom: '5px' }}>{job?.title}</h1>

      {/* 2. POSTED DATE */}
      <p className={styles.date} style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
        Posted on {job?.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}
      </p>

      {/* 3. MAIN CARD (Contains Details + Description) */}
      <div style={{ 
          margin: '15px 0', 
          padding: '25px', 
          backgroundColor: '#ffffff', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
          {/* Top Section: Company Info */}
          <div style={{ marginBottom: '20px' }}>
            {job?.companyName && (
                <p style={{ margin: '8px 0', fontSize: '1.05rem', color: '#374151' }}>
                    <strong style={{ fontWeight: '600', color: '#111' }}>Company:</strong> {job.companyName}
                </p>
            )}
            
            {job?.location && (
                <p style={{ margin: '8px 0', fontSize: '1.05rem', color: '#374151' }}>
                    <strong style={{ fontWeight: '600', color: '#111' }}>Location:</strong> {job.location}
                </p>
            )}

            {job?.employmentType && (
                <p style={{ margin: '8px 0', fontSize: '1.05rem', color: '#374151' }}>
                    <strong style={{ fontWeight: '600', color: '#111' }}>Employment Type:</strong> {job.employmentType}
                </p>
            )}
          </div>

          {/* Divider Line */}
          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

          {/* Bottom Section: Description */}
          <div>
            <strong style={{ fontSize: '1.1rem', color: '#111', display: 'block', marginBottom: '10px' }}>Description:</strong>
            <p className={styles.description} style={{ lineHeight: '1.6', fontSize: '1rem', color: '#374151', whiteSpace: 'pre-wrap' }}>
                {job?.description}
            </p>
          </div>
      </div>

      {/* 4. APPLIED MEMBERS (Admin Only) */}
      {user?.role === "Admin" && job?.appliedMembers && job.appliedMembers.length > 0 && (
        <div className={styles.applications}>
          <br></br>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Applied Members</h3>

          {job.appliedMembers.map((app) => (
            <div key={app._id} className={styles.applicant} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>{app?.memberId?.name || "Unknown User"}</strong></p>
              <p style={{ margin: '0 0 5px 0', color: '#555' }}>{app?.memberId?.email}</p>
              <small style={{ color: '#888' }}>
                Applied on {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : 'N/A'}
              </small>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default JobDetail;