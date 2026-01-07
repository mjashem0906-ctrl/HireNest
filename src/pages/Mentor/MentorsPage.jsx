import React, { useEffect, useState } from 'react';
import { User, Search, Mail, Phone, Building } from 'lucide-react'; 
import styles from '../Members/Members.module.scss'; 
import CustomCard from '../../components/UI/CustomCard';
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import AddMentor from './AddMentor';
import API from '../../axios'; // ✅ Import API

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

  return (
    <div className={styles.members}>
      <div className={styles.headerWrapper} style={{ left: sidebarWidth + 'px' }}>
        <div className={styles.headerContent}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            <User size={28} color="#4f46e5"/> 
            Mentors
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
            
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