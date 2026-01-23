//------------------20/01--------------1.17---------------
import React, { useEffect, useState } from 'react';
import { UserCheck, Search, Mail, Phone, Building, Briefcase, Building2 } from 'lucide-react'; 
import { useNavigate, useOutletContext } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Components & Context
import styles from '../Members/Members.module.scss'; 
import CustomCard from '../../components/UI/CustomCard';
import { useData } from '../../context/DataContext';
import AddReferee from './AddReferee'; 

const RefereePage = () => {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const [referees, setReferees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { memberContext } = useData();
  const navigate = useNavigate();

  // Fetch referees
  useEffect(() => {
    if (memberContext) {
      const filtered = memberContext.filter(m => 
        m.memberType && m.memberType.toLowerCase() === 'referee'
      );
      setReferees(filtered);
    }
  }, [memberContext]);

  const handleNewReferee = (newReferee) => {
    setReferees((prev) => [newReferee, ...prev]); 
  };

  // Handle click to view referee details
  const handleRefereeClick = (referee) => {
    // Navigate to referee details page with all referee data
    navigate(`/referee/${referee._id}`, { 
      state: { refereeData: referee } 
    });
  };

  // Export functions remain the same...
  const buildRefereeExportRows = () => {
    return referees.filter(member => {
        const search = searchTerm.toLowerCase();
        return (
          member.name?.toLowerCase().includes(search) ||
          member.email?.toLowerCase().includes(search) ||
          member.district?.toLowerCase().includes(search) ||
          member.occupation?.toLowerCase().includes(search) ||
          member.companyDetails?.toLowerCase().includes(search)
        );
      }).map(m => ({
        name: m.name || "",
        mobileNumber: m.mobileNumber || "",
        email: m.email || "",
        age: m.age || "",
        gender: m.gender || "",
        occupation: m.occupation || "",
        companyDetails: m.companyDetails || "",
        sector: m.sector || "",
        solidarityMemberStatus: m.solidarityMemberStatus || "",
        referrerStatus: m.referrerStatus || "",
        referringOfferType: m.referringOfferType || "",
        referringSector: m.referringSector || "",
        referringFor: m.referringFor || "",
        levelOfSupport: m.levelOfSupport || "",
        jobOfferType: m.jobOfferType || "",
        description: m.description || "",
        referrerContact: m.referrerContact || "",
        offerLocation: m.offerLocation || "",
        address: m.address || "",
        district: m.district || "",
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
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Referees_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className={styles.members}>
      <div className={styles.headerWrapper} style={{ left: sidebarWidth + 'px' }}>
        <div className={styles.headerContent}>
          <div className={styles.cardSearch}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search job referees..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className={styles.exportButtons}>
            <button onClick={exportRefereesToExcel} className={styles.excel}>Export Excel</button>
            <button onClick={exportRefereesToCSV} className={styles.csv}>Export CSV</button>
          </div>
          
          <AddReferee onSuccess={handleNewReferee} />
        </div>
      </div>

      <div style={{ height: 120 }}></div>

      {/* Referee List */}
      <div className={styles.cardView}>
        <div className={styles.membersList}>
          {referees.filter(member => {
            const search = searchTerm.toLowerCase();
            return (
              member.name?.toLowerCase().includes(search) ||
              member.email?.toLowerCase().includes(search) ||
              member.district?.toLowerCase().includes(search) ||
              member.occupation?.toLowerCase().includes(search) ||
              member.companyDetails?.toLowerCase().includes(search)
            );
          }).map((member) => (
            <CustomCard 
              key={member._id} 
              className={styles.memberCard} 
              hover
              onClick={() => handleRefereeClick(member)}
            >
              <div className={styles.memberHeader}>
                <img 
                  src={member.photoUrl || "/members/AnonymousImage.jpg"}
                  alt={member.name}
                  className={styles.avatar}
                  onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                />
                <div className={styles.memberInfo}>
                  <h3>{member.name}</h3>
                  <span style={{ 
                    backgroundColor: '#e0e7ff', color: '#4338ca', 
                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' 
                  }}>
                    {member.referrerStatus || member.solidarityMemberStatus || "Referee"}
                  </span>
                </div>
              </div>
              
              <div>
                <div className={styles.memberDetails}>
                  {member.email && <div><Mail size={16} /> {member.email}</div>}
                  {member.mobileNumber && <div><Phone size={16} /> {member.mobileNumber}</div>}
                  {member.district && <div><Building size={16} /> {member.district}</div>}
                  
                  {member.occupation && (
                    <div style={{marginTop:'8px', color:'#555', fontSize:'0.85rem'}}>
                      <Briefcase size={16} style={{verticalAlign: 'middle', marginRight: '6px'}} />
                      <strong>Occupation:</strong> {member.occupation}
                    </div>
                  )}
                  
                  {member.companyDetails && (
                    <div style={{marginTop:'4px', color:'#555', fontSize:'0.85rem'}}>
                      <Building2 size={16} style={{verticalAlign: 'middle', marginRight: '6px'}} />
                      <strong>Company:</strong> {member.companyDetails}
                    </div>
                  )}
                  
                  {member.sector && (
                    <div style={{marginTop:'4px', color:'#555', fontSize:'0.85rem'}}>
                      <strong>Sector:</strong> {member.sector}
                    </div>
                  )}
                </div>
              </div>
            </CustomCard>
          ))}
          
          {referees.length === 0 && (
             <div style={{textAlign:'center', width:'100%', padding:'20px', color:'#666'}}>
                No Referees found.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefereePage;