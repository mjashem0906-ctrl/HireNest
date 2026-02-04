//------------------------------31/01-------------------4.22---------------------

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, User, Mail, Phone 
} from 'lucide-react';
import AddRecruiterModal from './AddRecruiterModal';
import styles from './RecruitersPage.module.scss';

const RecruitersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruiters, setRecruiters] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state
  
  const navigate = useNavigate();

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/recruiters');
      setRecruiters(response.data);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  // Filter logic
  const filteredRecruiters = recruiters.filter(recruiter => 
    recruiter.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search recruiters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.btnExcel}><Download size={16} /> Export Excel</button>
          <button className={styles.btnCsv}><Download size={16} /> Export CSV</button>
          <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Recruiter
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={styles.grid}>
        {loading ? (
           <div className={styles.emptyState}>Loading recruiters...</div>
        ) : filteredRecruiters.length > 0 ? (
          filteredRecruiters.map((recruiter) => (
            <div 
              key={recruiter._id} 
              className={styles.card}
              onClick={() => navigate(`/recruiters/${recruiter._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.avatar}>
                <User size={32} />
              </div>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <h3>{recruiter.fullName}</h3>
                  <span className={styles.roleBadge}>Recruiter</span>
                </div>
                <div className={styles.contact}>
                  <div className={styles.row}><Mail size={14} className="mr-2"/> {recruiter.email}</div>
                  <div className={styles.row}><Phone size={14} className="mr-2"/> {recruiter.phone}</div>
                </div>
                <div className={styles.meta}>
                  <p><strong>Department:</strong> {recruiter.department}</p>
                  <p><strong>Designation:</strong> {recruiter.designation}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h3>No Recruiters Found</h3>
          </div>
        )}
      </div>

      <AddRecruiterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRecruiters} 
      />
    </div>
  );
};

export default RecruitersPage;