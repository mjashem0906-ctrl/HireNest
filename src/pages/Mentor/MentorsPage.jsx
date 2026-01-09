import React, { useEffect, useState } from 'react';
import { User, Search, Mail, Phone, Building } from 'lucide-react'; 
import styles from '../Members/Members.module.scss'; 
import CustomCard from '../../components/UI/CustomCard';
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import AddMentor from './AddMentor';
import API from '../../axios'; // ✅ Import API
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const MentorsPage = () => {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // ✅ Added Loading State
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ UPDATED: Fetch Mentors directly from API to ensure data loads for everyone
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        // This endpoint returns all members (we fixed the permissions in the backend earlier)
        const res = await API.get('/member'); 
        
        // Filter only Mentors (Case insensitive check for safety)
        const mentorList = res.data.filter(m => 
            m.memberType && m.memberType.toLowerCase() === 'mentor'
        );
        
        setMentors(mentorList);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleNewMentor = (newMentor) => {
    setMentors((prev) => [newMentor, ...prev]);
  };

  const getDirectImageUrl = (driveUrl) => {
    if (!driveUrl) return null;
    let fileId = null;
    let match = driveUrl.match(/[?&]id=([^&]+)/);
    if (match) fileId = match[1];
    if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
  };

  const buildMentorExportRows = () => {
  return mentors
    .filter(member => {
      const search = searchTerm.toLowerCase();
      return (
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search)
      );
    })
    .map(m => ({
      memberReferenceNumber: m.memberReferenceNumber || "",
      timestamp: m.timestamp || "",
      name: m.name || "",
      age: m.age || "",
      gender: m.gender || "",
      mobileNumber: m.mobileNumber || "",
      email: m.email || "",
      district: m.district || "",
      symMemberStatus: m.symMemberStatus || "",
      memberType: m.memberType || "",

      mentorExpertise: (m.mentorExpertise || []).join(", "),
      mentorSpecialization: (m.mentorSpecialization || []).join(", "),
      fieldofStudy_Interest: m.fieldofStudy_Interest || "",
      levelOfSupport: (m.levelOfSupport || []).join(", "),
      declaration_Mentor: m.declaration_Mentor || "",
      submittingEmail: m.submittingEmail || "",
      createdAt: m.createdAt || ""
    }));
  };

  const exportMentorsToExcel = () => {
    const data = buildMentorExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mentors");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `Mentors_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportMentorsToCSV = () => {
    const data = buildMentorExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);

    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Mentors_${new Date().toISOString().slice(0,10)}.csv`
    );
  };


  return (
    <div className={styles.members}>
      <div className={styles.headerWrapper} style={{ left: sidebarWidth + 'px' }}>
        <div className={styles.headerContent}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            <User size={28} color="#4f46e5"/> 
            Mentors
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>

            {user?.role === 'Admin' && (
               <div className={styles.exportButtons}>
                <button onClick={exportMentorsToExcel}>Export Excel</button>
                <button onClick={exportMentorsToCSV}>Export CSV</button>
              </div>
            )}
            
            {/* Only Admins see the Add Button */}
            {user?.role === 'Admin' && (
               <AddMentor onSuccess={handleNewMentor} />
            )}

            <div className={styles.cardSearch}>
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search mentors..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

        </div>
      </div>

      <div style={{ height: 120 }}></div>

      <div className={styles.cardView}>
        {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                Loading Mentors...
            </div>
        ) : (
            <div className={styles.membersList}>
            {mentors.filter(member => {
                const search = searchTerm.toLowerCase();
                return (
                member.name?.toLowerCase().includes(search) ||
                member.email?.toLowerCase().includes(search)
                );
            }).map((member) => (
                <CustomCard key={member._id} className={styles.memberCard} hover>
                <div className={styles.memberHeader}>
                    <img 
                    onClick={() => navigate(`/member/${member._id}`)}
                    src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"}
                    alt={member.name}
                    className={styles.avatar}
                    onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                    />
                    <div className={styles.memberInfo} onClick={() => navigate(`/member/${member._id}`)}>
                    <h3>{member.name}</h3>
                    <span style={{
                        backgroundColor: '#f3e8ff', color: '#7e22ce', 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '12px'
                    }}>
                        Mentor
                    </span>
                    </div>
                </div>
                
                <div onClick={() => navigate(`/member/${member._id}`)}>
                    <div className={styles.memberDetails}>
                    <div><Mail size={16} /> {member.email}</div>
                    <div><Phone size={16} /> {member.mobileNumber}</div>
                    {member.currentInstitutionOrCompany && 
                        <div><Building size={16} /> {member.currentInstitutionOrCompany}</div>
                    }
                    
                    {member.fieldofStudy_Interest && (
                        <div style={{marginTop:'5px', color:'#555', fontSize:'0.9rem'}}>
                            <strong>Expertise:</strong> {member.fieldofStudy_Interest}
                        </div>
                    )}
                    </div>
                </div>
                </CustomCard>
            ))}
            
            {mentors.length === 0 && (
                <div style={{textAlign:'center', width:'100%', padding:'20px', color:'#666'}}>
                    No Mentors found.
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MentorsPage;