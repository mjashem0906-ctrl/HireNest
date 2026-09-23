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
    const [userList, setUserList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { allUserContext } = useData();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
         setUserList(allUserContext || []);
    }, [allUserContext]);

    const getDirectImageUrl = (driveUrl) => {
      if (!driveUrl) return null;

      let fileId = null;
      let match = driveUrl.match(/[?&]id=([^&]+)/);
      if (match) fileId = match[1];

      if (!fileId) {
        match = driveUrl.match(/\/d\/([^/]+)/);
        if (match) fileId = match[1];
      }

      if (!fileId) {
        match = driveUrl.match(/uc\?id=([^&]+)/);
        if (match) fileId = match[1];
      }

      if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
        fileId = driveUrl;
      }

      if (!fileId) return driveUrl;
      return `https://drive.google.com/thumbnail?id=${fileId}`;
    };

    const getRoleColor = (status) => {
      switch (status) {
        case 'Admin': return '#f0ab2c';
        case 'Member': return '#215E61';
        default: return '#215E61';
      }
    };

    const filteredUsers = userList.filter(user => {
      const q = searchTerm.toLowerCase();
      const name = (user.memberId?.name || "").toLowerCase();
      const username = (user.username || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      return name.includes(q) || username.includes(q) || role.includes(q);
    });

    return (
      <div className={styles.pageContainer}>
        <div className={styles.headerWrapper}>
          <div className={styles.headerContent}>
            <div className={styles.cardSearch}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, username, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className={styles.addButton}
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Add User
            </button>
          </div>
        </div>

        <CreateUserForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted, #64748b)" }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.member}>
                        <img
                          style={{ cursor: "pointer" }}
                          src={user.memberId?.photoUrl ? getDirectImageUrl(user.memberId?.photoUrl) : "/members/AnonymousImage.jpg"}
                          alt={user.memberId?.name || "User"}
                          className={styles.profile}
                          onError={(e) => { e.target.src = "/members/AnonymousImage.jpg"; }}
                        />
                        <span style={{ cursor: "pointer", fontWeight: 600 }}>{user.memberId?.name || "Unknown Member"}</span>
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <div className={styles.badges}>
                        <span style={{ backgroundColor: getRoleColor(user.role), color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
}

export default UserList;