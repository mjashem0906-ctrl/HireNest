import React, { useEffect, useState } from 'react'
import { useData } from '../../context/DataContext';
import styles from './UserList.module.scss'
import { Plus, Search } from 'lucide-react';
import CreateUserForm from './CreateUser';
import API from '../../axios';
import { useOutletContext } from 'react-router-dom';
function UserList() {
    const { sidebarCollapsed } = useOutletContext();
    const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
    const [userList,setUserList]=useState([]);
    const {allUserContext,setAlluserContext} = useData();
    const [showModal,setShowModal]= useState(false);

    useEffect(()=>{
         setUserList(allUserContext);
         
    },[allUserContext]);
   
// const getDirectImageUrl = (driveUrl) => {
//   if (!driveUrl) return null;
//   const match = driveUrl.match(/id=([^&]+)/);
//   return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
// };

const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;

  let fileId = null;

  // Case 1: id= in query params (open?id=FILE_ID, uc?id=FILE_ID, etc.)
  let match = driveUrl.match(/[?&]id=([^&]+)/);
  if (match) fileId = match[1];

  // Case 2: /d/{fileId}/ in path
  if (!fileId) {
    match = driveUrl.match(/\/d\/([^/]+)/);
    if (match) fileId = match[1];
  }

  // Case 3: uc?id=FILE_ID format
  if (!fileId) {
    match = driveUrl.match(/uc\?id=([^&]+)/);
    if (match) fileId = match[1];
  }

  // Case 4: direct fileId pasted (25+ chars, alphanumeric + _-)
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
    fileId = driveUrl;
  }

  // If still not found, return original link
  if (!fileId) return driveUrl;

  // Default: always return a working thumbnail link
  return `https://drive.google.com/thumbnail?id=${fileId}`;
};


const getRoleColor = (status) => {
    switch (status) {
      case 'Admin': return '#f0ab2cff';
      case 'Member': return '#09fcd3ff';
      default: return '#09fcd3ff';
    }
  };
  return (<>
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
                // value={globalFilter || ''}
                // onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

      
       <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          Add User
        </button>
      
        
      </div>
      </div>
        <CreateUserForm
            isOpen={showModal}
            onClose={() => {
                setShowModal(false);
                // setEditingSubtask(null);
            }}
            // onSubmit={handleAddSubtask}
            // onEdit={handleEditSubtask}
            // editSubtask={editingSubtask}
      />
         <div  className={styles.tableContainer}>
                                  <table className={styles.table}>
                                  <thead>
                                      <tr>
                                      {/* <th>UserID</th> */}
                                      <th>Member Name</th>
                                      <th>Username</th>
                                      <th>Role</th>
                                      {/* <th>Password</th> */}
                                      {/* {assignFor.description&&<th>Description</th>} */}
                                      </tr>
                                  </thead>
                                  <tbody>
                                       {userList.map(user => (
                                      <tr key={user._id}>
                                          {/* <td>UserId</td> */}
                                          <td>
                                               <div  className={styles.member}>
                                                  <img style={{ cursor: "pointer" }}  src={user.memberId?.photoUrl ? getDirectImageUrl(user.memberId?.photoUrl) : "/members/AnonymousImage.jpg"} alt={user.memberId?.name} className={styles.profile}  onError={(e) => {
                                                    e.target.src = "/members/AnonymousImage.jpg";}} />
                                                  <span style={{ cursor: "pointer" }} >{user.memberId?.name}</span>
                                                </div>
                                           </td>
                                          <td >{user.username}</td>
                                          <td>
                                          <div className={styles.badges}>
                                          <span style={{ backgroundColor: getRoleColor(user.role) }}>{user.role}</span>
                                          </div>
                                          </td>
                                          {/* <td >{user.role}</td> */}
                                          {/* <td >{user.password}</td> */}
                                           
                                           
                
                                      </tr>
                                      ))} 
                                  </tbody>
                                  </table>
                                  </div>
                                    </>
        
  )
}

export default UserList

//-------------------------------14/01---------------------------------12.02--------------

// import React, { useEffect, useState } from 'react'
// import { useData } from '../../context/DataContext';
// import styles from './UserList.module.scss'
// import { Plus, Search } from 'lucide-react';
// import CreateUserForm from './CreateUser';
// import { useOutletContext } from 'react-router-dom';

// function UserList() {
//     const { sidebarCollapsed } = useOutletContext();
//     const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
//     const [userList, setUserList] = useState([]);
//     const { allUserContext } = useData();
//     const [showModal, setShowModal] = useState(false);

//     useEffect(() => {
//         setUserList(allUserContext);
//     }, [allUserContext]);


//     const getDirectImageUrl = (driveUrl) => {
//         if (!driveUrl) return null;
//         let fileId = null;
//         // Case 1: id= in query params
//         let match = driveUrl.match(/[?&]id=([^&]+)/);
//         if (match) fileId = match[1];
//         // Case 2: /d/{fileId}/ in path
//         if (!fileId) { match = driveUrl.match(/\/d\/([^/]+)/); if (match) fileId = match[1]; }
//         // Case 3: uc?id=FILE_ID format
//         if (!fileId) { match = driveUrl.match(/uc\?id=([^&]+)/); if (match) fileId = match[1]; }
//         // Case 4: direct fileId pasted
//         if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) { fileId = driveUrl; }
        
//         if (!fileId) return driveUrl;
//         return `https://drive.google.com/thumbnail?id=${fileId}`;
//     };

//     const getRoleColor = (status) => {
//         switch (status) {
//             case 'Admin': return '#f0ab2cff';
//             case 'Member': return '#09fcd3ff';
//             default: return '#09fcd3ff';
//         }
//     };

//     return (
//         <>
//             <div
//                 className={styles.headerWrapper}
//                 style={{ left: sidebarWidth + 'px' }}
//             >
//                 <div className={styles.headerContent}>
//                     {/* Global Filter Input */}
//                     <div className={styles.cardSearch}>
//                         <Search size={20} />
//                         <input
//                             type="text"
//                             placeholder="Search..."
//                         />
//                     </div>

//                     <button
//                         className={styles.addButton}
//                         onClick={() => setShowModal(true)}
//                     >
//                         <Plus size={20} />
//                         Add User
//                     </button>
//                 </div>
//             </div>

//             <CreateUserForm
//                 isOpen={showModal}
//                 onClose={() => { setShowModal(false); }}
//             />

//             <div className={styles.tableContainer}>
//                 <table className={styles.table}>
//                     <thead>
//                         <tr>
//                             <th>Member Name</th>
//                             <th>Username</th>
//                             <th>Role</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {userList.map(user => {
//                             // --- FIX: Safely check if memberId exists ---
//                             const memberName = user.memberId?.name || "Unknown (Deleted Member)";
//                             const isBroken = !user.memberId?.name; // Flag to check if link is broken
//                             const photoUrl = user.memberId?.photoUrl;
//                             // ------------------------------------------

//                             return (
//                                 <tr key={user._id}>
//                                     <td>
//                                         <div className={styles.member}>
//                                             <img
//                                                 style={{ cursor: "pointer", opacity: isBroken ? 0.5 : 1 }}
//                                                 src={photoUrl ? getDirectImageUrl(photoUrl) : "/members/AnonymousImage.jpg"}
//                                                 alt={memberName}
//                                                 className={styles.profile}
//                                                 onError={(e) => {
//                                                     e.target.src = "/members/AnonymousImage.jpg";
//                                                 }}
//                                             />
//                                             <span style={{ 
//                                                 cursor: "pointer", 
//                                                 color: isBroken ? "red" : "inherit",
//                                                 fontStyle: isBroken ? "italic" : "normal"
//                                             }}>
//                                                 {memberName}
//                                             </span>
//                                         </div>
//                                     </td>
//                                     <td>{user.username}</td>
//                                     <td>
//                                         <div className={styles.badges}>
//                                             <span style={{ backgroundColor: getRoleColor(user.role) }}>{user.role}</span>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>
//         </>

//     )
// }

// export default UserList