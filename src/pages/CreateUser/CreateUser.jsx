import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CreateUser.module.scss";
import DropdownSelect from "../../components/UI/DropdownSelect";
import API from "../../axios";
import FormInput from "../../components/UI/FormInput";
import { useData } from "../../context/DataContext";
import { X } from "lucide-react";

const CreateUserForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Member",
    memberId: "",
  });
  const [memberOptions, setMemberOptions] = useState([]);
  const [message, setMessage] = useState("");
  const { memberContext } = useData();
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [])

  const fetchMembers = async () => {
    try {
      const sortedData = await memberContext.sort((a, b) => a.memberReferenceNumber - b.memberReferenceNumber);
      setMemberOptions(
        sortedData.map(member => ({
          value: member._id,
          label: member.name,
          image: getDirectImageUrl(member.photoUrl),
        }))
      )
    }
    catch (error) {
      console.error("Error fetching members:", error);
    }
  }
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  //  const getDirectImageUrl = (driveUrl) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    if (!formData.memberId) {
      setError(true);
      setMessage("Please select a Member Name.");
      return;
    }
    if (!String(formData.username || "").trim()) {
      setError(true);
      setMessage("Username is required.");
      return;
    }
    if (!String(formData.password || "").trim()) {
      setError(true);
      setMessage("Password is required.");
      return;
    }

    try {
      const res = await API.post("/auth/register", formData);
      setMessage(res.data.message);
      setFormData({ username: "", password: "", role: "Member", memberId: "" });
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || "Error creating user");
    }
  };
  const handleCancel = () => {
    // setFormData({
    //   title: '',
    //   description: '',
    //   projectId: '',
    //   taskId: '',
    //   startDate: null,
    //   endDate: null,
    //   status: '',
    //   priority: '',
    //   assignedTo: [],
    //   district: '',
    //   unit: '',
    // });

    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h2>Create New User</h2>

            <button onClick={handleCancel} className={styles.closeButton}>
              <X size={20} />
            </button>

          </div>
          {message && (
            <p className={`${styles.formMessage} ${error ? styles.error : ""}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.formGroup}>
              <DropdownSelect
                label="Member Name"
                options={memberOptions}
                value={formData.memberId}
                onChange={(value) => setFormData({ ...formData, memberId: value })}
                searchable
                required
              />
            </div>
            <div className={styles.formGroup}>
              <FormInput
                label="Username"
                value={formData.username}
                onChange={(value) => setFormData({ ...formData, username: value })}
                placeholder="Enter username"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <DropdownSelect
                label="User Role"
                options={[{ value: "Admin", label: "Admin" }, { value: "Member", label: "Member" },
                  // {value:"IT_Member",label:"IT Member"}
                ]}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}

                required
              />
            </div>

            <button type="submit" className={styles.formBtn}>Create User</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
