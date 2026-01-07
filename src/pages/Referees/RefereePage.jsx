import React, { useEffect, useState } from 'react';
import { UserCheck, Search, Mail, Phone, Building } from 'lucide-react'; 
import styles from '../Members/Members.module.scss'; 
import CustomCard from '../../components/UI/CustomCard';
import { useNavigate, useOutletContext } from "react-router-dom";
import { useData } from '../../context/DataContext';
// 👇 1. IMPORT THE NEW COMPONENT
import AddReferee from './AddReferee'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const RefereePage = () => {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const [referees, setReferees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { memberContext } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    if (memberContext) {
      const filtered = memberContext.filter(m => m.memberType === 'Referee');
      setReferees(filtered);
    }
  }, [memberContext]);

  // 👇 Helper to update the list immediately when a new referee is added
  const handleNewReferee = (newReferee) => {
    setReferees((prev) => [newReferee, ...prev]); 
  };

  const getDirectImageUrl = (driveUrl) => {
    if (!driveUrl) return null;
    let fileId = null;
    let match = driveUrl.match(/[?&]id=([^&]+)/);
    if (match) fileId = match[1];
    if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}` : driveUrl;
  };
  const buildRefereeExportRows = () => {
  return referees.map(m => ({
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

    referrerStatus: m.referrerStatus || "",
    referringOfferType: (m.referringOfferType || []).join(", "),
    referringSector: (m.referringSector || []).join(", "),
    referringFor: m.referringFor || "",
    levelOfSupport: (m.levelOfSupport || []).join(", "),
    referrerContact: m.referrerContact || "",
    declaration_Referee: m.declaration_Referee || "",
  }));
};

const exportRefereesToExcel = () => {
  const data = buildRefereeExportRows();
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Referees");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), `Referees_${new Date().toISOString().slice(0,10)}.xlsx`);
};

const exportRefereesToCSV = () => {
  const data = buildRefereeExportRows();
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `Referees_${new Date().toISOString().slice(0,10)}.csv`);
};

  return (
    <div className={styles.members}>
      <div className={styles.headerWrapper} style={{ left: sidebarWidth + 'px' }}>
        <div className={styles.headerContent}>
          
          {/* Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            <UserCheck size={28} color="#4f46e5"/> 
            Referees
          </div>
          
          {/* 👇 2. PLACE THE BUTTON HERE (Between Title and Search, or after Search) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
            <div className={styles.exportButtons}>
              <button onClick={exportRefereesToExcel}>Export Excel</button>
              <button onClick={exportRefereesToCSV}>Export CSV</button>
            </div>
            
            {/* The Add Button Component */}
            <AddReferee onSuccess={handleNewReferee} />

            <div className={styles.cardSearch}>
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search referees..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

        </div>
      </div>

      <div style={{ height: 120 }}></div>

      <div className={styles.cardView}>
        <div className={styles.membersList}>
          {referees.filter(member => {
            const search = searchTerm.toLowerCase();
            return (
              member.name?.toLowerCase().includes(search) ||
              member.email?.toLowerCase().includes(search) ||
              member.district?.toLowerCase().includes(search)
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
                      backgroundColor: '#e0e7ff', color: '#4338ca', 
                      padding: '2px 8px', borderRadius: '4px', fontSize: '12px'
                  }}>
                    {member.referrerStatus || "Referee"}
                  </span>
                </div>
              </div>
              
              <div onClick={() => navigate(`/member/${member._id}`)}>
                <div className={styles.memberDetails}>
                  <div><Mail size={16} /> {member.email}</div>
                  <div><Phone size={16} /> {member.mobileNumber}</div>
                  <div><Building size={16} /> {member.district}</div>
                  
                  {member.referringSector && (
                      <div style={{marginTop:'5px', color:'#555'}}>
                        <strong>Sector:</strong> {member.referringSector}
                      </div>
                  )}
                </div>
              </div>
            </CustomCard>
          ))}
          
          {referees.length === 0 && (
             <div style={{textAlign:'center', width:'100%', padding:'20px', color:'#666'}}>
                No Referees found in the database.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefereePage;