
// // //----------------------------------31/01------------------------1.39----------------------------
// // // UPDATED WITH ENHANCED UI DESIGN

// // import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
// // import axios from 'axios';
// // import { useNavigate, useOutletContext } from "react-router-dom";
// // import styles from './Jobs.module.scss';
// // import {
// //   BriefcaseBusiness, NotebookPen, Plus, Search, CheckCircle, XCircle, Clock,
// //   Loader, Trash2, Pencil, X, FileText, User, Edit, Check, ChevronLeft,
// //   ChevronRight, Eye, EyeOff, ChevronDown, ChevronUp, LogIn, MapPin, DollarSign,
// //   GraduationCap, Calendar, Users, Filter, Award, Target, Building,
// //   Sparkles, TrendingUp, BookOpen, Zap, Star, ExternalLink
// // } from 'lucide-react';
// // import { formatDistanceToNow } from 'date-fns';
// // import classNames from "classnames";
// // import { useAuth } from '../../context/AuthContext';
// // import API from '../../axios';
// // import { useData } from '../../context/DataContext';
// // import * as XLSX from 'xlsx';
// // import { saveAs } from 'file-saver';
// // import StatusPipeline from './StatusPipeline';
// // import debounce from 'lodash/debounce';
// // import PropTypes from 'prop-types';
// // import Select from 'react-select';

// // // Google Login Component with enhanced UI
// // const GoogleLoginButton = ({ onLoginSuccess, onLoginError }) => {
// //   const handleGoogleLogin = () => {
// //     const mockUser = {
// //       id: 'google-user-123',
// //       name: 'Google User',
// //       email: 'user@gmail.com',
// //       picture: 'https://via.placeholder.com/40'
// //     };

// //     if (onLoginSuccess) {
// //       onLoginSuccess(mockUser);
// //     }
// //   };

// //   return (
// //     <button
// //       onClick={handleGoogleLogin}
// //       className={styles.googleLoginButton}
// //     >
// //       <svg width="18" height="18" viewBox="0 0 24 24">
// //         <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
// //         <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
// //         <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
// //         <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
// //       </svg>
// //       Sign in with Google
// //     </button>
// //   );
// // };

// // // Enhanced Apply Button Component
// // const ApplyButton = ({ job, user, isApplied, onApplyClick, loadingState, onGoogleLogin }) => {
// //   const [showLoginPrompt, setShowLoginPrompt] = useState(false);

// //   const handleClick = (e) => {
// //     e.stopPropagation();

// //     if (!user) {
// //       setShowLoginPrompt(true);
// //       return;
// //     }

// //     if (isApplied) return;

// //     onApplyClick(e, job);
// //   };

// //   const handleGoogleLogin = () => {
// //     if (onGoogleLogin) {
// //       onGoogleLogin(() => {
// //         setShowLoginPrompt(false);
// //         onApplyClick({ stopPropagation: () => { } }, job);
// //       });
// //     }
// //   };

// //   if (isApplied) {
// //     return (
// //       <button
// //         className={styles.appliedButton}
// //         disabled={true}
// //         onClick={(e) => e.stopPropagation()}
// //         type="button"
// //       >
// //         <CheckCircle size={16} /> Applied
// //       </button>
// //     );
// //   }

// //   return (
// //     <div className={styles.applyButtonWrapper}>
// //       <button
// //         className={styles.applyButton}
// //         disabled={loadingState.applying}
// //         onClick={handleClick}
// //         type="button"
// //       >
// //         <Zap size={16} /> {loadingState.applying ? "Applying..." : "Apply Now"}
// //       </button>

// //       {showLoginPrompt && (
// //         <div className={styles.loginPrompt}>
// //           <div className={styles.loginPromptHeader}>
// //             <h4>Login Required</h4>
// //             <button
// //               onClick={() => setShowLoginPrompt(false)}
// //               className={styles.closeLoginPrompt}
// //               aria-label="Close"
// //             >
// //               <X size={16} />
// //             </button>
// //           </div>

// //           <p>Please login to apply for this position</p>

// //           <div className={styles.loginOptions}>
// //             <GoogleLoginButton
// //               onLoginSuccess={() => {
// //                 setShowLoginPrompt(false);
// //                 onApplyClick({ stopPropagation: () => { } }, job);
// //               }}
// //             />

// //             <button
// //               className={styles.cancelLogin}
// //               onClick={() => setShowLoginPrompt(false)}
// //             >
// //               Cancel
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const EMPLOYMENT_TYPES = [
// //   "Full-time",
// //   "Part-time",
// //   "Internship",
// //   "Remote",
// //   "Contract",
// //   "Freelance"
// // ];

// // const JOB_TITLE_OPTIONS = [
// //   "Frontend Developer",
// //   "Backend Developer",
// //   "Full Stack Developer",
// //   "MERN Stack Developer",
// //   "Java Developer",
// //   "Python Developer",
// //   "Data Scientist",
// //   "UI/UX Designer",
// //   "DevOps Engineer",
// //   "QA / Tester",
// //   "Product Manager",
// //   "HR Recruiter",
// //   "Business Analyst",
// //   "System Administrator",
// //   "Network Engineer",
// //   "Mobile App Developer"
// // ];

// // // =========================================================================================
// // // COMPONENT 1: BulkCSVReviewModal
// // // =========================================================================================
// // const BulkCSVReviewModal = ({ isOpen, onClose, jobsData, onSave, onBulkSubmit, refereesList }) => {
// //   const [editingIndex, setEditingIndex] = useState(null);
// //   const [editedJobs, setEditedJobs] = useState([]);
// //   const [currentPage, setCurrentPage] = useState(0);
// //   const [expandedRows, setExpandedRows] = useState({});
// //   const jobsPerPage = 5;

// //   useEffect(() => {
// //     if (isOpen && jobsData) {
// //       setEditedJobs([...jobsData]);
// //       setExpandedRows({});
// //     }
// //   }, [isOpen, jobsData]);

// //   if (!isOpen || !jobsData) return null;

// //   const totalPages = Math.ceil(editedJobs.length / jobsPerPage);
// //   const startIndex = currentPage * jobsPerPage;
// //   const endIndex = startIndex + jobsPerPage;
// //   const currentJobs = editedJobs.slice(startIndex, endIndex);

// //   const handleEdit = (index) => {
// //     setEditingIndex(startIndex + index);
// //   };

// //   const handleSaveEdit = (index) => {
// //     setEditingIndex(null);
// //   };

// //   const handleCancelEdit = () => {
// //     setEditingIndex(null);
// //     if (jobsData) {
// //       setEditedJobs([...jobsData]);
// //     }
// //   };

// //   const handleFieldChange = (pageIndex, field, value) => {
// //     const actualIndex = startIndex + pageIndex;
// //     const updatedJobs = [...editedJobs];
// //     updatedJobs[actualIndex] = {
// //       ...updatedJobs[actualIndex],
// //       [field]: value
// //     };
// //     setEditedJobs(updatedJobs);
// //   };

// //   const handleSaveAll = () => {
// //     onSave(editedJobs);
// //   };

// //   const handleSubmitAll = () => {
// //     onBulkSubmit(editedJobs);
// //   };

// //   const handleRemoveJob = (pageIndex) => {
// //     const actualIndex = startIndex + pageIndex;
// //     const updatedJobs = [...editedJobs];
// //     updatedJobs.splice(actualIndex, 1);
// //     setEditedJobs(updatedJobs);

// //     if (currentJobs.length === 1 && currentPage > 0) {
// //       setCurrentPage(currentPage - 1);
// //     }
// //   };

// //   const toggleRowExpansion = (pageIndex) => {
// //     const actualIndex = startIndex + pageIndex;
// //     setExpandedRows(prev => ({
// //       ...prev,
// //       [actualIndex]: !prev[actualIndex]
// //     }));
// //   };

// //   return (
// //     <div className={styles.bulkModalOverlay}>
// //       <div className={styles.bulkModal}>
// //         <div className={styles.bulkModalHeader}>
// //           <h2>Review & Edit CSV Jobs</h2>
// //           <button onClick={onClose} className={styles.closeBulkModal} aria-label="Close modal">
// //             <X size={24} />
// //           </button>
// //         </div>

// //         <div className={styles.bulkStats}>
// //           <span>Total Jobs: <strong>{editedJobs.length}</strong></span>
// //           <span>Page: <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong></span>
// //           <span>Editing: <strong>{editingIndex !== null ? 'Yes' : 'No'}</strong></span>
// //         </div>

// //         <div className={styles.bulkTableContainer}>
// //           <table className={styles.bulkTable}>
// //             <thead>
// //               <tr>
// //                 <th>#</th>
// //                 <th>Job Title</th>
// //                 <th>Company</th>
// //                 <th>Job Role</th>
// //                 <th>Type</th>
// //                 <th>Location</th>
// //                 <th>Experience</th>
// //                 <th>Salary</th>
// //                 <th>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {currentJobs.map((job, index) => {
// //                 const actualIndex = startIndex + index;
// //                 const isEditing = editingIndex === actualIndex;
// //                 const isExpanded = expandedRows[actualIndex];

// //                 return (
// //                   <React.Fragment key={actualIndex}>
// //                     <tr>
// //                       <td>{startIndex + index + 1}</td>
// //                       <td>
// //                         {isEditing ?
// //                           <input
// //                             value={job.title}
// //                             onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
// //                             className={styles.bulkInput}
// //                           /> :
// //                           job.title
// //                         }
// //                       </td>
// //                       <td>
// //                         {isEditing ?
// //                           <input
// //                             value={job.companyName}
// //                             onChange={(e) => handleFieldChange(index, 'companyName', e.target.value)}
// //                             className={styles.bulkInput}
// //                           /> :
// //                           job.companyName
// //                         }
// //                       </td>
// //                       <td>
// //                         {isEditing ?
// //                           <input
// //                             value={job.role || ''}
// //                             onChange={(e) => handleFieldChange(index, 'role', e.target.value)}
// //                             className={styles.bulkInput}
// //                           /> :
// //                           job.role || 'N/A'
// //                         }
// //                       </td>
// //                       <td>
// //                         {isEditing ? (
// //                           <select
// //                             value={job.employmentType}
// //                             onChange={(e) => handleFieldChange(index, 'employmentType', e.target.value)}
// //                             className={styles.bulkSelect}
// //                           >
// //                             {EMPLOYMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
// //                           </select>
// //                         ) : job.employmentType}
// //                       </td>
// //                       <td>
// //                         {isEditing ?
// //                           <input
// //                             value={job.location}
// //                             onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
// //                             className={styles.bulkInput}
// //                           /> :
// //                           job.location
// //                         }
// //                       </td>
// //                       <td>
// //                         {isEditing ?
// //                           <input
// //                             value={job.experience}
// //                             onChange={(e) => handleFieldChange(index, 'experience', e.target.value)}
// //                             className={styles.bulkInput}
// //                           /> :
// //                           job.experience
// //                         }
// //                       </td>
// //                       <td>
// //                         {isEditing ?
// //                           <input
// //                             value={job.salary}
// //                             onChange={(e) => handleFieldChange(index, 'salary', e.target.value)}
// //                             className={styles.bulkInput}
// //                           /> :
// //                           job.salary
// //                         }
// //                       </td>
// //                       <td>
// //                         <div className={styles.bulkActions}>
// //                           <div className={styles.bulkActionButtons}>
// //                             {isEditing ? (
// //                               <>
// //                                 <button onClick={() => handleSaveEdit(index)} className={styles.bulkSaveBtn}>
// //                                   <Check size={16} />
// //                                 </button>
// //                                 <button onClick={handleCancelEdit} className={styles.bulkCancelBtn}>
// //                                   <X size={16} />
// //                                 </button>
// //                               </>
// //                             ) : (
// //                               <>
// //                                 <button onClick={() => handleEdit(index)} className={styles.bulkEditBtn}>
// //                                   <Edit size={16} />
// //                                 </button>
// //                                 <button onClick={() => handleRemoveJob(index)} className={styles.bulkDeleteBtn}>
// //                                   <Trash2 size={16} />
// //                                 </button>
// //                               </>
// //                             )}
// //                           </div>
// //                           <button onClick={() => toggleRowExpansion(index)} className={styles.bulkExpandBtn}>
// //                             {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
// //                             {isExpanded ? 'Show Less' : 'Show More'}
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                     {isExpanded && (
// //                       <tr className={styles.bulkExpandedRow}>
// //                         <td colSpan="9">
// //                           <div className={styles.bulkExpandedContent}>
// //                             <div className={styles.bulkFieldGroup}>
// //                               <label>Education</label>
// //                               {isEditing ?
// //                                 <input
// //                                   value={job.education || ''}
// //                                   onChange={(e) => handleFieldChange(index, 'education', e.target.value)}
// //                                   className={styles.bulkInput}
// //                                 /> :
// //                                 <div>{job.education || 'N/A'}</div>
// //                               }
// //                             </div>
// //                             <div className={styles.bulkFieldGroup}>
// //                               <label>Passed Out Year</label>
// //                               {isEditing ?
// //                                 <input
// //                                   value={job.passedOutYear || ''}
// //                                   onChange={(e) => handleFieldChange(index, 'passedOutYear', e.target.value)}
// //                                   className={styles.bulkInput}
// //                                 /> :
// //                                 <div>{job.passedOutYear || 'N/A'}</div>
// //                               }
// //                             </div>
// //                             <div className={styles.bulkFieldGroup}>
// //                               <label>Key Skills</label>
// //                               {isEditing ?
// //                                 <input
// //                                   value={job.keySkills || ''}
// //                                   onChange={(e) => handleFieldChange(index, 'keySkills', e.target.value)}
// //                                   className={styles.bulkInput}
// //                                 /> :
// //                                 <div>{job.keySkills || 'N/A'}</div>
// //                               }
// //                             </div>
// //                             <div className={styles.bulkFieldGroup}>
// //                               <label>Refereed Person (ID)</label>
// //                               {isEditing ? (
// //                                 <select
// //                                   value={job.refereedBy || ''}
// //                                   onChange={(e) => handleFieldChange(index, 'refereedBy', e.target.value)}
// //                                   className={styles.bulkSelect}
// //                                 >
// //                                   <option value="">Select a Referee (Optional)</option>
// //                                   {refereesList && refereesList.map((referee) => (
// //                                     <option key={referee._id} value={referee._id}>
// //                                       {referee.name || referee.email || "Unknown Name"}
// //                                     </option>
// //                                   ))}
// //                                 </select>
// //                               ) :
// //                                 <div>{job.refereedBy ? (refereesList?.find(r => r._id === job.refereedBy)?.name || 'Referee Selected') : 'None'}</div>
// //                               }
// //                             </div>
// //                             <div className={styles.bulkFieldGroup}>
// //                               <label>Description</label>
// //                               {isEditing ?
// //                                 <textarea
// //                                   value={job.description || ''}
// //                                   onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
// //                                   className={styles.bulkTextarea}
// //                                 /> :
// //                                 <div className={styles.bulkDescription}>{job.description || 'N/A'}</div>
// //                               }
// //                             </div>
// //                           </div>
// //                         </td>
// //                       </tr>
// //                     )}
// //                   </React.Fragment>
// //                 );
// //               })}
// //             </tbody>
// //           </table>
// //         </div>

// //         <div className={styles.bulkPagination}>
// //           <button
// //             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
// //             disabled={currentPage === 0}
// //             className={`${styles.bulkPageButton} ${currentPage === 0 ? styles.disabled : ''}`}
// //           >
// //             <ChevronLeft size={16} /> Previous
// //           </button>
// //           <button
// //             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
// //             disabled={currentPage === totalPages - 1}
// //             className={`${styles.bulkPageButton} ${currentPage === totalPages - 1 ? styles.disabled : ''}`}
// //           >
// //             Next <ChevronRight size={16} />
// //           </button>
// //         </div>

// //         <div className={styles.bulkFooterButtons}>
// //           <button onClick={handleSaveAll} className={styles.bulkSaveAllButton}>
// //             Save Changes
// //           </button>
// //           <button onClick={handleSubmitAll} className={styles.bulkSubmitAllButton}>
// //             Submit All Jobs
// //           </button>
// //           <button onClick={onClose} className={styles.bulkCancelButton}>
// //             Cancel
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // BulkCSVReviewModal.propTypes = {
// //   isOpen: PropTypes.bool.isRequired,
// //   onClose: PropTypes.func.isRequired,
// //   jobsData: PropTypes.array,
// //   onSave: PropTypes.func.isRequired,
// //   onBulkSubmit: PropTypes.func.isRequired,
// //   refereesList: PropTypes.array
// // };

// // // =========================================================================================
// // // COMPONENT 2: ProvidedForm (Enhanced)
// // // =========================================================================================
// // const ProvidedForm = ({ isOpen, onClose, onSubmit, initialData }) => {
// //   const [title, setTitle] = useState('');
// //   const [companyName, setCompanyName] = useState('');
// //   const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
// //   const [location, setLocation] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [education, setEducation] = useState('');
// //   const [passedOutYear, setPassedOutYear] = useState('');
// //   const [experience, setExperience] = useState('');
// //   const [salary, setSalary] = useState('');
// //   const [role, setRole] = useState('');
// //   const [keySkills, setKeySkills] = useState('');

// //   const { memberContext } = useData();
// //   const [refereedBy, setRefereedBy] = useState('');
// //   const [refereesList, setRefereesList] = useState([]);

// //   useEffect(() => {
// //     if (memberContext) {
// //       const filtered = memberContext.filter(m => m.memberType === 'Referee');
// //       setRefereesList(filtered);
// //     }
// //   }, [memberContext]);

// //   useEffect(() => {
// //     if (isOpen) {
// //       if (initialData) {
// //         setTitle(initialData.title || '');
// //         setCompanyName(initialData.companyName || '');
// //         setEmploymentType(initialData.employmentType || EMPLOYMENT_TYPES[0]);
// //         setLocation(initialData.location || '');
// //         setDescription(initialData.description || '');
// //         setEducation(initialData.education || '');
// //         setPassedOutYear(initialData.passedOutYear || '');
// //         setExperience(initialData.experience || '');
// //         setSalary(initialData.salary || '');
// //         setRole(initialData.role || '');
// //         setKeySkills(initialData.keySkills || '');

// //         const refId = initialData.refereedBy && typeof initialData.refereedBy === 'object'
// //           ? initialData.refereedBy._id
// //           : (initialData.refereedBy || '');

// //         setRefereedBy(refId);
// //       } else {
// //         setTitle('');
// //         setCompanyName('');
// //         setEmploymentType(EMPLOYMENT_TYPES[0]);
// //         setLocation('');
// //         setDescription('');
// //         setEducation('');
// //         setPassedOutYear('');
// //         setExperience('');
// //         setSalary('');
// //         setRole('');
// //         setKeySkills('');
// //         setRefereedBy('');
// //       }
// //     }
// //   }, [isOpen, initialData]);

// //   const handleFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
// //     if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
// //       alert('Please upload a valid CSV file');
// //       e.target.value = '';
// //       return;
// //     }

// //     if (file.size > 5 * 1024 * 1024) {
// //       alert('File size should be less than 5MB');
// //       e.target.value = '';
// //       return;
// //     }

// //     const reader = new FileReader();
// //     reader.onload = (event) => {
// //       try {
// //         const text = event.target.result;
// //         const rows = text.split('\n').filter(row => row.trim() !== '');
// //         if (rows.length < 2) {
// //           alert("CSV is empty or invalid format");
// //           return;
// //         }

// //         const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
// //         const bulkData = [];

// //         for (let i = 1; i < rows.length; i++) {
// //           const values = rows[i].split(',').map(v => v.trim());
// //           const entry = {};
// //           headers.forEach((header, index) => {
// //             entry[header] = values[index] || "";
// //           });

// //           bulkData.push({
// //             title: entry.title,
// //             companyName: entry.companyname || entry.companyName || "",
// //             role: entry.role || "",
// //             employmentType: entry.employmenttype || entry.employmentType || "Full-time",
// //             location: entry.location || "",
// //             experience: entry.experience || "",
// //             salary: entry.salary || "",
// //             education: entry.education || "",
// //             passedOutYear: entry.passedoutyear || entry.passedOutYear || "",
// //             keySkills: entry.keyskills || entry.keySkills || "",
// //             description: entry.description || "",
// //             refereedBy: ""
// //           });
// //         }

// //         if (bulkData.length === 1) {
// //           const job = bulkData[0];
// //           setTitle(job.title);
// //           setCompanyName(job.companyName);
// //           setRole(job.role);
// //           setEmploymentType(job.employmentType);
// //           setLocation(job.location);
// //           setExperience(job.experience);
// //           setSalary(job.salary);
// //           setEducation(job.education);
// //           setPassedOutYear(job.passedOutYear);
// //           setKeySkills(job.keySkills);
// //           setDescription(job.description);
// //           setRefereedBy('');
// //           alert("Data loaded into form. Review and click Post.");
// //         } else {
// //           onSubmit(bulkData, true);
// //         }
// //       } catch (error) {
// //         console.error("CSV parsing error:", error);
// //         alert("Error parsing CSV file. Please check the format.");
// //       }
// //     };

// //     reader.onerror = () => {
// //       alert("Error reading file. Please try again.");
// //     };

// //     reader.readAsText(file);
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSubmit({
// //       title, companyName, employmentType, location, description,
// //       education, passedOutYear, experience, salary, role, keySkills,
// //       refereedBy: refereedBy || null
// //     }, false);
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div className={styles.modalOverlay}>
// //       <div className={styles.modalContent}>
// //         <div className={styles.modalHeader}>
// //           <h2>{initialData ? 'Edit Job Post' : 'Create Job Post'}</h2>
// //           <button onClick={onClose} className={styles.closeModalBtn} aria-label="Close modal">
// //             <X size={24} />
// //           </button>
// //         </div>

// //         {!initialData && (
// //           <div className={styles.csvUploadSection}>
// //             <input type="file" accept=".csv" id="csv-upload" className={styles.csvInput} onChange={handleFileChange} />
// //             <label htmlFor="csv-upload" className={styles.csvUploadButton}>
// //               <FileText size={18} /> Upload CSV Format
// //             </label>
// //           </div>
// //         )}

// //         <form onSubmit={handleSubmit}>
// //           <div className={styles.formGroup}>
// //             <label>
// //               <BookOpen size={14} /> Job Title <span className={styles.required}>*</span>
// //             </label>
// //             <input
// //               list="jobTitleOptions"
// //               className={styles.formInput}
// //               type="text"
// //               value={title}
// //               onChange={(e) => setTitle(e.target.value)}
// //               placeholder="Select or Type Job Title"
// //               required
// //             />
// //             <datalist id="jobTitleOptions">
// //               {JOB_TITLE_OPTIONS.map((opt, i) => <option key={i} value={opt} />)}
// //             </datalist>
// //           </div>

// //           <div className={styles.formRow}>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <Building size={14} /> Company Name
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={companyName}
// //                 onChange={(e) => setCompanyName(e.target.value)}
// //                 placeholder="e.g. Google"
// //               />
// //             </div>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <Target size={14} /> Job Role
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={role}
// //                 onChange={(e) => setRole(e.target.value)}
// //                 placeholder="e.g. System Admin"
// //               />
// //             </div>
// //           </div>

// //           <div className={styles.formRow}>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <Calendar size={14} /> Employment Type
// //               </label>
// //               <select
// //                 className={styles.formSelect}
// //                 value={employmentType}
// //                 onChange={(e) => setEmploymentType(e.target.value)}
// //               >
// //                 {EMPLOYMENT_TYPES.map(type => (
// //                   <option key={type} value={type}>{type}</option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <MapPin size={14} /> Location
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={location}
// //                 onChange={(e) => setLocation(e.target.value)}
// //                 placeholder="e.g. Bangalore"
// //               />
// //             </div>
// //           </div>

// //           <div className={styles.formRow}>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <TrendingUp size={14} /> Experience
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={experience}
// //                 onChange={(e) => setExperience(e.target.value)}
// //                 placeholder="e.g. 2-5 Years"
// //               />
// //             </div>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <DollarSign size={14} /> Salary
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={salary}
// //                 onChange={(e) => setSalary(e.target.value)}
// //                 placeholder="e.g. 4-6 LPA"
// //               />
// //             </div>
// //           </div>

// //           <div className={styles.formRow}>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <GraduationCap size={14} /> Education
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={education}
// //                 onChange={(e) => setEducation(e.target.value)}
// //                 placeholder="e.g. B.E / B.Tech"
// //               />
// //             </div>
// //             <div className={styles.formGroup}>
// //               <label>
// //                 <Award size={14} /> Passout Year
// //               </label>
// //               <input
// //                 className={styles.formInput}
// //                 type="text"
// //                 value={passedOutYear}
// //                 onChange={(e) => setPassedOutYear(e.target.value)}
// //                 placeholder="e.g. 2023"
// //               />
// //             </div>
// //           </div>

// //           <div className={styles.formGroup}>
// //             <label>
// //               <Users size={14} /> Refereed Person (Optional)
// //             </label>
// //             <select
// //               className={styles.formSelect}
// //               value={refereedBy}
// //               onChange={(e) => setRefereedBy(e.target.value)}
// //             >
// //               <option value="">Select a Referee (Optional)</option>
// //               {refereesList.length > 0 ? (
// //                 refereesList.map((referee) => (
// //                   <option key={referee._id} value={referee._id}>
// //                     {referee.name || referee.email || "Unknown Name"}
// //                   </option>
// //                 ))
// //               ) : (
// //                 <option disabled>No referees found</option>
// //               )}
// //             </select>
// //           </div>

// //           <div className={styles.formGroup}>
// //             <label>
// //               <Sparkles size={14} /> Key Skills
// //             </label>
// //             <input
// //               className={styles.formInput}
// //               type="text"
// //               value={keySkills}
// //               onChange={(e) => setKeySkills(e.target.value)}
// //               placeholder="e.g. React, Node.js, SQL"
// //             />
// //           </div>

// //           <div className={styles.formGroup}>
// //             <label>
// //               <FileText size={14} /> Description <span className={styles.required}>*</span>
// //             </label>
// //             <textarea
// //               className={styles.formTextarea}
// //               value={description}
// //               onChange={(e) => setDescription(e.target.value)}
// //               placeholder="Describe the job role..."
// //               required
// //             />
// //           </div>

// //           <button type="submit" className={styles.submitButton}>
// //             {initialData ? 'Update Job' : 'Post Job'}
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // ProvidedForm.propTypes = {
// //   isOpen: PropTypes.bool.isRequired,
// //   onClose: PropTypes.func.isRequired,
// //   onSubmit: PropTypes.func.isRequired,
// //   initialData: PropTypes.shape({
// //     title: PropTypes.string,
// //     companyName: PropTypes.string,
// //     employmentType: PropTypes.string,
// //     location: PropTypes.string,
// //     description: PropTypes.string,
// //     education: PropTypes.string,
// //     passedOutYear: PropTypes.string,
// //     experience: PropTypes.string,
// //     salary: PropTypes.string,
// //     role: PropTypes.string,
// //     keySkills: PropTypes.string,
// //     refereedBy: PropTypes.oneOfType([
// //       PropTypes.string,
// //       PropTypes.shape({
// //         _id: PropTypes.string,
// //         name: PropTypes.string
// //       })
// //     ])
// //   })
// // };

// // // =========================================================================================
// // // COMPONENT 3: ResumeUploadModal (Enhanced)
// // // =========================================================================================
// // const ResumeUploadModal = ({ isOpen, onClose, onUpload, jobTitle, user, onGoogleLogin }) => {
// //   const [resumeFile, setResumeFile] = useState(null);
// //   const [fileName, setFileName] = useState('');
// //   const [isUploading, setIsUploading] = useState(false);
// //   const [showGoogleLogin, setShowGoogleLogin] = useState(false);

// //   useEffect(() => {
// //     if (isOpen) {
// //       setResumeFile(null);
// //       setFileName('');
// //       setIsUploading(false);
// //       setShowGoogleLogin(!user);
// //     }
// //   }, [isOpen, user]);

// //   if (!isOpen) return null;

// //   const handleFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
// //       if (!allowedTypes.includes(file.type)) {
// //         alert('Please upload a PDF or Word document only');
// //         return;
// //       }

// //       if (file.size > 5 * 1024 * 1024) {
// //         alert('File size should be less than 5MB');
// //         return;
// //       }

// //       setResumeFile(file);
// //       setFileName(file.name);
// //     }
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!user) {
// //       setShowGoogleLogin(true);
// //       return;
// //     }

// //     if (!resumeFile) {
// //       alert('Please select a resume file');
// //       return;
// //     }

// //     setIsUploading(true);
// //     try {
// //       await onUpload(resumeFile);
// //       setResumeFile(null);
// //       setFileName('');
// //       onClose();
// //     } catch (error) {
// //       alert('Failed to upload resume');
// //     } finally {
// //       setIsUploading(false);
// //     }
// //   };

// //   const handleGoogleLogin = () => {
// //     if (onGoogleLogin) {
// //       onGoogleLogin(() => {
// //         setShowGoogleLogin(false);
// //       });
// //     }
// //   };

// //   const handleClose = () => {
// //     setResumeFile(null);
// //     setFileName('');
// //     setIsUploading(false);
// //     setShowGoogleLogin(false);
// //     onClose();
// //   };

// //   return (
// //     <div className={styles.resumeModalOverlay}>
// //       <div className={styles.resumeModal}>
// //         <div className={styles.resumeModalHeader}>
// //           <h3>Upload Resume for {jobTitle}</h3>
// //           <button onClick={handleClose} className={styles.closeResumeModal} aria-label="Close modal">
// //             <X size={24} />
// //           </button>
// //         </div>

// //         {showGoogleLogin ? (
// //           <div className={styles.resumeLoginSection}>
// //             <p>Please login to apply for this position</p>
// //             <div className={styles.resumeLoginOptions}>
// //               <GoogleLoginButton
// //                 onLoginSuccess={() => {
// //                   setShowGoogleLogin(false);
// //                 }}
// //               />
// //               <button
// //                 className={styles.resumeCancelButton}
// //                 onClick={handleClose}
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </div>
// //         ) : (
// //           <form onSubmit={handleSubmit} className={styles.resumeForm}>
// //             <input
// //               type="file"
// //               id="resume-upload"
// //               accept=".pdf,.doc,.docx"
// //               onChange={handleFileChange}
// //               className={styles.resumeFileInput}
// //             />

// //             <label
// //               htmlFor="resume-upload"
// //               className={styles.resumeUploadArea}
// //             >
// //               <div className={styles.uploadIcon}>
// //                 <FileText size={24} />
// //                 <span>Click to select resume</span>
// //               </div>
// //               <div className={styles.uploadHint}>
// //                 (PDF/DOC/DOCX, max 5MB)
// //               </div>

// //               {fileName ? (
// //                 <div className={styles.selectedFile}>
// //                   <FileText size={16} />
// //                   <span><strong>Selected:</strong> {fileName}</span>
// //                 </div>
// //               ) : (
// //                 <div className={styles.noFile}>
// //                   No file selected
// //                 </div>
// //               )}
// //             </label>

// //             <button
// //               type="submit"
// //               disabled={!resumeFile || isUploading}
// //               className={`${styles.resumeSubmitButton} ${(!resumeFile || isUploading) ? styles.disabled : ''}`}
// //             >
// //               {isUploading ? 'Uploading...' : 'Upload & Apply'}
// //             </button>
// //           </form>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // ResumeUploadModal.propTypes = {
// //   isOpen: PropTypes.bool.isRequired,
// //   onClose: PropTypes.func.isRequired,
// //   onUpload: PropTypes.func.isRequired,
// //   jobTitle: PropTypes.string,
// //   user: PropTypes.object,
// //   onGoogleLogin: PropTypes.func
// // };

// // // =========================================================================================
// // // Enhanced Status Pipeline Component
// // // =========================================================================================
// // const EnhancedStatusPipeline = ({ status }) => {
// //   const steps = [
// //     { key: 'Submitted', label: 'Applied', icon: '📝' },
// //     { key: 'Review', label: 'Under Review', icon: '🔍' },
// //     { key: 'Interview', label: 'Interview', icon: '💼' },
// //     { key: 'Offer', label: 'Offer', icon: '📄' },
// //     { key: 'Hired', label: 'Hired', icon: '🎉' },
// //   ];

// //   const currentIndex = steps.findIndex(step => step.key === status);

// //   return (
// //     <div className={styles.statusPipeline}>
// //       {steps.map((step, index) => (
// //         <div
// //           key={step.key}
// //           className={`${styles.statusStep} ${index < currentIndex ? styles.completed :
// //               index === currentIndex ? styles.active : ''
// //             }`}
// //         >
// //           <div className={styles.stepIcon}>
// //             <span>{step.icon}</span>
// //           </div>
// //           <div className={styles.stepLabel}>{step.label}</div>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // // =========================================================================================
// // // MAIN COMPONENT: Jobs (Enhanced UI)
// // // =========================================================================================
// // function Jobs() {
// //   const [globalFilter, setGlobalFilter] = useState('');
// //   const [jobPosts, setJobPosts] = useState([]);
// //   const [myPost, setMyPost] = useState([]);
// //   const [view, setView] = useState('request');
// //   const [page, setPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [showProvidedModal, setShowProvidedModal] = useState(false);
// //   const [filtersExpanded, setFiltersExpanded] = useState(true); // NEW: Filter expand state

// //   const { sidebarCollapsed } = useOutletContext();
// //   const sidebarWidth = sidebarCollapsed ? 90 : 280;

// //   const [filters, setFilters] = useState({
// //     title: "",
// //     companyName: "",
// //     role: "",
// //     employmentType: "",
// //     location: "",
// //     experience: "",
// //     salary: "",
// //     education: "",
// //     passedOutYear: "",
// //     keySkills: "",
// //     refereedBy: "",
// //     description: "",
// //     startDate: null,
// //     endDate: null,
// //     initialNumber: "",
// //     finalNumber: ""
// //   });

// //   const [pendingFilters, setPendingFilters] = useState({});
// //   const [hasPendingChanges, setHasPendingChanges] = useState(false);
// //   const [datePickerOpen, setDatePickerOpen] = useState({
// //     startDate: false,
// //     endDate: false
// //   });

// //   const [showBulkReviewModal, setShowBulkReviewModal] = useState(false);
// //   const [bulkReviewJobs, setBulkReviewJobs] = useState([]);
// //   const [showResumeModal, setShowResumeModal] = useState(false);
// //   const [selectedJob, setSelectedJob] = useState(null);
// //   const [editingJob, setEditingJob] = useState(null);
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const [loadingState, setLoadingState] = useState({
// //     fetching: false,
// //     applying: false,
// //     uploading: false,
// //     deleting: false,
// //     filtering: false
// //   });
// //   const [error, setError] = useState(null);

// //   const { user } = useAuth();
// //   const { jobContext, memberContext } = useData();
// //   const navigate = useNavigate();
// //   const headerRef = useRef(null);
// //   const [headerHeight, setHeaderHeight] = useState(280);

// //   const [refereesList, setRefereesList] = useState([]);

// //   // Google OAuth State
// //   const [googleUser, setGoogleUser] = useState(null);
// //   const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);

// //   // Backend URL for Local file serving
// //   const BACKEND_URL = import.meta.env.VITE_API_URL;

// //   // Constants
// //   const JOBS_PER_PAGE = 10;

// //   // Calculate active filter count
// //   const activeFilterCount = Object.keys(filters).filter(key =>
// //     filters[key] && filters[key] !== "" && filters[key] !== null
// //   ).length;

// //   // Google Login Handler
// //   const handleGoogleLogin = async (callback) => {
// //     try {
// //       const mockGoogleUser = {
// //         id: 'google-123',
// //         name: 'Google User',
// //         email: 'user@gmail.com',
// //         picture: 'https://via.placeholder.com/40',
// //         provider: 'google'
// //       };

// //       setGoogleUser(mockGoogleUser);

// //       if (callback) callback();
// //     } catch (error) {
// //       console.error('Google login failed:', error);
// //       alert('Google login failed. Please try again.');
// //     }
// //   };

// //   // Check if job is applied
// //   const checkIsApplied = (job, userId) => {
// //     if (!job.appliedMembers || !userId || job.appliedMembers.length === 0) {
// //       return false;
// //     }

// //     const userIdStr = String(userId).trim();

// //     return job.appliedMembers.some(app => {
// //       const possibleIds = [
// //         app.memberId?._id,
// //         app.memberId,
// //         app.member?._id,
// //         app.member,
// //         app.userId?._id,
// //         app.userId,
// //         app.applicantId?._id,
// //         app.applicantId,
// //         app._id
// //       ].filter(id => id != null);

// //       const found = possibleIds.some(id => String(id).trim() === userIdStr);
// //       return found;
// //     });
// //   };

// //   // Get application status
// //   const getMyApplicationStatus = (job) => {
// //     if (!job.appliedMembers || !user?.memberId) return null;

// //     const userIdStr = String(user.memberId).trim();
// //     const application = job.appliedMembers.find(app => {
// //       const possibleIds = [
// //         app.memberId?._id,
// //         app.memberId,
// //         app.member?._id,
// //         app.member,
// //         app.userId?._id,
// //         app.userId,
// //         app.applicantId?._id,
// //         app.applicantId,
// //         app._id
// //       ].filter(id => id != null);

// //       return possibleIds.some(id => String(id).trim() === userIdStr);
// //     });

// //     return application ? application.status || "Applied" : null;
// //   };

// //   useEffect(() => {
// //     if (memberContext) {
// //       const filtered = memberContext.filter(m => m.memberType === 'Referee');
// //       setRefereesList(filtered);
// //     }
// //   }, [memberContext]);

// //   useEffect(() => {
// //     if (datePickerOpen.startDate || datePickerOpen.endDate) {
// //       document.body.classList.add('date-picker-open');
// //     } else {
// //       document.body.classList.remove('date-picker-open');
// //     }

// //     return () => {
// //       document.body.classList.remove('date-picker-open');
// //     };
// //   }, [datePickerOpen.startDate, datePickerOpen.endDate]);

// //   // Effect to calculate header height
// //   useEffect(() => {
// //     const updateHeaderHeight = () => {
// //       if (headerRef.current) {
// //         const height = headerRef.current.offsetHeight;
// //         setHeaderHeight(height + 20);
// //       }
// //     };

// //     updateHeaderHeight();
// //     const timer = setTimeout(updateHeaderHeight, 100);
// //     return () => clearTimeout(timer);
// //   }, [filters, pendingFilters, view, sidebarWidth, filtersExpanded]);

// //   // Apply filters to a given job array
// //   const applyFilters = useCallback((jobs) => {
// //     const search = globalFilter.trim().toLowerCase();

// //     const {
// //       title,
// //       companyName,
// //       role,
// //       employmentType,
// //       location,
// //       experience,
// //       salary,
// //       education,
// //       passedOutYear,
// //       keySkills,
// //       refereedBy,
// //       description,
// //       startDate,
// //       endDate,
// //       initialNumber,
// //       finalNumber
// //     } = filters;

// //     const titleFilter = title?.trim().toLowerCase() || "";
// //     const companyFilter = companyName?.trim().toLowerCase() || "";
// //     const roleFilter = role?.trim().toLowerCase() || "";
// //     const locationFilter = location?.trim().toLowerCase() || "";
// //     const experienceFilter = experience?.trim().toLowerCase() || "";
// //     const salaryFilter = salary?.trim().toLowerCase() || "";
// //     const educationFilter = education?.trim().toLowerCase() || "";
// //     const passoutFilter = passedOutYear?.trim().toLowerCase() || "";
// //     const keySkillsFilter = keySkills?.trim().toLowerCase() || "";
// //     const descriptionFilter = description?.trim().toLowerCase() || "";
// //     const refereedByFilter = refereedBy?.trim().toLowerCase() || "";

// //     const toDate = (val) => {
// //       if (!val) return null;
// //       if (val instanceof Date) return val;
// //       return new Date(val);
// //     };

// //     const start = toDate(startDate);
// //     const end = toDate(endDate);

// //     return jobs.filter((job) => {
// //       if (search) {
// //         const haystack = [
// //           job.title,
// //           job.companyName,
// //           job.location,
// //           job.role,
// //           job.description,
// //           job.keySkills
// //         ]
// //           .filter(Boolean)
// //           .join(" ")
// //           .toLowerCase();

// //         if (!haystack.includes(search)) return false;
// //       }

// //       if (titleFilter) {
// //         if (!(job.title || "").toLowerCase().includes(titleFilter)) return false;
// //       }

// //       if (companyFilter) {
// //         if (!(job.companyName || "").toLowerCase().includes(companyFilter)) return false;
// //       }

// //       if (roleFilter) {
// //         if (!(job.role || "").toLowerCase().includes(roleFilter)) return false;
// //       }

// //       if (locationFilter) {
// //         if (!(job.location || "").toLowerCase().includes(locationFilter)) return false;
// //       }

// //       if (experienceFilter) {
// //         if (!(job.experience || "").toLowerCase().includes(experienceFilter)) return false;
// //       }

// //       if (salaryFilter) {
// //         if (!(job.salary || "").toLowerCase().includes(salaryFilter)) return false;
// //       }

// //       if (educationFilter) {
// //         if (!(job.education || "").toLowerCase().includes(educationFilter)) return false;
// //       }

// //       if (passoutFilter) {
// //         if (!(String(job.passedOutYear || "")).toLowerCase().includes(passoutFilter)) return false;
// //       }

// //       if (keySkillsFilter) {
// //         const jobSkills = (job.keySkills || "").toLowerCase();
// //         if (!jobSkills.includes(keySkillsFilter)) return false;
// //       }

// //       if (descriptionFilter) {
// //         if (!(job.description || "").toLowerCase().includes(descriptionFilter)) return false;
// //       }

// //       if (employmentType && job.employmentType !== employmentType) {
// //         return false;
// //       }

// //       if (refereedByFilter) {
// //         const refName = (job.refereedBy?.name || job.refereedBy?.email || "").toLowerCase();
// //         if (!refName.includes(refereedByFilter)) return false;
// //       }

// //       if (start || end) {
// //         if (!job.createdAt) return false;
// //         const created = new Date(job.createdAt);
// //         if (start && created < start) return false;
// //         if (end && created > end) return false;
// //       }

// //       const applicantsCount = job.appliedMembers?.length || 0;

// //       if (initialNumber !== "" && initialNumber != null) {
// //         if (applicantsCount < Number(initialNumber)) return false;
// //       }

// //       if (finalNumber !== "" && finalNumber != null) {
// //         if (applicantsCount > Number(finalNumber)) return false;
// //       }

// //       return true;
// //     });
// //   }, [filters, globalFilter]);

// //   // Derived filtered lists (Memoized)
// //   const filteredJobPosts = useMemo(() => applyFilters(jobPosts), [jobPosts, applyFilters]);

// //   const filteredMyPost = useMemo(() => {
// //     if (view === "myPost") {
// //       if (user?.role === 'Admin') {
// //         return applyFilters(jobPosts);
// //       } else {
// //         if (!user) return [];

// //         const memberJobs = jobPosts.filter(job => {
// //           return checkIsApplied(job, user?.memberId);
// //         });

// //         return applyFilters(memberJobs);
// //       }
// //     }
// //     return [];
// //   }, [view, jobPosts, user, applyFilters, checkIsApplied]);

// //   // Paginated jobs based on view
// //   const paginatedJobs = useMemo(() => {
// //     const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
// //     return source.slice(
// //       (page - 1) * JOBS_PER_PAGE,
// //       page * JOBS_PER_PAGE
// //     );
// //   }, [view, filteredMyPost, filteredJobPosts, page]);

// //   // Update total pages when filtered results change
// //   useEffect(() => {
// //     const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
// //     const newTotalPages = Math.ceil(source.length / JOBS_PER_PAGE);
// //     setTotalPages(newTotalPages || 1);

// //     if (page > newTotalPages && newTotalPages > 0) {
// //       setPage(1);
// //     }
// //   }, [view, filteredMyPost, filteredJobPosts, page]);

// //   // Scroll to top when page changes
// //   useEffect(() => {
// //     const mainContent = document.querySelector(`.${styles.jobs}`) || window;
// //     if (mainContent.scrollIntoView) {
// //       mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
// //     } else {
// //       window.scrollTo({ top: 0, behavior: 'smooth' });
// //     }
// //   }, [page, view]);

// //   const handleClick = (job) => {
// //     navigate(`/jobs/${job._id}`);
// //   };

// //   // Unique lists for selects
// //   const locationOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.location && set.add(j.location));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const companyOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.companyName && set.add(j.companyName));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const titleOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.title && set.add(j.title));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const roleOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.role && set.add(j.role));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const experienceOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.experience && set.add(j.experience));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const salaryOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.salary && set.add(j.salary));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const educationOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.education && set.add(j.education));
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const passedOutYearOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => j.passedOutYear && set.add(j.passedOutYear));
// //     return Array.from(set).sort((a, b) => b - a);
// //   }, [jobPosts]);

// //   const keySkillsOptions = React.useMemo(() => {
// //     const set = new Set();
// //     jobPosts.forEach(j => {
// //       if (j.keySkills) {
// //         j.keySkills.split(",").forEach(skill => {
// //           const trimmed = skill.trim();
// //           if (trimmed) set.add(trimmed);
// //         });
// //       }
// //     });
// //     return Array.from(set);
// //   }, [jobPosts]);

// //   const formatDateForDisplay = (date) => {
// //     if (!date) return '';
// //     if (typeof date === 'string') {
// //       date = new Date(date);
// //     }
// //     return date.toLocaleDateString('en-US', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric'
// //     });
// //   };

// //   const handleDateChange = (field, date) => {
// //     handleFilterChange(field, date);
// //     setDatePickerOpen(prev => ({ ...prev, [field]: false }));
// //   };

// //   const getFileUrl = (url) => {
// //     if (!url) return "#";
// //     if (url.startsWith("uploads") || url.includes("\\")) {
// //       return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
// //     }
// //     return url;
// //   };

// //   const getPipelineStatus = (dbStatus) => {
// //     switch (dbStatus) {
// //       case 'Applied': return 'Submitted';
// //       case 'Review': return 'Review';
// //       case 'Shortlisted': return 'Interview';
// //       case 'Offer': return 'Offer';
// //       case 'Accepted': return 'Hired';
// //       case 'Rejected': return 'Rejected';
// //       default: return 'Submitted';
// //     }
// //   };

// //   const hasDefaultResume = () => {
// //     return user?.resumeLink ? true : false;
// //   };

// //   const fetchJobPosts = async () => {
// //     try {
// //       setLoadingState(prev => ({ ...prev, fetching: true }));
// //       setError(null);

// //       const res = await API.get('/service');
// //       const allJobs = res.data.data;
// //       setJobPosts(allJobs);

// //       if (user) {
// //         if (user?.role === 'Admin') {
// //           setMyPost(allJobs);
// //         } else {
// //           const myApplications = allJobs.filter(job =>
// //             checkIsApplied(job, user?.memberId)
// //           );
// //           setMyPost(myApplications);
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error fetching jobs:", error);
// //       setError("Unable to load jobs. Please try again later.");
// //       if (jobContext && jobContext.length > 0) setJobPosts(jobContext);
// //     } finally {
// //       setLoadingState(prev => ({ ...prev, fetching: false }));
// //     }
// //   };

// //   const handleDelete = async (jobId, e) => {
// //     e.stopPropagation();
// //     if (!window.confirm("Are you sure you want to delete this job post?")) return;

// //     try {
// //       setLoadingState(prev => ({ ...prev, deleting: true }));
// //       await API.delete(`/service/${jobId}`);
// //       setJobPosts(prev => prev.filter(job => job._id !== jobId));
// //       setMyPost(prev => prev.filter(job => job._id !== jobId));
// //       alert("Job deleted successfully");
// //     } catch (error) {
// //       console.error("Delete failed:", error);
// //       alert("Failed to delete job.");
// //     } finally {
// //       setLoadingState(prev => ({ ...prev, deleting: false }));
// //     }
// //   };

// //   const handleStatusChange = async (jobId, memberId, newStatus) => {
// //     try {
// //       await API.patch(`/service/status`, { jobId, memberId, status: newStatus });
// //       alert(`Status updated to ${newStatus}`);
// //       fetchJobPosts();
// //     } catch (error) {
// //       console.error("Failed to update status", error);
// //       alert("Failed to update status. Please try again.");
// //     }
// //   };

// //   const uploadToCloudinary = async (file) => {
// //     if (!file) return null;
// //     const cloudName = "dwelwaavj";
// //     const uploadPreset = "jobbridge_preset";
// //     const api = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

// //     const data = new FormData();
// //     data.append("file", file);
// //     data.append("upload_preset", uploadPreset);

// //     try {
// //       setLoadingState(prev => ({ ...prev, uploading: true }));
// //       const res = await axios.post(api, data);
// //       return res.data.secure_url;
// //     } catch (error) {
// //       console.error("Cloudinary Upload Error:", error);
// //       throw new Error("Failed to upload file to cloud.");
// //     } finally {
// //       setLoadingState(prev => ({ ...prev, uploading: false }));
// //     }
// //   };

// //   const handleApply = async (job, resumeFile = null) => {
// //     try {
// //       setLoadingState(prev => ({ ...prev, applying: true }));

// //       if (!user) {
// //         setSelectedJob(job);
// //         setShowGoogleLoginModal(true);
// //         return;
// //       }

// //       if (!resumeFile && user?.role === 'Member') {
// //         setSelectedJob(job);
// //         setShowResumeModal(true);
// //         return;
// //       }

// //       let finalResumeLink = null;
// //       if (resumeFile) {
// //         finalResumeLink = await uploadToCloudinary(resumeFile);
// //       }

// //       const applyRes = await API.post(`/service/${job._id}/apply`, {
// //         resumeLink: finalResumeLink
// //       });

// //       alert("Applied successfully");
// //       fetchJobPosts();
// //       setShowResumeModal(false);
// //     } catch (error) {
// //       alert(error.response?.data?.message || "Failed to apply");
// //     } finally {
// //       setLoadingState(prev => ({ ...prev, applying: false }));
// //     }
// //   };

// //   const handleUploadAndApply = async (resumeFile) => {
// //     if (selectedJob) {
// //       await handleApply(selectedJob, resumeFile);
// //     }
// //   };

// //   const handleApplyClick = (e, job) => {
// //     e.stopPropagation();
// //     if (isApplied(job)) return;

// //     if (hasDefaultResume()) {
// //       const useDefault = window.confirm(
// //         "You have a default resume on file. Would you like to use it?\n\n" +
// //         "Click OK to use default resume\n" +
// //         "Click Cancel to upload a different resume"
// //       );

// //       if (useDefault) {
// //         handleApply(job);
// //       } else {
// //         setSelectedJob(job);
// //         setShowResumeModal(true);
// //       }
// //     } else {
// //       setSelectedJob(job);
// //       setShowResumeModal(true);
// //     }
// //   };

// //   const handleEditClick = (e, job) => {
// //     e.stopPropagation();
// //     setEditingJob(job);
// //     setShowProvidedModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowProvidedModal(false);
// //     setEditingJob(null);
// //   };

// //   const handleUpdateProvided = async (jobData) => {
// //     if (isSubmitting) return;
// //     setIsSubmitting(true);

// //     const dataToSend = {
// //       ...jobData,
// //       refereedBy: jobData.refereedBy || null
// //     };

// //     try {
// //       const response = await API.patch(`/service/${editingJob._id}`, dataToSend);
// //       const updatedJob = response.data.data || response.data;

// //       setJobPosts(prev => prev.map(job => (job._id === updatedJob._id ? updatedJob : job)));
// //       setMyPost(prev => prev.map(job => (job._id === updatedJob._id ? updatedJob : job)));

// //       alert("Job updated successfully!");
// //       handleCloseModal();
// //     } catch (error) {
// //       console.error("Error updating Job:", error);
// //       alert("Failed to update job.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const handleAddProvided = async (jobData) => {
// //     if (isSubmitting) return;
// //     setIsSubmitting(true);

// //     const dataToSend = {
// //       ...jobData,
// //       refereedBy: jobData.refereedBy || null
// //     };

// //     try {
// //       const response = await API.post('/service', dataToSend);
// //       const newJob = response.data.data || response.data;

// //       setJobPosts(prev => [newJob, ...prev]);

// //       if (user?.role === 'Admin') {
// //         setMyPost(prev => [newJob, ...prev]);
// //       }

// //       handleCloseModal();
// //       alert("Job posted successfully!");
// //     } catch (error) {
// //       console.error("Error adding Job:", error);
// //       alert("Failed to save job.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const handleBulkCSVUpload = (data) => {
// //     setBulkReviewJobs(data);
// //     setShowBulkReviewModal(true);
// //   };

// //   const handleSaveBulkJobs = (editedJobs) => {
// //     setBulkReviewJobs(editedJobs);
// //     alert(`Saved ${editedJobs.length} jobs. Ready to submit.`);
// //   };

// //   const handleSubmitBulkJobs = async (editedJobs) => {
// //     if (!editedJobs.length) return;

// //     setIsSubmitting(true);
// //     try {
// //       const jobsToSubmit = editedJobs.map(job => ({
// //         ...job,
// //         refereedBy: job.refereedBy || null
// //       }));

// //       const uploadPromises = jobsToSubmit.map(job => API.post('/service', job));
// //       await Promise.all(uploadPromises);

// //       alert(`${editedJobs.length} jobs uploaded successfully!`);
// //       fetchJobPosts();
// //       setShowBulkReviewModal(false);
// //     } catch (error) {
// //       alert("Error during bulk upload. Some jobs may not have posted.");
// //       console.error(error);
// //       fetchJobPosts();
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const handleFormSubmit = async (data, isBulk = false) => {
// //     if (isBulk) {
// //       handleBulkCSVUpload(data);
// //     } else {
// //       if (editingJob) {
// //         handleUpdateProvided(data);
// //       } else {
// //         handleAddProvided(data);
// //       }
// //     }
// //   };

// //   const buildJobsExportRows = () => {
// //     const source = view === "myPost" ? filteredMyPost : filteredJobPosts;

// //     return source.map(j => ({
// //       JobTitle: j.title || "",
// //       CompanyName: j.companyName || "",
// //       EmploymentType: j.employmentType || "",
// //       Location: j.location || "",
// //       Role: j.role || "",
// //       Education: j.education || "",
// //       Experience: j.experience || "",
// //       Salary: j.salary || "",
// //       PassoutYear: j.passedOutYear || "",
// //       KeySkills: j.keySkills || "",
// //       RefereedBy: j.refereedBy?.name || "",
// //       Description: j.description || "",
// //       PostedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "",
// //       Applicants: j.appliedMembers?.length || 0
// //     }));
// //   };

// //   const exportJobsToExcel = () => {
// //     const data = buildJobsExportRows();
// //     const ws = XLSX.utils.json_to_sheet(data);
// //     const wb = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, "Jobs");

// //     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
// //     saveAs(new Blob([buffer]), `Jobs_${new Date().toISOString().slice(0, 10)}.xlsx`);
// //   };

// //   const exportJobsToCSV = () => {
// //     const data = buildJobsExportRows();
// //     const ws = XLSX.utils.json_to_sheet(data);
// //     const csv = XLSX.utils.sheet_to_csv(ws);

// //     saveAs(
// //       new Blob([csv], { type: "text/csv;charset=utf-8;" }),
// //       `Jobs_${new Date().toISOString().slice(0, 10)}.csv`
// //     );
// //   };

// //   const isApplied = (job) => checkIsApplied(job, user?.memberId);

// //   const renderStatusBadge = (status) => {
// //     let stylesObj = { bg: '#e0f2fe', color: '#0369a1', icon: '📝', text: 'Applied' };
// //     if (status === 'Review') stylesObj = { bg: '#f3e8ff', color: '#7e22ce', icon: '🔍', text: 'Under Review' };
// //     else if (status === 'Shortlisted') stylesObj = { bg: '#fef3c7', color: '#d97706', icon: '⭐', text: 'Shortlisted' };
// //     else if (status === 'Offer') stylesObj = { bg: '#ccfbf1', color: '#0f766e', icon: '📄', text: 'Offer Sent' };
// //     else if (status === 'Accepted') stylesObj = { bg: '#dcfce7', color: '#166534', icon: '✅', text: 'Accepted' };
// //     else if (status === 'Rejected') stylesObj = { bg: '#fee2e2', color: '#991b1b', icon: '❌', text: 'Rejected' };

// //     return (
// //       <div className={styles.statusBadge} style={{ backgroundColor: stylesObj.bg, color: stylesObj.color }}>
// //         <span>{stylesObj.icon}</span> <span>{stylesObj.text}</span>
// //       </div>
// //     );
// //   };

// //   const renderAdminActionButtons = (request) => (
// //     <div className={styles.adminActions}>
// //       <button onClick={(e) => handleEditClick(e, request)} title="Edit Post" className={styles.btnEdit}>
// //         <Pencil size={18} />
// //       </button>
// //       <button onClick={(e) => handleDelete(request._id, e)} title="Delete Post" className={styles.btnDelete}>
// //         <Trash2 size={18} />
// //       </button>
// //     </div>
// //   );

// //   const handleResetFilters = () => {
// //     setGlobalFilter('');
// //     setFilters({
// //       title: "",
// //       companyName: "",
// //       role: "",
// //       employmentType: "",
// //       location: "",
// //       experience: "",
// //       salary: "",
// //       education: "",
// //       passedOutYear: "",
// //       keySkills: "",
// //       refereedBy: "",
// //       description: "",
// //       startDate: null,
// //       endDate: null,
// //       initialNumber: "",
// //       finalNumber: ""
// //     });
// //     setPendingFilters({});
// //     setHasPendingChanges(false);
// //     setPage(1);
// //   };

// //   const debouncedSearch = useCallback(
// //     debounce((value) => {
// //       setGlobalFilter(value);
// //       setPage(1);
// //     }, 300),
// //     []
// //   );

// //   const handleSearchChange = (e) => {
// //     debouncedSearch(e.target.value);
// //   };

// //   const handleFilterChange = (name, value) => {
// //     setPendingFilters(prev => ({ ...prev, [name]: value }));
// //     setHasPendingChanges(true);
// //   };

// //   const applyPendingFilters = () => {
// //     const newFilters = { ...filters, ...pendingFilters };
// //     setFilters(newFilters);
// //     setPendingFilters({});
// //     setHasPendingChanges(false);
// //     setPage(1);
// //   };

// //   const cancelPendingFilters = () => {
// //     setPendingFilters({});
// //     setHasPendingChanges(false);
// //   };

// //   const clearAllFilters = () => {
// //     setFilters({
// //       title: "",
// //       companyName: "",
// //       role: "",
// //       employmentType: "",
// //       location: "",
// //       experience: "",
// //       salary: "",
// //       education: "",
// //       passedOutYear: "",
// //       keySkills: "",
// //       refereedBy: "",
// //       description: "",
// //       startDate: null,
// //       endDate: null,
// //       initialNumber: "",
// //       finalNumber: ""
// //     });
// //     setPendingFilters({});
// //     setHasPendingChanges(false);
// //     setPage(1);
// //   };

// //   const resetFilter = (name) => {
// //     const newPendingFilters = { ...pendingFilters };
// //     delete newPendingFilters[name];
// //     setPendingFilters(newPendingFilters);
// //     setHasPendingChanges(Object.keys(newPendingFilters).length > 0);
// //   };

// //   const getDisplayValue = (fieldName) => {
// //     if (pendingFilters[fieldName] !== undefined) {
// //       return pendingFilters[fieldName];
// //     }
// //     return filters[fieldName] || "";
// //   };

// //   const hasActiveFilter = (fieldName) => {
// //     return filters[fieldName] !== undefined &&
// //       filters[fieldName] !== "" &&
// //       filters[fieldName] !== null;
// //   };

// //   const customSelectStyles = {
// //     control: (base, state) => ({
// //       ...base,
// //       minHeight: '36px',
// //       height: '36px',
// //       fontSize: '13px',
// //       borderColor: state.isFocused ? '#4f46e5' : '#d1d5db',
// //       borderRadius: '8px',
// //       boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none',
// //       '&:hover': {
// //         borderColor: state.isFocused ? '#4f46e5' : '#9ca3af',
// //       },
// //     }),
// //     valueContainer: (base) => ({
// //       ...base,
// //       height: '34px',
// //       padding: '0 8px',
// //       alignItems: 'center',
// //     }),
// //     singleValue: (base) => ({
// //       ...base,
// //       fontSize: '13px',
// //       margin: 0,
// //       lineHeight: '1',
// //     }),
// //     placeholder: (base) => ({
// //       ...base,
// //       fontSize: '13px',
// //       margin: 0,
// //       lineHeight: '1',
// //       color: '#9ca3af',
// //     }),
// //     input: (base) => ({
// //       ...base,
// //       margin: 0,
// //       padding: 0,
// //       fontSize: '13px',
// //     }),
// //     indicatorsContainer: (base) => ({
// //       ...base,
// //       height: '34px',
// //     }),
// //     indicatorSeparator: () => ({
// //       display: 'none',
// //     }),
// //     dropdownIndicator: (base) => ({
// //       ...base,
// //       padding: '6px',
// //     }),
// //     clearIndicator: (base) => ({
// //       ...base,
// //       padding: '6px',
// //     }),
// //     menu: (base) => ({
// //       ...base,
// //       fontSize: '13px',
// //       zIndex: 9999,
// //       minWidth: '180px',
// //       borderRadius: '8px',
// //       border: '1px solid #e5e7eb',
// //       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
// //     }),
// //     menuPortal: (base) => ({
// //       ...base,
// //       zIndex: 9999,
// //     }),
// //     option: (base, state) => ({
// //       ...base,
// //       fontSize: '13px',
// //       padding: '8px 12px',
// //       minHeight: '36px',
// //       display: 'flex',
// //       alignItems: 'center',
// //       backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : 'white',
// //       color: state.isSelected ? 'white' : '#374151',
// //       '&:hover': {
// //         backgroundColor: '#f3f4f6',
// //       },
// //     }),
// //   };

// //   useEffect(() => {
// //     fetchJobPosts();
// //   }, [user, jobContext]);

// //   const totalJobs = view === "myPost" ? filteredMyPost.length : filteredJobPosts.length;
// //   const totalAllJobs = view === "myPost" ? myPost.length : jobPosts.length;

// //   return (
// //     <div className={styles.jobs}>
// //       {/* HEADER */}
// //       <div
// //         ref={headerRef}
// //         className={classNames(styles.headerWrapper, {
// //           [styles.sidebarCollapsed]: sidebarCollapsed
// //         })}
// //         style={{
// //           left: sidebarWidth + 'px',
// //           width: `calc(100% - ${sidebarWidth}px)`
// //         }}
// //       >
// //         <div className={styles.headerContent}>
// //           {/* Top Row: Search, Tabs, Export Buttons */}
// //           <div className={styles.topRow}>
// //             {/* Quick search */}
// //             <div className={styles.cardSearch}>
// //               <div className={styles.searchIcon}>
// //                 <Search size={20} />
// //               </div>
// //               <input
// //                 type="text"
// //                 placeholder="Search jobs, companies, or skills..."
// //                 value={globalFilter || ""}
// //                 onChange={handleSearchChange}
// //                 aria-label="Search jobs"
// //               />
// //             </div>

// //             {/* Tabs */}
// //             <div className={styles.tabsContainer}>
// //               <div
// //                 className={classNames(styles.tab, {
// //                   [styles.active]: view === "request",
// //                 })}
// //                 onClick={() => setView("request")}
// //                 role="button"
// //                 tabIndex={0}
// //                 onKeyDown={(e) => e.key === "Enter" && setView("request")}
// //               >
// //                 <div className={styles.tabIcon}>
// //                   <NotebookPen size={24} />
// //                 </div>
// //                 <button type="button" className={styles.tabLabel}>
// //                   Job Posts
// //                 </button>
// //               </div>

// //               <div
// //                 className={classNames(styles.tab, {
// //                   [styles.active]: view === "myPost",
// //                 })}
// //                 onClick={() => setView("myPost")}
// //                 role="button"
// //                 tabIndex={0}
// //                 onKeyDown={(e) => e.key === "Enter" && setView("myPost")}
// //               >
// //                 <div className={styles.tabIcon}>
// //                   <BriefcaseBusiness size={24} />
// //                 </div>
// //                 <button type="button" className={styles.tabLabel}>
// //                   {user?.role === "Admin" ? "Applicants" : "My Jobs"}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* EXPORT BUTTONS */}
// //             {user?.role === "Admin" && (
// //               <div className={styles.exportButtons}>
// //                 <button onClick={exportJobsToExcel} className={styles.excelButton}>
// //                   Export Excel
// //                 </button>
// //                 <button onClick={exportJobsToCSV} className={styles.csvButton}>
// //                   Export CSV
// //                 </button>
// //               </div>
// //             )}
// //           </div>

// //           {/* Horizontal Filter Bar */}
// //           <div className={styles.horizontalFilterBar}>
// //             <div className={styles.filterHeader}>
// //               <h3 className={styles.filterTitle}>
// //                 <Filter size={18} /> Advanced Filters
// //               </h3>
// //               <button
// //                 onClick={() => setFiltersExpanded(!filtersExpanded)}
// //                 className={styles.filterToggleButton}
// //                 aria-label={filtersExpanded ? "Minimize filters" : "Maximize filters"}
// //                 type="button"
// //               >
// //                 {filtersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
// //                 {filtersExpanded ? 'Minimize' : 'Expand'}
// //               </button>
// //             </div>

// //             {!filtersExpanded && activeFilterCount > 0 && (
// //               <div className={styles.filterSummary}>
// //                 <span>Active Filters:</span>
// //                 <span className={styles.activeFilterCount}>{activeFilterCount} active</span>
// //               </div>
// //             )}

// //             {filtersExpanded && (
// //               <>
// //                 <div className={styles.filterScrollContainer}>
// //                   <div className={styles.filterRow}>
// //                     {/* Job Title Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="title">
// //                         📝 JOB TITLE
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Titles' },
// //                             ...titleOptions.map(title => ({
// //                               value: title,
// //                               label: title
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('title') ? {
// //                             value: getDisplayValue('title'),
// //                             label: getDisplayValue('title')
// //                           } : { value: '', label: 'All Titles' }}
// //                           onChange={(selected) => handleFilterChange('title', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search title..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.title !== undefined && pendingFilters.title !== filters.title && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('title')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Company Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="companyName">
// //                         🏢 COMPANY
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Companies' },
// //                             ...companyOptions.map(company => ({
// //                               value: company,
// //                               label: company
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('companyName') ? {
// //                             value: getDisplayValue('companyName'),
// //                             label: getDisplayValue('companyName')
// //                           } : { value: '', label: 'All Companies' }}
// //                           onChange={(selected) => handleFilterChange('companyName', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search company..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.companyName !== undefined && pendingFilters.companyName !== filters.companyName && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('companyName')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Job Role Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="role">
// //                         🎯 JOB ROLE
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Roles' },
// //                             ...roleOptions.map(role => ({
// //                               value: role,
// //                               label: role
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('role') ? {
// //                             value: getDisplayValue('role'),
// //                             label: getDisplayValue('role')
// //                           } : { value: '', label: 'All Roles' }}
// //                           onChange={(selected) => handleFilterChange('role', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search role..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.role !== undefined && pendingFilters.role !== filters.role && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('role')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Employment Type Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="employmentType">
// //                         ⏰ EMPLOYMENT TYPE
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Types' },
// //                             ...EMPLOYMENT_TYPES.map(type => ({
// //                               value: type,
// //                               label: type
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('employmentType') ? {
// //                             value: getDisplayValue('employmentType'),
// //                             label: getDisplayValue('employmentType')
// //                           } : { value: '', label: 'All Types' }}
// //                           onChange={(selected) => handleFilterChange('employmentType', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search type..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.employmentType !== undefined && pendingFilters.employmentType !== filters.employmentType && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('employmentType')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Location Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="location">
// //                         📍 LOCATION
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Locations' },
// //                             ...locationOptions.map(location => ({
// //                               value: location,
// //                               label: location
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('location') ? {
// //                             value: getDisplayValue('location'),
// //                             label: getDisplayValue('location')
// //                           } : { value: '', label: 'All Locations' }}
// //                           onChange={(selected) => handleFilterChange('location', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search location..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.location !== undefined && pendingFilters.location !== filters.location && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('location')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Experience Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="experience">
// //                         📈 EXPERIENCE
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Experience' },
// //                             ...experienceOptions.map(exp => ({
// //                               value: exp,
// //                               label: exp
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('experience') ? {
// //                             value: getDisplayValue('experience'),
// //                             label: getDisplayValue('experience')
// //                           } : { value: '', label: 'All Experience' }}
// //                           onChange={(selected) => handleFilterChange('experience', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search experience..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.experience !== undefined && pendingFilters.experience !== filters.experience && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('experience')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Salary Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="salary">
// //                         💰 SALARY
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Salaries' },
// //                             ...salaryOptions.map(salary => ({
// //                               value: salary,
// //                               label: salary
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('salary') ? {
// //                             value: getDisplayValue('salary'),
// //                             label: getDisplayValue('salary')
// //                           } : { value: '', label: 'All Salaries' }}
// //                           onChange={(selected) => handleFilterChange('salary', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search salary..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.salary !== undefined && pendingFilters.salary !== filters.salary && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('salary')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Education Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="education">
// //                         🎓 EDUCATION
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Education' },
// //                             ...educationOptions.map(edu => ({
// //                               value: edu,
// //                               label: edu
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('education') ? {
// //                             value: getDisplayValue('education'),
// //                             label: getDisplayValue('education')
// //                           } : { value: '', label: 'All Education' }}
// //                           onChange={(selected) => handleFilterChange('education', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search education..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.education !== undefined && pendingFilters.education !== filters.education && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('education')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Passed Out Year Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="passedOutYear">
// //                         🎓 PASSOUT YEAR
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Years' },
// //                             ...passedOutYearOptions.map(year => ({
// //                               value: year,
// //                               label: year
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('passedOutYear') ? {
// //                             value: getDisplayValue('passedOutYear'),
// //                             label: getDisplayValue('passedOutYear')
// //                           } : { value: '', label: 'All Years' }}
// //                           onChange={(selected) => handleFilterChange('passedOutYear', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Select year..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.passedOutYear !== undefined && pendingFilters.passedOutYear !== filters.passedOutYear && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('passedOutYear')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Key Skills Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="keySkills">
// //                         ✨ KEY SKILLS
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Skills' },
// //                             ...keySkillsOptions.map(skill => ({
// //                               value: skill,
// //                               label: skill
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('keySkills') ? {
// //                             value: getDisplayValue('keySkills'),
// //                             label: getDisplayValue('keySkills')
// //                           } : { value: '', label: 'All Skills' }}
// //                           onChange={(selected) => handleFilterChange('keySkills', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search skills..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.keySkills !== undefined && pendingFilters.keySkills !== filters.keySkills && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('keySkills')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Refereed Person Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="refereedBy">
// //                         👤 REFEREED BY
// //                       </label>
// //                       <div className={styles.selectContainer}>
// //                         <Select
// //                           options={[
// //                             { value: '', label: 'All Referees' },
// //                             ...refereesList.map(referee => ({
// //                               value: referee.name || referee.email || "Unknown",
// //                               label: referee.name || referee.email || "Unknown"
// //                             }))
// //                           ]}
// //                           value={getDisplayValue('refereedBy') ? {
// //                             value: getDisplayValue('refereedBy'),
// //                             label: getDisplayValue('refereedBy')
// //                           } : { value: '', label: 'All Referees' }}
// //                           onChange={(selected) => handleFilterChange('refereedBy', selected?.value || "")}
// //                           isSearchable
// //                           isClearable
// //                           placeholder="Search referee..."
// //                           styles={customSelectStyles}
// //                           className={styles.reactSelect}
// //                           menuPortalTarget={document.body}
// //                           menuPosition="fixed"
// //                         />
// //                         {pendingFilters.refereedBy !== undefined && pendingFilters.refereedBy !== filters.refereedBy && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('refereedBy')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Description Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="description">
// //                         📄 DESCRIPTION
// //                       </label>
// //                       <div className={styles.textInputContainer}>
// //                         <input
// //                           type="text"
// //                           className={styles.textInput}
// //                           placeholder="Contains text..."
// //                           value={getDisplayValue('description') || ''}
// //                           onChange={(e) => handleFilterChange('description', e.target.value)}
// //                         />
// //                         {pendingFilters.description !== undefined && pendingFilters.description !== filters.description && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('description')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Posted From Date Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="startDate">
// //                         📅 POSTED FROM
// //                       </label>
// //                       <div className={styles.dateInputContainer}>
// //                         <div
// //                           className={`${styles.dateInput} ${getDisplayValue('startDate') ? styles.hasValue : ''}`}
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             setDatePickerOpen(prev => ({
// //                               ...prev,
// //                               startDate: !prev.startDate,
// //                               endDate: false
// //                             }));
// //                           }}
// //                           role="button"
// //                           tabIndex={0}
// //                         >
// //                           {getDisplayValue('startDate') ?
// //                             formatDateForDisplay(getDisplayValue('startDate')) :
// //                             'Select date...'
// //                           }
// //                           <ChevronDown size={14} className={`${styles.dateDropdownIcon} ${datePickerOpen.startDate ? styles.open : ''}`} />
// //                         </div>

// //                         {datePickerOpen.startDate && (
// //                           <>
// //                             <div
// //                               className={styles.datePickerBackdrop}
// //                               onClick={(e) => {
// //                                 e.stopPropagation();
// //                                 setDatePickerOpen(prev => ({ ...prev, startDate: false }));
// //                               }}
// //                             />
// //                             <div className={styles.datePickerPopup}>
// //                               <input
// //                                 type="date"
// //                                 className={styles.datePickerInput}
// //                                 value={getDisplayValue('startDate') ?
// //                                   new Date(getDisplayValue('startDate')).toISOString().split('T')[0] :
// //                                   ''
// //                                 }
// //                                 onChange={(e) => {
// //                                   e.stopPropagation();
// //                                   handleDateChange('startDate', e.target.value);
// //                                 }}
// //                                 max={getDisplayValue('endDate') || undefined}
// //                                 onClick={(e) => e.stopPropagation()}
// //                                 autoFocus
// //                               />
// //                               <div className={styles.datePickerActions}>
// //                                 <button
// //                                   className={styles.datePickerButton}
// //                                   onClick={(e) => {
// //                                     e.stopPropagation();
// //                                     handleDateChange('startDate', '');
// //                                   }}
// //                                   type="button"
// //                                 >
// //                                   Clear
// //                                 </button>
// //                                 <button
// //                                   className={styles.datePickerButton}
// //                                   onClick={(e) => {
// //                                     e.stopPropagation();
// //                                     setDatePickerOpen(prev => ({ ...prev, startDate: false }));
// //                                   }}
// //                                   type="button"
// //                                 >
// //                                   Close
// //                                 </button>
// //                               </div>
// //                             </div>
// //                           </>
// //                         )}

// //                         {pendingFilters.startDate !== undefined && pendingFilters.startDate !== filters.startDate && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('startDate')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Posted To Date Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="endDate">
// //                         📅 POSTED TO
// //                       </label>
// //                       <div className={styles.dateInputContainer}>
// //                         <div
// //                           className={`${styles.dateInput} ${getDisplayValue('endDate') ? styles.hasValue : ''}`}
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             setDatePickerOpen(prev => ({
// //                               ...prev,
// //                               endDate: !prev.endDate,
// //                               startDate: false
// //                             }));
// //                           }}
// //                           role="button"
// //                           tabIndex={0}
// //                         >
// //                           {getDisplayValue('endDate') ?
// //                             formatDateForDisplay(getDisplayValue('endDate')) :
// //                             'Select date...'
// //                           }
// //                           <ChevronDown size={14} className={`${styles.dateDropdownIcon} ${datePickerOpen.endDate ? styles.open : ''}`} />
// //                         </div>

// //                         {datePickerOpen.endDate && (
// //                           <>
// //                             <div
// //                               className={styles.datePickerBackdrop}
// //                               onClick={(e) => {
// //                                 e.stopPropagation();
// //                                 setDatePickerOpen(prev => ({ ...prev, endDate: false }));
// //                               }}
// //                             />
// //                             <div className={styles.datePickerPopup}>
// //                               <input
// //                                 type="date"
// //                                 className={styles.datePickerInput}
// //                                 value={getDisplayValue('endDate') ?
// //                                   new Date(getDisplayValue('endDate')).toISOString().split('T')[0] :
// //                                   ''
// //                                 }
// //                                 onChange={(e) => {
// //                                   e.stopPropagation();
// //                                   handleDateChange('endDate', e.target.value);
// //                                 }}
// //                                 min={getDisplayValue('startDate') || undefined}
// //                                 onClick={(e) => e.stopPropagation()}
// //                                 autoFocus
// //                               />
// //                               <div className={styles.datePickerActions}>
// //                                 <button
// //                                   className={styles.datePickerButton}
// //                                   onClick={(e) => {
// //                                     e.stopPropagation();
// //                                     handleDateChange('endDate', '');
// //                                   }}
// //                                   type="button"
// //                                 >
// //                                   Clear
// //                                 </button>
// //                                 <button
// //                                   className={styles.datePickerButton}
// //                                   onClick={(e) => {
// //                                     e.stopPropagation();
// //                                     setDatePickerOpen(prev => ({ ...prev, endDate: false }));
// //                                   }}
// //                                   type="button"
// //                                 >
// //                                   Close
// //                                 </button>
// //                               </div>
// //                             </div>
// //                           </>
// //                         )}

// //                         {pendingFilters.endDate !== undefined && pendingFilters.endDate !== filters.endDate && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('endDate')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Min Applicants Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="initialNumber">
// //                         👥 MIN APPLICANTS
// //                       </label>
// //                       <div className={styles.numberInputContainer}>
// //                         <input
// //                           type="number"
// //                           className={styles.numberInput}
// //                           placeholder="0"
// //                           min="0"
// //                           value={getDisplayValue('initialNumber') || ''}
// //                           onChange={(e) => handleFilterChange('initialNumber', e.target.value || '')}
// //                         />
// //                         {pendingFilters.initialNumber !== undefined && pendingFilters.initialNumber !== filters.initialNumber && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('initialNumber')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Max Applicants Filter */}
// //                     <div className={styles.filterField}>
// //                       <label className={styles.filterLabel} htmlFor="finalNumber">
// //                         👥 MAX APPLICANTS
// //                       </label>
// //                       <div className={styles.numberInputContainer}>
// //                         <input
// //                           type="number"
// //                           className={styles.numberInput}
// //                           placeholder="∞"
// //                           min="0"
// //                           value={getDisplayValue('finalNumber') || ''}
// //                           onChange={(e) => handleFilterChange('finalNumber', e.target.value || '')}
// //                         />
// //                         {pendingFilters.finalNumber !== undefined && pendingFilters.finalNumber !== filters.finalNumber && (
// //                           <button
// //                             className={styles.resetFilterButton}
// //                             onClick={() => resetFilter('finalNumber')}
// //                             title="Reset to previous value"
// //                             type="button"
// //                           >
// //                             <X size={12} />
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Apply/Cancel Buttons for pending filters */}
// //                 {hasPendingChanges && (
// //                   <div className={styles.pendingActions}>
// //                     <button
// //                       className={styles.applyFiltersButton}
// //                       onClick={applyPendingFilters}
// //                       type="button"
// //                     >
// //                       Apply Filters
// //                     </button>
// //                     <button
// //                       className={styles.cancelFiltersButton}
// //                       onClick={cancelPendingFilters}
// //                       type="button"
// //                     >
// //                       Cancel
// //                     </button>
// //                     <span className={styles.pendingCount}>
// //                       {Object.keys(pendingFilters).length} pending change(s)
// //                     </span>
// //                   </div>
// //                 )}

// //                 {/* Clear All Filters Button */}
// //                 {(Object.keys(filters).some(key => filters[key] && filters[key] !== "") || hasPendingChanges) && (
// //                   <div className={styles.clearAllContainer}>
// //                     <button
// //                       className={styles.clearAllButton}
// //                       onClick={clearAllFilters}
// //                       title="Clear all filters"
// //                       type="button"
// //                     >
// //                       <Filter size={14} /> Clear All
// //                     </button>
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Spacer with DYNAMIC height */}
// //       <div
// //         className={styles.headerSpacer}
// //         style={{ height: `${headerHeight}px` }}
// //       ></div>

// //       {/* Statistics Banner */}
// //       <div className={styles.statsBanner}>
// //         <div className={styles.statsContent}>
// //           <div className={styles.statItem}>
// //             <span className={styles.statNumber}>{totalJobs}</span>
// //             <span className={styles.statLabel}>Jobs Found</span>
// //           </div>
// //           <div className={styles.statItem}>
// //             <span className={styles.statNumber}>{totalAllJobs}</span>
// //             <span className={styles.statLabel}>Total Jobs</span>
// //           </div>
// //           {totalJobs !== totalAllJobs && (
// //             <div className={styles.statItem}>
// //               <span className={styles.statNumber}>
// //                 {Math.round((totalJobs / totalAllJobs) * 100)}%
// //               </span>
// //               <span className={styles.statLabel}>Match Rate</span>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Error Display */}
// //       {error && (
// //         <div className={styles.errorAlert}>
// //           <div className={styles.errorContent}>
// //             <XCircle size={20} />
// //             <span>{error}</span>
// //           </div>
// //           <button onClick={() => setError(null)} className={styles.closeError} type="button">
// //             <X size={16} />
// //           </button>
// //         </div>
// //       )}

// //       {/* VIEW 1: JOB REQUESTS (Public/All) */}
// //       {view === 'request' && <>
// //         <div className={styles.paginationTop}>
// //           <button
// //             onClick={() => page > 1 && setPage(page - 1)}
// //             disabled={page === 1 || loadingState.fetching}
// //             type="button"
// //             className={styles.paginationButton}
// //           >
// //             <ChevronLeft size={16} /> Previous
// //           </button>
// //           <span className={styles.pageInfo}>
// //             Page <span className={styles.currentPage}>{page}</span> of {totalPages}
// //           </span>
// //           <button
// //             onClick={() => page < totalPages && setPage(page + 1)}
// //             disabled={page === totalPages || loadingState.fetching}
// //             type="button"
// //             className={styles.paginationButton}
// //           >
// //             Next <ChevronRight size={16} />
// //           </button>
// //         </div>

// //         {loadingState.fetching ? (
// //           <div className={styles.loadingContainer}>
// //             <div className={styles.spinner}></div>
// //             <p>Loading jobs...</p>
// //           </div>
// //         ) : (
// //           <div className={styles.jobsContainer}>
// //             <h2 className={styles.sectionTitle}>
// //               <NotebookPen size={24} /> Available Job Posts
// //             </h2>
// //             {paginatedJobs.length === 0 ? (
// //               <div className={styles.noResults}>
// //                 <div className={styles.noResultsIcon}>🔍</div>
// //                 <h3>No jobs found</h3>
// //                 <p>Try adjusting your filters or search terms</p>
// //                 <button
// //                   onClick={clearAllFilters}
// //                   className={styles.clearFiltersButton}
// //                 >
// //                   Clear All Filters
// //                 </button>
// //               </div>
// //             ) : (
// //               <div className={styles.jobsGrid}>
// //                 {paginatedJobs.map((request) => (
// //                   <div
// //                     key={request?._id}
// //                     className={styles.jobCard}
// //                     onClick={() => handleClick(request)}
// //                   >
// //                     <div className={styles.jobCardHeader}>
// //                       <div className={styles.jobCardTitle}>
// //                         <h3>{request?.title}</h3>
// //                         {request?.employmentType && (
// //                           <span className={styles.jobTypeBadge}>
// //                             {request.employmentType}
// //                           </span>
// //                         )}
// //                       </div>
// //                       {request?.refereedBy && (
// //                         <div className={styles.referralBadge}>
// //                           <User size={14} /> Referred
// //                         </div>
// //                       )}
// //                     </div>

// //                     <div className={styles.jobCardCompany}>
// //                       <Building size={16} />
// //                       <span>{request?.companyName || "Company Not Specified"}</span>
// //                     </div>

// //                     <div className={styles.jobCardMeta}>
// //                       {request?.location && (
// //                         <div className={styles.metaItem}>
// //                           <MapPin size={14} />
// //                           <span>{request.location}</span>
// //                         </div>
// //                       )}
// //                       {request?.experience && (
// //                         <div className={styles.metaItem}>
// //                           <TrendingUp size={14} />
// //                           <span>{request.experience}</span>
// //                         </div>
// //                       )}
// //                       {request?.salary && (
// //                         <div className={styles.metaItem}>
// //                           <DollarSign size={14} />
// //                           <span>{request.salary}</span>
// //                         </div>
// //                       )}
// //                     </div>

// //                     {request?.keySkills && (
// //                       <div className={styles.jobCardSkills}>
// //                         {request.keySkills.split(',').map((skill, index) => (
// //                           <span key={index} className={styles.skillTag}>
// //                             {skill.trim()}
// //                           </span>
// //                         ))}
// //                       </div>
// //                     )}

// //                     {request?.description && (
// //                       <p className={styles.jobCardDescription}>
// //                         {request.description.length > 150
// //                           ? `${request.description.substring(0, 150)}...`
// //                           : request.description}
// //                       </p>
// //                     )}

// //                     <div className={styles.jobCardFooter}>
// //                       <div className={styles.jobCardTime}>
// //                         <Calendar size={12} />
// //                         <span>
// //                           {request?.createdAt && !isNaN(new Date(request?.createdAt))
// //                             ? `${new Date(request?.createdAt).toLocaleDateString()} • ${formatDistanceToNow(new Date(request?.createdAt), { addSuffix: true })}`
// //                             : 'Just Now'}
// //                         </span>
// //                       </div>
// //                       <div className={styles.jobCardActions}>
// //                         {/* Updated Apply Button with Google Login */}
// //                         {user?.role === "Member" || user?.role === "Candidate" || !user ? (
// //                           <ApplyButton
// //                             job={request}
// //                             user={user}
// //                             isApplied={isApplied(request)}
// //                             onApplyClick={handleApplyClick}
// //                             loadingState={loadingState}
// //                             onGoogleLogin={handleGoogleLogin}
// //                           />
// //                         ) : null}
// //                         {user?.role === "Admin" && renderAdminActionButtons(request)}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         )}
// //       </>}

// //       {/* VIEW 2: APPLICANTS (Admin) or MY JOBS (Member) */}
// //       {view === "myPost" && (
// //         <>
// //           <div className={styles.paginationTop}>
// //             <button
// //               onClick={() => page > 1 && setPage(page - 1)}
// //               disabled={page === 1 || loadingState.fetching}
// //               type="button"
// //               className={styles.paginationButton}
// //             >
// //               <ChevronLeft size={16} /> Previous
// //             </button>
// //             <span className={styles.pageInfo}>
// //               Page <span className={styles.currentPage}>{page}</span> of {totalPages}
// //             </span>
// //             <button
// //               onClick={() => page < totalPages && setPage(page + 1)}
// //               disabled={page === totalPages || loadingState.fetching}
// //               type="button"
// //               className={styles.paginationButton}
// //             >
// //               Next <ChevronRight size={16} />
// //             </button>
// //           </div>

// //           {loadingState.fetching ? (
// //             <div className={styles.loadingContainer}>
// //               <div className={styles.spinner}></div>
// //               <p>Loading your jobs...</p>
// //             </div>
// //           ) : (
// //             <div className={styles.jobsContainer}>
// //               <h2 className={styles.sectionTitle}>
// //                 {user?.role === 'Admin' ? (
// //                   <>
// //                     <BriefcaseBusiness size={24} /> Manage Applications
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Star size={24} /> My Applications
// //                   </>
// //                 )}
// //               </h2>
// //               {filteredMyPost.length === 0 ? (
// //                 <div className={styles.noResults}>
// //                   <div className={styles.noResultsIcon}>
// //                     {user?.role === 'Admin' ? '📭' : '📋'}
// //                   </div>
// //                   <h3>
// //                     {user?.role === 'Admin'
// //                       ? "No jobs posted yet"
// //                       : "You haven't applied to any jobs yet"}
// //                   </h3>
// //                   <p>
// //                     {user?.role === 'Admin'
// //                       ? "Create your first job post to get started"
// //                       : "Browse available jobs and apply to get started"}
// //                   </p>
// //                   {user?.role === 'Admin' && (
// //                     <button
// //                       onClick={() => { setEditingJob(null); setShowProvidedModal(true); }}
// //                       className={styles.createJobButton}
// //                     >
// //                       <Plus size={16} /> Create Job Post
// //                     </button>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div className={styles.jobsGrid}>
// //                   {paginatedJobs.map((request) => {
// //                     const myStatus = getMyApplicationStatus(request);
// //                     const pipelineStatus = getPipelineStatus(myStatus);

// //                     return (
// //                       <div
// //                         key={request._id}
// //                         className={styles.myJobCard}
// //                       >
// //                         <div className={styles.myJobCardHeader}>
// //                           <div
// //                             className={styles.myJobCardContent}
// //                             onClick={() => handleClick(request)}
// //                           >
// //                             <div className={styles.myJobCardTitle}>
// //                               <h3>{request.title}</h3>
// //                               <div className={styles.myJobCardMeta}>
// //                                 {request?.companyName && (
// //                                   <span className={styles.companyName}>
// //                                     <Building size={14} /> {request.companyName}
// //                                   </span>
// //                                 )}
// //                                 {request?.location && (
// //                                   <span className={styles.location}>
// //                                     <MapPin size={14} /> {request.location}
// //                                   </span>
// //                                 )}
// //                                 {request?.employmentType && (
// //                                   <span className={styles.jobType}>
// //                                     {request.employmentType}
// //                                   </span>
// //                                 )}
// //                               </div>
// //                             </div>
// //                             <div className={styles.myJobCardDate}>
// //                               <Calendar size={12} />
// //                               <span>Posted on: {new Date(request.createdAt).toLocaleDateString()}</span>
// //                             </div>
// //                           </div>
// //                           {user?.role === 'Admin' && renderAdminActionButtons(request)}
// //                         </div>

// //                         {/* MEMBER VIEW: Pipeline */}
// //                         {(user?.role === 'Member' || user?.role === 'Candidate') && myStatus && (
// //                           <div className={styles.applicationPipeline}>
// //                             {myStatus === 'Rejected' ? (
// //                               <div className={styles.rejectedStatus}>
// //                                 <XCircle size={20} />
// //                                 <div>
// //                                   <h4>Application Rejected</h4>
// //                                   <p>Unfortunately, your application was not selected for this position.</p>
// //                                 </div>
// //                               </div>
// //                             ) : (
// //                               <>
// //                                 <div className={styles.pipelineHeader}>
// //                                   <h4>Application Status</h4>
// //                                   <div className={styles.currentStatusBadge}>
// //                                     {renderStatusBadge(myStatus)}
// //                                   </div>
// //                                 </div>
// //                                 <EnhancedStatusPipeline status={pipelineStatus} />
// //                               </>
// //                             )}
// //                           </div>
// //                         )}

// //                         {/* ADMIN VIEW: Applicants Table */}
// //                         {user?.role === 'Admin' && (
// //                           <div className={styles.applicantsSection}>
// //                             <div className={styles.applicantsHeader}>
// //                               <h4>
// //                                 <Users size={16} /> Applicants ({request.appliedMembers?.length || 0})
// //                               </h4>
// //                               <span className={styles.applicantsCount}>
// //                                 {request.appliedMembers?.length || 0} total
// //                               </span>
// //                             </div>
// //                             {request.appliedMembers?.length > 0 ? (
// //                               <div className={styles.applicantsTable}>
// //                                 <table>
// //                                   <thead>
// //                                     <tr>
// //                                       <th>Name</th>
// //                                       <th>Resume</th>
// //                                       <th>Status</th>
// //                                       <th>Action</th>
// //                                     </tr>
// //                                   </thead>
// //                                   <tbody>
// //                                     {request.appliedMembers.map((app, idx) => (
// //                                       <tr key={idx}>
// //                                         <td className={styles.applicantName}>
// //                                           {app.memberId?.name || "Unknown Applicant"}
// //                                         </td>
// //                                         <td className={styles.applicantResume}>
// //                                           {(app.resumeLink || app.memberId?.resumeLink) ? (
// //                                             <a
// //                                               href={getFileUrl(app.resumeLink || app.memberId.resumeLink)}
// //                                               target="_blank"
// //                                               rel="noopener noreferrer"
// //                                               className={styles.resumeLink}
// //                                             >
// //                                               <FileText size={16} /> View Resume
// //                                             </a>
// //                                           ) : (
// //                                             <span className={styles.noResume}>No Resume</span>
// //                                           )}
// //                                         </td>
// //                                         <td className={styles.applicantStatus}>
// //                                           {renderStatusBadge(app.status || 'Applied')}
// //                                         </td>
// //                                         <td className={styles.applicantActions}>
// //                                           <select
// //                                             className={styles.statusSelect}
// //                                             value={app.status || 'Applied'}
// //                                             onChange={(e) => handleStatusChange(request._id, app.memberId?._id, e.target.value)}
// //                                           >
// //                                             <option value="Applied">Applied</option>
// //                                             <option value="Review">Review</option>
// //                                             <option value="Shortlisted">Shortlisted</option>
// //                                             <option value="Offer">Offer</option>
// //                                             <option value="Accepted">Accepted</option>
// //                                             <option value="Rejected">Rejected</option>
// //                                           </select>
// //                                         </td>
// //                                       </tr>
// //                                     ))}
// //                                   </tbody>
// //                                 </table>
// //                               </div>
// //                             ) : (
// //                               <div className={styles.noApplicants}>
// //                                 <Users size={24} />
// //                                 <p>No applicants yet. Share this job to get applications!</p>
// //                               </div>
// //                             )}
// //                           </div>
// //                         )}
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}

// //       {/* ADD BUTTON (Admin Only) */}
// //       {user?.role === "Admin" &&
// //         <button
// //           className={styles.floatingAddButton}
// //           onClick={() => { setEditingJob(null); setShowProvidedModal(true); }}
// //           disabled={loadingState.fetching}
// //           aria-label="Add new job"
// //           type="button"
// //         >
// //           <Plus size={24} />
// //         </button>
// //       }

// //       {/* MODALS */}
// //       <ProvidedForm
// //         isOpen={showProvidedModal}
// //         onClose={handleCloseModal}
// //         onSubmit={handleFormSubmit}
// //         initialData={editingJob}
// //       />

// //       <BulkCSVReviewModal
// //         isOpen={showBulkReviewModal}
// //         onClose={() => setShowBulkReviewModal(false)}
// //         jobsData={bulkReviewJobs}
// //         onSave={handleSaveBulkJobs}
// //         onBulkSubmit={handleSubmitBulkJobs}
// //         refereesList={refereesList}
// //       />

// //       <ResumeUploadModal
// //         isOpen={showResumeModal}
// //         onClose={() => setShowResumeModal(false)}
// //         onUpload={handleUploadAndApply}
// //         jobTitle={selectedJob?.title}
// //         user={user}
// //         onGoogleLogin={handleGoogleLogin}
// //       />

// //       {/* Google Login Modal */}
// //       {showGoogleLoginModal && (
// //         <div className={styles.googleLoginModal}>
// //           <div className={styles.googleLoginContent}>
// //             <div className={styles.googleLoginHeader}>
// //               <h3>Login Required</h3>
// //               <button
// //                 onClick={() => setShowGoogleLoginModal(false)}
// //                 className={styles.closeGoogleLogin}
// //                 aria-label="Close"
// //               >
// //                 <X size={24} />
// //               </button>
// //             </div>

// //             <p>Please login to apply for this position</p>

// //             <div className={styles.googleLoginOptions}>
// //               <GoogleLoginButton
// //                 onLoginSuccess={() => {
// //                   setShowGoogleLoginModal(false);
// //                   if (selectedJob) {
// //                     handleApplyClick({ stopPropagation: () => { } }, selectedJob);
// //                   }
// //                 }}
// //               />

// //               <button
// //                 className={styles.googleLoginCancel}
// //                 onClick={() => setShowGoogleLoginModal(false)}
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* LOADING OVERLAY */}
// //       {isSubmitting && (
// //         <div className={styles.submittingOverlay}>
// //           <div className={styles.submittingContent}>
// //             <div className={styles.submittingSpinner}></div>
// //             <span>Processing data, please wait...</span>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // Jobs.propTypes = {};

// // export default Jobs;

// //----------------------------------31/01------------------------UPDATED (Jobs.jsx FULL FILE)

// import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import axios from "axios";
// import { useNavigate, useOutletContext } from "react-router-dom";
// import styles from "./Jobs.module.scss";
// import {
//   BriefcaseBusiness,
//   NotebookPen,
//   Plus,
//   Search,
//   CheckCircle,
//   XCircle,
//   Trash2,
//   Pencil,
//   X,
//   FileText,
//   User,
//   Edit,
//   Check,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   EyeOff,
//   MapPin,
//   DollarSign,
//   GraduationCap,
//   Calendar,
//   Users,
//   Filter,
//   Award,
//   Target,
//   Building,
//   Sparkles,
//   TrendingUp,
//   BookOpen,
//   Zap,
//   Star,
//   ChevronDown,
// } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import classNames from "classnames";
// import { useAuth } from "../../context/AuthContext";
// import API from "../../axios";
// import { useData } from "../../context/DataContext";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import debounce from "lodash/debounce";
// import PropTypes from "prop-types";
// import Select from "react-select";

// // Google Login Component
// const GoogleLoginButton = ({ onLoginSuccess, onLoginError }) => {
//   const handleGoogleLogin = () => {
//     try {
//       const mockUser = {
//         id: "google-user-123",
//         name: "Google User",
//         email: "user@gmail.com",
//         picture: "https://via.placeholder.com/40",
//       };
//       onLoginSuccess?.(mockUser);
//     } catch (e) {
//       onLoginError?.(e);
//     }
//   };

//   return (
//     <button onClick={handleGoogleLogin} className={styles.googleLoginButton} type="button">
//       <svg width="18" height="18" viewBox="0 0 24 24">
//         <path
//           fill="white"
//           d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//         />
//         <path
//           fill="white"
//           d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//         />
//         <path
//           fill="white"
//           d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//         />
//         <path
//           fill="white"
//           d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//         />
//       </svg>
//       Sign in with Google
//     </button>
//   );
// };

// // Apply Button
// const ApplyButton = ({ job, user, isApplied, onApplyClick, loadingState, onGoogleLogin }) => {
//   const [showLoginPrompt, setShowLoginPrompt] = useState(false);

//   const handleClick = (e) => {
//     e.stopPropagation();

//     if (!user) {
//       setShowLoginPrompt(true);
//       return;
//     }

//     if (isApplied) return;

//     onApplyClick(e, job);
//   };

//   if (isApplied) {
//     return (
//       <button
//         className={styles.appliedButton}
//         disabled
//         onClick={(e) => e.stopPropagation()}
//         type="button"
//       >
//         <CheckCircle size={16} /> Applied
//       </button>
//     );
//   }

//   return (
//     <div className={styles.applyButtonWrapper} onClick={(e) => e.stopPropagation()}>
//       <button
//         className={styles.applyButton}
//         disabled={loadingState.applying}
//         onClick={handleClick}
//         type="button"
//       >
//         <Zap size={16} /> {loadingState.applying ? "Applying..." : "Apply"}
//       </button>

//       {showLoginPrompt && (
//         <div className={styles.loginPrompt}>
//           <div className={styles.loginPromptHeader}>
//             <h4>Login Required</h4>
//             <button
//               onClick={() => setShowLoginPrompt(false)}
//               className={styles.closeLoginPrompt}
//               aria-label="Close"
//               type="button"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           <p>Please login to apply for this position</p>

//           <div className={styles.loginOptions}>
//             <GoogleLoginButton
//               onLoginSuccess={() => {
//                 setShowLoginPrompt(false);
//                 onGoogleLogin?.(() => {
//                   onApplyClick({ stopPropagation: () => { } }, job);
//                 });
//               }}
//             />
//             <button className={styles.cancelLogin} onClick={() => setShowLoginPrompt(false)} type="button">
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance"];

// const JOB_TITLE_OPTIONS = [
//   "Frontend Developer",
//   "Backend Developer",
//   "Full Stack Developer",
//   "MERN Stack Developer",
//   "Java Developer",
//   "Python Developer",
//   "Data Scientist",
//   "UI/UX Designer",
//   "DevOps Engineer",
//   "QA / Tester",
//   "Product Manager",
//   "HR Recruiter",
//   "Business Analyst",
//   "System Administrator",
//   "Network Engineer",
//   "Mobile App Developer",
// ];

// // =========================================================================================
// // BulkCSVReviewModal (UPDATED UI — same logic)
// // =========================================================================================
// const BulkCSVReviewModal = ({ isOpen, onClose, jobsData, onSave, onBulkSubmit, refereesList }) => {
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editedJobs, setEditedJobs] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [expandedRows, setExpandedRows] = useState({});
//   const jobsPerPage = 5;

//   useEffect(() => {
//     if (isOpen && jobsData) {
//       setEditedJobs([...jobsData]);
//       setExpandedRows({});
//       setEditingIndex(null);
//       setCurrentPage(0);
//     }
//   }, [isOpen, jobsData]);

//   if (!isOpen || !jobsData) return null;

//   const totalPages = Math.ceil(editedJobs.length / jobsPerPage);
//   const startIndex = currentPage * jobsPerPage;
//   const endIndex = startIndex + jobsPerPage;
//   const currentJobs = editedJobs.slice(startIndex, endIndex);

//   const handleEdit = (index) => setEditingIndex(startIndex + index);
//   const handleSaveEdit = () => setEditingIndex(null);

//   const handleCancelEdit = () => {
//     setEditingIndex(null);
//     if (jobsData) setEditedJobs([...jobsData]);
//   };

//   const handleFieldChange = (pageIndex, field, value) => {
//     const actualIndex = startIndex + pageIndex;
//     const updatedJobs = [...editedJobs];
//     updatedJobs[actualIndex] = { ...updatedJobs[actualIndex], [field]: value };
//     setEditedJobs(updatedJobs);
//   };

//   const handleRemoveJob = (pageIndex) => {
//     const actualIndex = startIndex + pageIndex;
//     const updatedJobs = [...editedJobs];
//     updatedJobs.splice(actualIndex, 1);
//     setEditedJobs(updatedJobs);
//     if (currentJobs.length === 1 && currentPage > 0) setCurrentPage(currentPage - 1);
//   };

//   const toggleRowExpansion = (pageIndex) => {
//     const actualIndex = startIndex + pageIndex;
//     setExpandedRows((prev) => ({ ...prev, [actualIndex]: !prev[actualIndex] }));
//   };

//   return (
//     <div className={styles.bulkModalOverlay}>
//       <div className={styles.bulkModal}>
//         {/* Header */}
//         <div className={styles.bulkModalHeader}>
//           <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//             <h2 style={{ margin: 0 }}>Review & Edit CSV Jobs</h2>
//             <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>
//               Review the imported rows, edit if needed, then submit all.
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className={styles.closeBulkModal}
//             aria-label="Close modal"
//             type="button"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         {/* Stats */}
//         <div className={styles.bulkStats}>
//           <span>
//             Total Jobs: <strong>{editedJobs.length}</strong>
//           </span>
//           <span>
//             Page: <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
//           </span>
//           <span>
//             Editing: <strong>{editingIndex !== null ? "Yes" : "No"}</strong>
//           </span>
//         </div>

//         {/* Table */}
//         <div className={styles.bulkTableContainer}>
//           <table className={styles.bulkTable}>
//             <thead>
//               <tr>
//                 <th style={{ width: 52 }}>#</th>
//                 <th>Job Title</th>
//                 <th>Company</th>
//                 <th>Job Role</th>
//                 <th style={{ width: 140 }}>Type</th>
//                 <th>Location</th>
//                 <th style={{ width: 140 }}>Experience</th>
//                 <th style={{ width: 140 }}>Salary</th>
//                 <th style={{ width: 170 }}>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {currentJobs.map((job, index) => {
//                 const actualIndex = startIndex + index;
//                 const isEditing = editingIndex === actualIndex;
//                 const isExpanded = expandedRows[actualIndex];

//                 return (
//                   <React.Fragment key={actualIndex}>
//                     <tr style={{ background: isEditing ? "rgba(37,99,235,0.03)" : "transparent" }}>
//                       <td>{startIndex + index + 1}</td>

//                       <td>
//                         {isEditing ? (
//                           <input
//                             value={job.title || ""}
//                             onChange={(e) => handleFieldChange(index, "title", e.target.value)}
//                             className={styles.bulkInput}
//                             placeholder="Job title"
//                           />
//                         ) : (
//                           <strong style={{ fontWeight: 1100 }}>{job.title || "—"}</strong>
//                         )}
//                       </td>

//                       <td>
//                         {isEditing ? (
//                           <input
//                             value={job.companyName || ""}
//                             onChange={(e) => handleFieldChange(index, "companyName", e.target.value)}
//                             className={styles.bulkInput}
//                             placeholder="Company"
//                           />
//                         ) : (
//                           job.companyName || "—"
//                         )}
//                       </td>

//                       <td>
//                         {isEditing ? (
//                           <input
//                             value={job.role || ""}
//                             onChange={(e) => handleFieldChange(index, "role", e.target.value)}
//                             className={styles.bulkInput}
//                             placeholder="Role"
//                           />
//                         ) : (
//                           job.role || "—"
//                         )}
//                       </td>

//                       <td>
//                         {isEditing ? (
//                           <select
//                             value={job.employmentType || "Full-time"}
//                             onChange={(e) => handleFieldChange(index, "employmentType", e.target.value)}
//                             className={styles.bulkSelect}
//                           >
//                             {EMPLOYMENT_TYPES.map((type) => (
//                               <option key={type} value={type}>
//                                 {type}
//                               </option>
//                             ))}
//                           </select>
//                         ) : (
//                           job.employmentType || "—"
//                         )}
//                       </td>

//                       <td>
//                         {isEditing ? (
//                           <input
//                             value={job.location || ""}
//                             onChange={(e) => handleFieldChange(index, "location", e.target.value)}
//                             className={styles.bulkInput}
//                             placeholder="Location"
//                           />
//                         ) : (
//                           job.location || "—"
//                         )}
//                       </td>

//                       <td>
//                         {isEditing ? (
//                           <input
//                             value={job.experience || ""}
//                             onChange={(e) => handleFieldChange(index, "experience", e.target.value)}
//                             className={styles.bulkInput}
//                             placeholder="0-2 years"
//                           />
//                         ) : (
//                           job.experience || "—"
//                         )}
//                       </td>

//                       <td>
//                         {isEditing ? (
//                           <input
//                             value={job.salary || ""}
//                             onChange={(e) => handleFieldChange(index, "salary", e.target.value)}
//                             className={styles.bulkInput}
//                             placeholder="₹..."
//                           />
//                         ) : (
//                           job.salary || "—"
//                         )}
//                       </td>

//                       <td>
//                         <div className={styles.bulkActions}>
//                           <div className={styles.bulkActionButtons}>
//                             {isEditing ? (
//                               <>
//                                 <button
//                                   onClick={handleSaveEdit}
//                                   className={styles.bulkSaveBtn}
//                                   title="Save row"
//                                   type="button"
//                                 >
//                                   <Check size={16} />
//                                 </button>
//                                 <button
//                                   onClick={handleCancelEdit}
//                                   className={styles.bulkCancelBtn}
//                                   title="Cancel edit"
//                                   type="button"
//                                 >
//                                   <X size={16} />
//                                 </button>
//                               </>
//                             ) : (
//                               <>
//                                 <button
//                                   onClick={() => handleEdit(index)}
//                                   className={styles.bulkEditBtn}
//                                   title="Edit row"
//                                   type="button"
//                                 >
//                                   <Edit size={16} />
//                                 </button>
//                                 <button
//                                   onClick={() => handleRemoveJob(index)}
//                                   className={styles.bulkDeleteBtn}
//                                   title="Remove row"
//                                   type="button"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                               </>
//                             )}
//                           </div>

//                           <button
//                             onClick={() => toggleRowExpansion(index)}
//                             className={styles.bulkExpandBtn}
//                             type="button"
//                           >
//                             {isExpanded ? (
//                               <>
//                                 <EyeOff size={12} /> Hide details
//                               </>
//                             ) : (
//                               <>
//                                 <Eye size={12} /> Show details
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>

//                     {/* Expanded details panel */}
//                     {isExpanded && (
//                       <tr className={styles.bulkExpandedRow}>
//                         <td colSpan="9">
//                           <div className={styles.bulkExpandedContent}>
//                             <div className={styles.bulkFieldGroup}>
//                               <label>Education</label>
//                               {isEditing ? (
//                                 <input
//                                   value={job.education || ""}
//                                   onChange={(e) => handleFieldChange(index, "education", e.target.value)}
//                                   className={styles.bulkInput}
//                                   placeholder="Education"
//                                 />
//                               ) : (
//                                 <div>{job.education || "—"}</div>
//                               )}
//                             </div>

//                             <div className={styles.bulkFieldGroup}>
//                               <label>Passed Out Year</label>
//                               {isEditing ? (
//                                 <input
//                                   value={job.passedOutYear || ""}
//                                   onChange={(e) => handleFieldChange(index, "passedOutYear", e.target.value)}
//                                   className={styles.bulkInput}
//                                   placeholder="2024"
//                                 />
//                               ) : (
//                                 <div>{job.passedOutYear || "—"}</div>
//                               )}
//                             </div>

//                             <div className={styles.bulkFieldGroup}>
//                               <label>Key Skills</label>
//                               {isEditing ? (
//                                 <input
//                                   value={job.keySkills || ""}
//                                   onChange={(e) => handleFieldChange(index, "keySkills", e.target.value)}
//                                   className={styles.bulkInput}
//                                   placeholder="React, Node, MongoDB"
//                                 />
//                               ) : (
//                                 <div>{job.keySkills || "—"}</div>
//                               )}
//                             </div>

//                             <div className={styles.bulkFieldGroup}>
//                               <label>Refereed Person</label>
//                               {isEditing ? (
//                                 <select
//                                   value={job.refereedBy || ""}
//                                   onChange={(e) => handleFieldChange(index, "refereedBy", e.target.value)}
//                                   className={styles.bulkSelect}
//                                 >
//                                   <option value="">Select a Referee (Optional)</option>
//                                   {refereesList?.map((referee) => (
//                                     <option key={referee._id} value={referee._id}>
//                                       {referee.name || referee.email || "Unknown Name"}
//                                     </option>
//                                   ))}
//                                 </select>
//                               ) : (
//                                 <div>
//                                   {job.refereedBy
//                                     ? refereesList?.find((r) => r._id === job.refereedBy)?.name || "Referee Selected"
//                                     : "None"}
//                                 </div>
//                               )}
//                             </div>

//                             <div className={styles.bulkFieldGroup} style={{ gridColumn: "1 / -1" }}>
//                               <label>Description</label>
//                               {isEditing ? (
//                                 <textarea
//                                   value={job.description || ""}
//                                   onChange={(e) => handleFieldChange(index, "description", e.target.value)}
//                                   className={styles.bulkTextarea}
//                                   placeholder="Job description..."
//                                 />
//                               ) : (
//                                 <div className={styles.bulkDescription}>{job.description || "—"}</div>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className={styles.bulkPagination}>
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
//             disabled={currentPage === 0}
//             className={`${styles.bulkPageButton} ${currentPage === 0 ? styles.disabled : ""}`}
//             type="button"
//           >
//             <ChevronLeft size={16} /> Previous
//           </button>

//           <button
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
//             disabled={currentPage === totalPages - 1}
//             className={`${styles.bulkPageButton} ${currentPage === totalPages - 1 ? styles.disabled : ""}`}
//             type="button"
//           >
//             Next <ChevronRight size={16} />
//           </button>
//         </div>

//         {/* Footer buttons */}
//         <div className={styles.bulkFooterButtons}>
//           <button onClick={() => onSave(editedJobs)} className={styles.bulkSaveAllButton} type="button">
//             Save Changes
//           </button>
//           <button onClick={() => onBulkSubmit(editedJobs)} className={styles.bulkSubmitAllButton} type="button">
//             Submit All Jobs
//           </button>
//           <button onClick={onClose} className={styles.bulkCancelButton} type="button">
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// BulkCSVReviewModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   jobsData: PropTypes.array,
//   onSave: PropTypes.func.isRequired,
//   onBulkSubmit: PropTypes.func.isRequired,
//   refereesList: PropTypes.array,
// };

// // =========================================================================================
// // ProvidedForm (FULL UPDATED)
// // Fix: Alignment + Fit Screen + Upload CSV UI
// // =========================================================================================
// const ProvidedForm = ({ isOpen, onClose, onSubmit, initialData }) => {
//   const [title, setTitle] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
//   const [location, setLocation] = useState("");
//   const [description, setDescription] = useState("");
//   const [education, setEducation] = useState("");
//   const [passedOutYear, setPassedOutYear] = useState("");
//   const [experience, setExperience] = useState("");
//   const [salary, setSalary] = useState("");
//   const [role, setRole] = useState("");
//   const [keySkills, setKeySkills] = useState("");

//   const { memberContext } = useData();
//   const [refereedBy, setRefereedBy] = useState("");
//   const [refereesList, setRefereesList] = useState([]);

//   // ✅ UI: show selected file name
//   const [csvFileName, setCsvFileName] = useState("");

//   useEffect(() => {
//     if (memberContext) {
//       const filtered = memberContext.filter((m) => m.memberType === "Referee");
//       setRefereesList(filtered);
//     }
//   }, [memberContext]);

//   useEffect(() => {
//     if (!isOpen) return;

//     setCsvFileName("");

//     if (initialData) {
//       setTitle(initialData.title || "");
//       setCompanyName(initialData.companyName || "");
//       setEmploymentType(initialData.employmentType || EMPLOYMENT_TYPES[0]);
//       setLocation(initialData.location || "");
//       setDescription(initialData.description || "");
//       setEducation(initialData.education || "");
//       setPassedOutYear(initialData.passedOutYear || "");
//       setExperience(initialData.experience || "");
//       setSalary(initialData.salary || "");
//       setRole(initialData.role || "");
//       setKeySkills(initialData.keySkills || "");

//       const refId =
//         initialData.refereedBy && typeof initialData.refereedBy === "object"
//           ? initialData.refereedBy._id
//           : initialData.refereedBy || "";

//       setRefereedBy(refId);
//     } else {
//       setTitle("");
//       setCompanyName("");
//       setEmploymentType(EMPLOYMENT_TYPES[0]);
//       setLocation("");
//       setDescription("");
//       setEducation("");
//       setPassedOutYear("");
//       setExperience("");
//       setSalary("");
//       setRole("");
//       setKeySkills("");
//       setRefereedBy("");
//     }
//   }, [isOpen, initialData]);

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setCsvFileName(file.name);

//     const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
//     if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
//       alert("Please upload a valid CSV file");
//       e.target.value = "";
//       setCsvFileName("");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert("File size should be less than 5MB");
//       e.target.value = "";
//       setCsvFileName("");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const text = event.target.result;
//         const rows = String(text)
//           .split("\n")
//           .filter((row) => row.trim() !== "");

//         if (rows.length < 2) {
//           alert("CSV is empty or invalid format");
//           return;
//         }

//         const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
//         const bulkData = [];

//         for (let i = 1; i < rows.length; i++) {
//           const values = rows[i].split(",").map((v) => v.trim());
//           const entry = {};
//           headers.forEach((header, index) => {
//             entry[header] = values[index] || "";
//           });

//           bulkData.push({
//             title: entry.title || "",
//             companyName: entry.companyname || entry.companyName || "",
//             role: entry.role || "",
//             employmentType: entry.employmenttype || entry.employmentType || "Full-time",
//             location: entry.location || "",
//             experience: entry.experience || "",
//             salary: entry.salary || "",
//             education: entry.education || "",
//             passedOutYear: entry.passedoutyear || entry.passedOutYear || "",
//             keySkills: entry.keyskills || entry.keySkills || "",
//             description: entry.description || "",
//             refereedBy: "",
//           });
//         }

//         if (bulkData.length === 1) {
//           const job = bulkData[0];
//           setTitle(job.title);
//           setCompanyName(job.companyName);
//           setRole(job.role);
//           setEmploymentType(job.employmentType);
//           setLocation(job.location);
//           setExperience(job.experience);
//           setSalary(job.salary);
//           setEducation(job.education);
//           setPassedOutYear(job.passedOutYear);
//           setKeySkills(job.keySkills);
//           setDescription(job.description);
//           setRefereedBy("");
//           alert("Data loaded into form. Review and click Post.");
//         } else {
//           onSubmit(bulkData, true);
//         }
//       } catch (error) {
//         console.error("CSV parsing error:", error);
//         alert("Error parsing CSV file. Please check the format.");
//       }
//     };

//     reader.onerror = () => alert("Error reading file. Please try again.");
//     reader.readAsText(file);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     onSubmit(
//       {
//         title,
//         companyName,
//         employmentType,
//         location,
//         description,
//         education,
//         passedOutYear,
//         experience,
//         salary,
//         role,
//         keySkills,
//         refereedBy: refereedBy || null,
//       },
//       false
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <div className={styles.modalOverlay} onMouseDown={onClose}>
//       <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
//         <div className={styles.modalHeader}>
//           <h2>{initialData ? "Edit Job Post" : "Create Job Post"}</h2>
//           <button onClick={onClose} className={styles.closeModalBtn} aria-label="Close modal" type="button">
//             <X size={22} />
//           </button>
//         </div>

//         {/* ✅ Scrollable body */}
//         <div className={styles.modalBody}>
//           {!initialData && (
//             <div className={styles.csvUploadSection}>
//               <input
//                 type="file"
//                 accept=".csv"
//                 id="csv-upload"
//                 className={styles.csvInput}
//                 onChange={handleFileChange}
//               />

//               <label htmlFor="csv-upload" className={styles.csvUploadCard}>
//                 <span className={styles.csvIcon}><FileText size={20} /></span>
//                 <span className={styles.csvText}>
//                   <h4>Upload CSV Format</h4>
//                   <p>Drop your CSV here or click to browse (max 5MB)</p>
//                 </span>
//                 <span className={styles.csvAction}>Choose File</span>
//               </label>
//             </div>
//           )}

//           {/* ✅ Grid form (NO formRow wrappers needed) */}
//           <form onSubmit={handleSubmit} className={styles.createJobForm}>
//             {/* Job Title */}
//             <div className={`${styles.formGroup} ${styles.fullRow}`}>
//               <label>
//                 <BookOpen size={14} /> Job Title <span className={styles.required}>*</span>
//               </label>
//               <input
//                 list="jobTitleOptions"
//                 className={styles.formInput}
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Select or Type Job Title"
//                 required
//               />
//               <datalist id="jobTitleOptions">
//                 {JOB_TITLE_OPTIONS.map((opt, i) => (
//                   <option key={i} value={opt} />
//                 ))}
//               </datalist>
//             </div>

//             {/* Company Name */}
//             <div className={styles.formGroup}>
//               <label>
//                 <Building size={14} /> Company Name
//               </label>
//               <input
//                 className={styles.formInput}
//                 type="text"
//                 value={companyName}
//                 onChange={(e) => setCompanyName(e.target.value)}
//               />
//             </div>

//             {/* Job Role */}
//             <div className={styles.formGroup}>
//               <label>
//                 <Target size={14} /> Job Role
//               </label>
//               <input className={styles.formInput} type="text" value={role} onChange={(e) => setRole(e.target.value)} />
//             </div>

//             {/* Employment Type */}
//             <div className={styles.formGroup}>
//               <label>
//                 <Calendar size={14} /> Employment Type
//               </label>
//               <select className={styles.formSelect} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
//                 {EMPLOYMENT_TYPES.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Location */}
//             <div className={styles.formGroup}>
//               <label>
//                 <MapPin size={14} /> Location
//               </label>
//               <input className={styles.formInput} type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
//             </div>

//             {/* Experience */}
//             <div className={styles.formGroup}>
//               <label>
//                 <TrendingUp size={14} /> Experience
//               </label>
//               <input
//                 className={styles.formInput}
//                 type="text"
//                 value={experience}
//                 onChange={(e) => setExperience(e.target.value)}
//               />
//             </div>

//             {/* Salary */}
//             <div className={styles.formGroup}>
//               <label>
//                 <DollarSign size={14} /> Salary
//               </label>
//               <input className={styles.formInput} type="text" value={salary} onChange={(e) => setSalary(e.target.value)} />
//             </div>

//             {/* Education */}
//             <div className={styles.formGroup}>
//               <label>
//                 <GraduationCap size={14} /> Education
//               </label>
//               <input className={styles.formInput} type="text" value={education} onChange={(e) => setEducation(e.target.value)} />
//             </div>

//             {/* Passout Year */}
//             <div className={styles.formGroup}>
//               <label>
//                 <Award size={14} /> Passout Year
//               </label>
//               <input
//                 className={styles.formInput}
//                 type="text"
//                 value={passedOutYear}
//                 onChange={(e) => setPassedOutYear(e.target.value)}
//               />
//             </div>

//             {/* Refereed */}
//             <div className={`${styles.formGroup} ${styles.fullRow}`}>
//               <label>
//                 <Users size={14} /> Refereed Person (Optional)
//               </label>
//               <select className={styles.formSelect} value={refereedBy} onChange={(e) => setRefereedBy(e.target.value)}>
//                 <option value="">Select a Referee (Optional)</option>
//                 {refereesList.length > 0 ? (
//                   refereesList.map((referee) => (
//                     <option key={referee._id} value={referee._id}>
//                       {referee.name || referee.email || "Unknown Name"}
//                     </option>
//                   ))
//                 ) : (
//                   <option disabled>No referees found</option>
//                 )}
//               </select>
//             </div>

//             {/* Key Skills */}
//             <div className={`${styles.formGroup} ${styles.fullRow}`}>
//               <label>
//                 <Sparkles size={14} /> Key Skills
//               </label>
//               <input
//                 className={styles.formInput}
//                 type="text"
//                 value={keySkills}
//                 onChange={(e) => setKeySkills(e.target.value)}
//               />
//             </div>

//             {/* Description */}
//             <div className={`${styles.formGroup} ${styles.fullRow}`}>
//               <label>
//                 <FileText size={14} /> Description <span className={styles.required}>*</span>
//               </label>
//               <textarea
//                 className={styles.formTextarea}
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 required
//               />
//             </div>

//             {/* ✅ Sticky footer button look handled by CSS below */}
//             <div className={`${styles.modalFooter} ${styles.fullRow}`}>
//               <button type="submit" className={styles.submitButton}>
//                 {initialData ? "Update Job" : "Post Job"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// ProvidedForm.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
//   initialData: PropTypes.object,
// };

// // =========================================================================================
// // ResumeUploadModal
// // =========================================================================================
// const ResumeUploadModal = ({ isOpen, onClose, onUpload, jobTitle, user, onGoogleLogin }) => {
//   const [resumeFile, setResumeFile] = useState(null);
//   const [fileName, setFileName] = useState("");
//   const [fileSize, setFileSize] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [showGoogleLogin, setShowGoogleLogin] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setResumeFile(null);
//       setFileName("");
//       setIsUploading(false);
//       setShowGoogleLogin(!user);
//     }
//   }, [isOpen, user]);

//   if (!isOpen) return null;

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const allowedTypes = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (!allowedTypes.includes(file.type)) {
//       alert("Please upload a PDF or Word document only");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert("File size should be less than 5MB");
//       return;
//     }

//     setResumeFile(file);
//     setFileName(file.name);
//     setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
//   };

//   const removeFile = (e) => {
//     e.preventDefault();
//     setResumeFile(null);
//     setFileName("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       setShowGoogleLogin(true);
//       return;
//     }

//     if (!resumeFile) {
//       alert("Please select a resume file");
//       return;
//     }

//     setIsUploading(true);
//     try {
//       await onUpload(resumeFile);
//       setResumeFile(null);
//       setFileName("");
//       onClose();
//     } catch (error) {
//       alert("Failed to upload resume");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleClose = () => {
//     setResumeFile(null);
//     setFileName("");
//     setIsUploading(false);
//     setShowGoogleLogin(false);
//     onClose();
//   };

//   return (
//     <div className={styles.resumeModalOverlay} onMouseDown={handleClose}>
//       <div className={styles.resumeModal} onMouseDown={(e) => e.stopPropagation()}>
//         <div className={styles.resumeModalHeader}>
//           <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//             <h3 style={{ margin: 0 }}>Upload Resume</h3>
//             <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>
//               Applying for: <strong style={{ color: "#2563eb" }}>{jobTitle}</strong>
//             </div>
//           </div>
//           <button onClick={handleClose} className={styles.closeResumeModal} aria-label="Close modal" type="button">
//             <X size={22} />
//           </button>
//         </div>

//         <div className={styles.resumeModalBody}>
//           {showGoogleLogin ? (
//             <div className={styles.resumeLoginSection}>
//               <p>Please login to apply for this position</p>
//               <div className={styles.resumeLoginOptions}>
//                 <GoogleLoginButton
//                   onLoginSuccess={() => {
//                     onGoogleLogin?.(() => setShowGoogleLogin(false));
//                     setShowGoogleLogin(false);
//                   }}
//                 />
//                 <button className={styles.resumeCancelButton} onClick={handleClose} type="button">
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className={styles.resumeForm}>
//               {/* HIDDEN INPUT triggers selection */}
//               <input
//                 type="file"
//                 id="resume-upload-input"
//                 accept=".pdf,.doc,.docx"
//                 onChange={handleFileChange}
//                 className={styles.resumeFileInput}
//               />

//               {!resumeFile ? (
//                 <label htmlFor="resume-upload-input" className={styles.resumeUploadArea}>
//                   <div className={styles.uploadIcon}>
//                     <FileText size={32} />
//                     <span>Click to upload resume</span>
//                   </div>
//                   <div className={styles.uploadHint}>PDF, DOC, or DOCX (Max 5MB)</div>
//                 </label>
//               ) : (
//                 <div className={styles.selectedFile}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
//                     <FileText size={24} style={{ color: "#2563eb" }} />
//                     <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
//                       <span style={{ fontSize: 14, fontWeight: 1000, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                         {fileName}
//                       </span>
//                       <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>{fileSize}</span>
//                     </div>
//                   </div>
//                   <button onClick={removeFile} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 8 }} title="Remove file">
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={!resumeFile || isUploading}
//                 className={`${styles.resumeSubmitButton} ${!resumeFile || isUploading ? styles.disabled : ""}`}
//               >
//                 {isUploading ? "Uploading..." : "Upload & Apply Now"}
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// ResumeUploadModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onUpload: PropTypes.func.isRequired,
//   jobTitle: PropTypes.string,
//   user: PropTypes.object,
//   onGoogleLogin: PropTypes.func,
// };

// // =========================================================================================
// // Enhanced Status Pipeline
// // =========================================================================================
// const EnhancedStatusPipeline = ({ status }) => {
//   const steps = [
//     { key: "Submitted", label: "Applied", icon: "📝" },
//     { key: "Review", label: "Under Review", icon: "🔍" },
//     { key: "Interview", label: "Interview", icon: "💼" },
//     { key: "Offer", label: "Offer", icon: "📄" },
//     { key: "Hired", label: "Hired", icon: "🎉" },
//   ];

//   const currentIndex = steps.findIndex((step) => step.key === status);

//   return (
//     <div className={styles.statusPipeline}>
//       {steps.map((step, index) => (
//         <div
//           key={step.key}
//           className={`${styles.statusStep} ${index < currentIndex ? styles.completed : index === currentIndex ? styles.active : ""}`}
//         >
//           <div className={styles.stepIcon}>
//             <span>{step.icon}</span>
//           </div>
//           <div className={styles.stepLabel}>{step.label}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// // =========================================================================================
// // MAIN COMPONENT: Jobs
// // =========================================================================================
// function Jobs() {
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [showFilters, setShowFilters] = useState(true);
//   const [jobPosts, setJobPosts] = useState([]);
//   const [myPost, setMyPost] = useState([]);
//   const [view, setView] = useState("request");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [showProvidedModal, setShowProvidedModal] = useState(false);
//   const [showBulkReviewModal, setShowBulkReviewModal] = useState(false);
//   const [bulkReviewJobs, setBulkReviewJobs] = useState([]);

//   const [showResumeModal, setShowResumeModal] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [editingJob, setEditingJob] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [loadingState, setLoadingState] = useState({
//     fetching: false,
//     applying: false,
//     uploading: false,
//     deleting: false,
//     filtering: false,
//   });
//   const [error, setError] = useState(null);

//   const { user } = useAuth();
//   const { jobContext, memberContext } = useData();
//   const navigate = useNavigate();

//   const { sidebarCollapsed } = useOutletContext();
//   const sidebarWidth = sidebarCollapsed ? 90 : 280;

//   const headerRef = useRef(null);
//   const [headerHeight, setHeaderHeight] = useState(90);

//   const [filters, setFilters] = useState({
//     title: "",
//     companyName: "",
//     role: "",
//     employmentType: "",
//     location: "",
//     experience: "",
//     salary: "",
//     education: "",
//     passedOutYear: "",
//     keySkills: "",
//     refereedBy: "",
//     description: "",
//     startDate: null,
//     endDate: null,
//     initialNumber: "",
//     finalNumber: "",
//   });

//   const [pendingFilters, setPendingFilters] = useState({});
//   const [hasPendingChanges, setHasPendingChanges] = useState(false);

//   const [refereesList, setRefereesList] = useState([]);

//   // Google login modal
//   const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);

//   const BACKEND_URL = "http://localhost:5000";
//   const JOBS_PER_PAGE = 10;

//   // --- refs list
//   useEffect(() => {
//     if (memberContext) {
//       const filtered = memberContext.filter((m) => m.memberType === "Referee");
//       setRefereesList(filtered);
//     }
//   }, [memberContext]);

//   // --- header height
//   useEffect(() => {
//     const updateHeaderHeight = () => {
//       if (headerRef.current) {
//         setHeaderHeight(headerRef.current.offsetHeight + 16);
//       }
//     };
//     updateHeaderHeight();
//     const t = setTimeout(updateHeaderHeight, 100);
//     return () => clearTimeout(t);
//   }, [sidebarWidth, view, globalFilter, pendingFilters, filters]);

//   // --- google login handler
//   const handleGoogleLogin = async (callback) => {
//     try {
//       // replace with real OAuth later
//       if (callback) callback();
//     } catch (error) {
//       console.error("Google login failed:", error);
//       alert("Google login failed. Please try again.");
//     }
//   };

//   // --- applied check
//   const checkIsApplied = (job, userId) => {
//     if (!job?.appliedMembers || !userId || job.appliedMembers.length === 0) return false;
//     const userIdStr = String(userId).trim();

//     return job.appliedMembers.some((app) => {
//       const possibleIds = [
//         app.memberId?._id,
//         app.memberId,
//         app.member?._id,
//         app.member,
//         app.userId?._id,
//         app.userId,
//         app.applicantId?._id,
//         app.applicantId,
//         app._id,
//       ].filter((id) => id != null);

//       return possibleIds.some((id) => String(id).trim() === userIdStr);
//     });
//   };

//   const isApplied = (job) => checkIsApplied(job, user?.memberId);

//   const getMyApplicationStatus = (job) => {
//     if (!job?.appliedMembers || !user?.memberId) return null;
//     const userIdStr = String(user.memberId).trim();

//     const application = job.appliedMembers.find((app) => {
//       const possibleIds = [
//         app.memberId?._id,
//         app.memberId,
//         app.member?._id,
//         app.member,
//         app.userId?._id,
//         app.userId,
//         app.applicantId?._id,
//         app.applicantId,
//         app._id,
//       ].filter((id) => id != null);

//       return possibleIds.some((id) => String(id).trim() === userIdStr);
//     });

//     return application ? application.status || "Applied" : null;
//   };

//   const getPipelineStatus = (dbStatus) => {
//     switch (dbStatus) {
//       case "Applied":
//         return "Submitted";
//       case "Review":
//         return "Review";
//       case "Shortlisted":
//         return "Interview";
//       case "Offer":
//         return "Offer";
//       case "Accepted":
//         return "Hired";
//       case "Rejected":
//         return "Rejected";
//       default:
//         return "Submitted";
//     }
//   };

//   const getFileUrl = (url) => {
//     if (!url) return "#";
//     if (url.startsWith("uploads") || url.includes("\\")) {
//       return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
//     }
//     return url;
//   };

//   const hasDefaultResume = () => !!user?.resumeLink;

//   // --- Filters apply
//   const applyFilters = useCallback(
//     (jobs) => {
//       const search = globalFilter.trim().toLowerCase();

//       const {
//         title,
//         companyName,
//         role,
//         employmentType,
//         location,
//         experience,
//         salary,
//         education,
//         passedOutYear,
//         keySkills,
//         refereedBy,
//         description,
//         startDate,
//         endDate,
//         initialNumber,
//         finalNumber,
//       } = filters;

//       const titleFilter = title?.trim().toLowerCase() || "";
//       const companyFilter = companyName?.trim().toLowerCase() || "";
//       const roleFilter = role?.trim().toLowerCase() || "";
//       const locationFilter = location?.trim().toLowerCase() || "";
//       const experienceFilter = experience?.trim().toLowerCase() || "";
//       const salaryFilter = salary?.trim().toLowerCase() || "";
//       const educationFilter = education?.trim().toLowerCase() || "";
//       const passoutFilter = passedOutYear?.trim().toLowerCase() || "";
//       const keySkillsFilter = keySkills?.trim().toLowerCase() || "";
//       const descriptionFilter = description?.trim().toLowerCase() || "";
//       const refereedByFilter = refereedBy?.trim().toLowerCase() || "";

//       const toDate = (val) => {
//         if (!val) return null;
//         if (val instanceof Date) return val;
//         return new Date(val);
//       };

//       const start = toDate(startDate);
//       const end = toDate(endDate);

//       return jobs.filter((job) => {
//         if (search) {
//           const haystack = [job.title, job.companyName, job.location, job.role, job.description, job.keySkills]
//             .filter(Boolean)
//             .join(" ")
//             .toLowerCase();
//           if (!haystack.includes(search)) return false;
//         }

//         if (titleFilter && !(job.title || "").toLowerCase().includes(titleFilter)) return false;
//         if (companyFilter && !(job.companyName || "").toLowerCase().includes(companyFilter)) return false;
//         if (roleFilter && !(job.role || "").toLowerCase().includes(roleFilter)) return false;
//         if (locationFilter && !(job.location || "").toLowerCase().includes(locationFilter)) return false;
//         if (experienceFilter && !(job.experience || "").toLowerCase().includes(experienceFilter)) return false;
//         if (salaryFilter && !(job.salary || "").toLowerCase().includes(salaryFilter)) return false;
//         if (educationFilter && !(job.education || "").toLowerCase().includes(educationFilter)) return false;
//         if (passoutFilter && !(String(job.passedOutYear || "")).toLowerCase().includes(passoutFilter)) return false;

//         if (keySkillsFilter) {
//           const jobSkills = (job.keySkills || "").toLowerCase();
//           if (!jobSkills.includes(keySkillsFilter)) return false;
//         }

//         if (descriptionFilter && !(job.description || "").toLowerCase().includes(descriptionFilter)) return false;

//         if (employmentType && job.employmentType !== employmentType) return false;

//         if (refereedByFilter) {
//           const refName = (job.refereedBy?.name || job.refereedBy?.email || "").toLowerCase();
//           if (!refName.includes(refereedByFilter)) return false;
//         }

//         if (start || end) {
//           if (!job.createdAt) return false;
//           const created = new Date(job.createdAt);
//           if (start && created < start) return false;
//           if (end && created > end) return false;
//         }

//         const applicantsCount = job.appliedMembers?.length || 0;
//         if (initialNumber !== "" && initialNumber != null) {
//           if (applicantsCount < Number(initialNumber)) return false;
//         }
//         if (finalNumber !== "" && finalNumber != null) {
//           if (applicantsCount > Number(finalNumber)) return false;
//         }

//         return true;
//       });
//     },
//     [filters, globalFilter]
//   );

//   const filteredJobPosts = useMemo(() => applyFilters(jobPosts), [jobPosts, applyFilters]);

//   const filteredMyPost = useMemo(() => {
//     if (view !== "myPost") return [];
//     if (user?.role === "Admin") return applyFilters(jobPosts);

//     if (!user) return [];
//     const memberJobs = jobPosts.filter((job) => checkIsApplied(job, user?.memberId));
//     return applyFilters(memberJobs);
//   }, [view, jobPosts, user, applyFilters]);

//   const paginatedJobs = useMemo(() => {
//     const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
//     return source.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);
//   }, [view, filteredMyPost, filteredJobPosts, page]);

//   useEffect(() => {
//     const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
//     const newTotalPages = Math.ceil(source.length / JOBS_PER_PAGE);
//     setTotalPages(newTotalPages || 1);
//     if (page > newTotalPages && newTotalPages > 0) setPage(1);
//   }, [view, filteredMyPost, filteredJobPosts, page]);

//   // --- search debounce
//   const debouncedSearch = useCallback(
//     debounce((value) => {
//       setGlobalFilter(value);
//       setPage(1);
//     }, 300),
//     []
//   );

//   const handleSearchChange = (e) => debouncedSearch(e.target.value);

//   const handleFilterChange = (name, value) => {
//     setPendingFilters((prev) => ({ ...prev, [name]: value }));
//     setHasPendingChanges(true);
//   };

//   const applyPendingFilters = () => {
//     const newFilters = { ...filters, ...pendingFilters };
//     setFilters(newFilters);
//     setPendingFilters({});
//     setHasPendingChanges(false);
//     setPage(1);
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       title: "",
//       companyName: "",
//       role: "",
//       employmentType: "",
//       location: "",
//       experience: "",
//       salary: "",
//       education: "",
//       passedOutYear: "",
//       keySkills: "",
//       refereedBy: "",
//       description: "",
//       startDate: null,
//       endDate: null,
//       initialNumber: "",
//       finalNumber: "",
//     });
//     setPendingFilters({});
//     setHasPendingChanges(false);
//     setPage(1);
//   };

//   const getDisplayValue = (fieldName) => {
//     if (pendingFilters[fieldName] !== undefined) return pendingFilters[fieldName];
//     return filters[fieldName] || "";
//   };

//   // --- Options lists (for Select)
//   const locationOptions = useMemo(() => Array.from(new Set(jobPosts.map((j) => j.location).filter(Boolean))), [jobPosts]);
//   const titleOptions = useMemo(() => Array.from(new Set(jobPosts.map((j) => j.title).filter(Boolean))), [jobPosts]);
//   const roleOptions = useMemo(() => Array.from(new Set(jobPosts.map((j) => j.role).filter(Boolean))), [jobPosts]);
//   const companyOptions = useMemo(() => Array.from(new Set(jobPosts.map((j) => j.companyName).filter(Boolean))), [jobPosts]);
//   const experienceOptions = useMemo(() => Array.from(new Set(jobPosts.map((j) => j.experience).filter(Boolean))), [jobPosts]);

//   // --- fetch jobs
//   const fetchJobPosts = async () => {
//     try {
//       setLoadingState((prev) => ({ ...prev, fetching: true }));
//       setError(null);

//       const res = await API.get("/service");
//       const allJobs = res.data.data;
//       setJobPosts(allJobs);

//       if (user) {
//         if (user?.role === "Admin") setMyPost(allJobs);
//         else setMyPost(allJobs.filter((job) => checkIsApplied(job, user?.memberId)));
//       }
//     } catch (error) {
//       console.error("Error fetching jobs:", error);
//       setError("Unable to load jobs. Please try again later.");
//       if (jobContext?.length) setJobPosts(jobContext);
//     } finally {
//       setLoadingState((prev) => ({ ...prev, fetching: false }));
//     }
//   };

//   useEffect(() => {
//     fetchJobPosts();
//   }, [user, jobContext]);

//   // --- navigation
//   const handleClick = (job) => navigate(`/jobs/${job._id}`);

//   // --- export
//   const buildJobsExportRows = () => {
//     const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
//     return source.map((j) => ({
//       JobTitle: j.title || "",
//       CompanyName: j.companyName || "",
//       EmploymentType: j.employmentType || "",
//       Location: j.location || "",
//       Role: j.role || "",
//       Education: j.education || "",
//       Experience: j.experience || "",
//       Salary: j.salary || "",
//       PassoutYear: j.passedOutYear || "",
//       KeySkills: j.keySkills || "",
//       RefereedBy: j.refereedBy?.name || "",
//       Description: j.description || "",
//       PostedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "",
//       Applicants: j.appliedMembers?.length || 0,
//     }));
//   };

//   const exportJobsToExcel = () => {
//     const data = buildJobsExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Jobs");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer]), `Jobs_${new Date().toISOString().slice(0, 10)}.xlsx`);
//   };

//   const exportJobsToCSV = () => {
//     const data = buildJobsExportRows();
//     const ws = XLSX.utils.json_to_sheet(data);
//     const csv = XLSX.utils.sheet_to_csv(ws);
//     saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Jobs_${new Date().toISOString().slice(0, 10)}.csv`);
//   };

//   // --- admin actions
//   const handleDelete = async (jobId, e) => {
//     e.stopPropagation();
//     if (!window.confirm("Are you sure you want to delete this job post?")) return;

//     try {
//       setLoadingState((prev) => ({ ...prev, deleting: true }));
//       await API.delete(`/service/${jobId}`);
//       setJobPosts((prev) => prev.filter((job) => job._id !== jobId));
//       setMyPost((prev) => prev.filter((job) => job._id !== jobId));
//       alert("Job deleted successfully");
//     } catch (error) {
//       console.error("Delete failed:", error);
//       alert("Failed to delete job.");
//     } finally {
//       setLoadingState((prev) => ({ ...prev, deleting: false }));
//     }
//   };

//   const handleEditClick = (e, job) => {
//     e.stopPropagation();
//     setEditingJob(job);
//     setShowProvidedModal(true);
//   };

//   const renderAdminActionButtons = (request) => (
//     <div className={styles.adminActions} onClick={(e) => e.stopPropagation()}>
//       <button onClick={(e) => handleEditClick(e, request)} title="Edit Post" className={styles.btnEdit} type="button">
//         <Pencil size={18} />
//       </button>
//       <button onClick={(e) => handleDelete(request._id, e)} title="Delete Post" className={styles.btnDelete} type="button">
//         <Trash2 size={18} />
//       </button>
//     </div>
//   );

//   // --- apply + resume + cloudinary
//   const uploadToCloudinary = async (file) => {
//     if (!file) return null;
//     const cloudName = "dwelwaavj";
//     const uploadPreset = "jobbridge_preset";
//     const api = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

//     const data = new FormData();
//     data.append("file", file);
//     data.append("upload_preset", uploadPreset);

//     try {
//       setLoadingState((prev) => ({ ...prev, uploading: true }));
//       const res = await axios.post(api, data);
//       return res.data.secure_url;
//     } catch (error) {
//       console.error("Cloudinary Upload Error:", error);
//       throw new Error("Failed to upload file to cloud.");
//     } finally {
//       setLoadingState((prev) => ({ ...prev, uploading: false }));
//     }
//   };

//   const handleApply = async (job, resumeFile = null) => {
//     try {
//       setLoadingState((prev) => ({ ...prev, applying: true }));

//       if (!user) {
//         setSelectedJob(job);
//         setShowGoogleLoginModal(true);
//         return;
//       }

//       if (!resumeFile && (user?.role === "Member" || user?.role === "Candidate")) {
//         setSelectedJob(job);
//         setShowResumeModal(true);
//         return;
//       }

//       let finalResumeLink = null;
//       if (resumeFile) finalResumeLink = await uploadToCloudinary(resumeFile);

//       await API.post(`/service/${job._id}/apply`, { resumeLink: finalResumeLink });

//       alert("Applied successfully");
//       fetchJobPosts();
//       setShowResumeModal(false);
//     } catch (error) {
//       alert(error.response?.data?.message || "Failed to apply");
//     } finally {
//       setLoadingState((prev) => ({ ...prev, applying: false }));
//     }
//   };

//   const handleUploadAndApply = async (resumeFile) => {
//     if (selectedJob) await handleApply(selectedJob, resumeFile);
//   };

//   const handleApplyClick = (e, job) => {
//     e.stopPropagation();
//     if (isApplied(job)) return;

//     if (hasDefaultResume()) {
//       const useDefault = window.confirm(
//         "You have a default resume on file. Would you like to use it?\n\n" +
//         "Click OK to use default resume\n" +
//         "Click Cancel to upload a different resume"
//       );

//       if (useDefault) handleApply(job);
//       else {
//         setSelectedJob(job);
//         setShowResumeModal(true);
//       }
//     } else {
//       setSelectedJob(job);
//       setShowResumeModal(true);
//     }
//   };

//   // --- add/update job post
//   const handleCloseModal = () => {
//     setShowProvidedModal(false);
//     setEditingJob(null);
//   };

//   const handleUpdateProvided = async (jobData) => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     const dataToSend = { ...jobData, refereedBy: jobData.refereedBy || null };

//     try {
//       const response = await API.patch(`/service/${editingJob._id}`, dataToSend);
//       const updatedJob = response.data.data || response.data;

//       setJobPosts((prev) => prev.map((job) => (job._id === updatedJob._id ? updatedJob : job)));
//       setMyPost((prev) => prev.map((job) => (job._id === updatedJob._id ? updatedJob : job)));

//       alert("Job updated successfully!");
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error updating Job:", error);
//       alert("Failed to update job.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleAddProvided = async (jobData) => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     const dataToSend = { ...jobData, refereedBy: jobData.refereedBy || null };

//     try {
//       const response = await API.post("/service", dataToSend);
//       const newJob = response.data.data || response.data;

//       setJobPosts((prev) => [newJob, ...prev]);
//       if (user?.role === "Admin") setMyPost((prev) => [newJob, ...prev]);

//       handleCloseModal();
//       alert("Job posted successfully!");
//     } catch (error) {
//       console.error("Error adding Job:", error);
//       alert("Failed to save job.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBulkCSVUpload = (data) => {
//     setBulkReviewJobs(data);
//     setShowBulkReviewModal(true);
//   };

//   const handleSaveBulkJobs = (editedJobs) => {
//     setBulkReviewJobs(editedJobs);
//     alert(`Saved ${editedJobs.length} jobs. Ready to submit.`);
//   };

//   const handleSubmitBulkJobs = async (editedJobs) => {
//     if (!editedJobs.length) return;

//     setIsSubmitting(true);
//     try {
//       const jobsToSubmit = editedJobs.map((job) => ({ ...job, refereedBy: job.refereedBy || null }));
//       const uploadPromises = jobsToSubmit.map((job) => API.post("/service", job));
//       await Promise.all(uploadPromises);

//       alert(`${editedJobs.length} jobs uploaded successfully!`);
//       fetchJobPosts();
//       setShowBulkReviewModal(false);
//     } catch (error) {
//       alert("Error during bulk upload. Some jobs may not have posted.");
//       console.error(error);
//       fetchJobPosts();
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleFormSubmit = async (data, isBulk = false) => {
//     if (isBulk) handleBulkCSVUpload(data);
//     else {
//       if (editingJob) handleUpdateProvided(data);
//       else handleAddProvided(data);
//     }
//   };

//   // --- status badge (admin table + member pipeline)
//   const renderStatusBadge = (status) => {
//     let stylesObj = { bg: "#e0f2fe", color: "#0369a1", icon: "📝", text: "Applied" };
//     if (status === "Review") stylesObj = { bg: "#f3e8ff", color: "#7e22ce", icon: "🔍", text: "Under Review" };
//     else if (status === "Shortlisted") stylesObj = { bg: "#fef3c7", color: "#d97706", icon: "⭐", text: "Shortlisted" };
//     else if (status === "Offer") stylesObj = { bg: "#ccfbf1", color: "#0f766e", icon: "📄", text: "Offer Sent" };
//     else if (status === "Accepted") stylesObj = { bg: "#dcfce7", color: "#166534", icon: "✅", text: "Accepted" };
//     else if (status === "Rejected") stylesObj = { bg: "#fee2e2", color: "#991b1b", icon: "❌", text: "Rejected" };

//     return (
//       <div className={styles.statusBadge} style={{ backgroundColor: stylesObj.bg, color: stylesObj.color }}>
//         <span>{stylesObj.icon}</span> <span>{stylesObj.text}</span>
//       </div>
//     );
//   };

//   const handleStatusChange = async (jobId, memberId, newStatus) => {
//     try {
//       await API.patch(`/service/status`, { jobId, memberId, status: newStatus });
//       alert(`Status updated to ${newStatus}`);
//       fetchJobPosts();
//     } catch (error) {
//       console.error("Failed to update status", error);
//       alert("Failed to update status. Please try again.");
//     }
//   };

//   // --- react-select styles (optional)
//   const customSelectStyles = {
//     control: (base, state) => ({
//       ...base,
//       minHeight: "40px",
//       height: "40px",
//       fontSize: "13px",
//       borderColor: state.isFocused ? "#4f46e5" : "#d1d5db",
//       borderRadius: "10px",
//       boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.12)" : "none",
//       "&:hover": { borderColor: state.isFocused ? "#4f46e5" : "#9ca3af" },
//     }),
//     valueContainer: (base) => ({ ...base, height: "38px", padding: "0 10px" }),
//     indicatorsContainer: (base) => ({ ...base, height: "38px" }),
//     indicatorSeparator: () => ({ display: "none" }),
//     menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//     menu: (base) => ({
//       ...base,
//       zIndex: 9999,
//       borderRadius: "10px",
//       border: "1px solid #e5e7eb",
//       boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
//     }),
//   };

//   // totals
//   const totalJobs = view === "myPost" ? filteredMyPost.length : filteredJobPosts.length;
//   const totalAllJobs = view === "myPost" ? myPost.length : jobPosts.length;

//   return (
//     <div className={styles.jobs}>
//       {/* TOP BAR (target image style) */}
//       <div
//         ref={headerRef}
//         className={classNames(styles.headerWrapper, { [styles.sidebarCollapsed]: sidebarCollapsed })}
//         style={{ left: sidebarWidth + "px", width: `calc(100% - ${sidebarWidth}px)` }}
//       >
//         <div className={styles.topSearchBar}>
//           <div className={styles.cardSearch}>
//             <div className={styles.searchIcon}>
//               <Search size={20} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search jobs, companies, or skills..."
//               defaultValue={globalFilter || ""}
//               onChange={handleSearchChange}
//               aria-label="Search jobs"
//             />
//           </div>

//           {/* Optional location dropdown + apply */}
//           <div className={styles.searchActions}>
//             <select
//               className={styles.locationSelect}
//               value={getDisplayValue("location") || ""}
//               onChange={(e) => handleFilterChange("location", e.target.value)}
//             >
//               <option value="">All Locations</option>
//               {locationOptions.map((loc) => (
//                 <option key={loc} value={loc}>
//                   {loc}
//                 </option>
//               ))}
//             </select>

//             <button type="button" className={styles.searchButton} onClick={applyPendingFilters}>
//               Search Jobs
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className={styles.tabsContainer}>
//             <div
//               className={classNames(styles.tab, { [styles.active]: view === "request" })}
//               onClick={() => setView("request")}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === "Enter" && setView("request")}
//             >
//               <div className={styles.tabIcon}>
//                 <NotebookPen size={22} />
//               </div>
//               <button type="button" className={styles.tabLabel}>
//                 Job Posts
//               </button>
//             </div>

//             <div
//               className={classNames(styles.tab, { [styles.active]: view === "myPost" })}
//               onClick={() => setView("myPost")}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === "Enter" && setView("myPost")}
//             >
//               <div className={styles.tabIcon}>
//                 <BriefcaseBusiness size={22} />
//               </div>
//               <button type="button" className={styles.tabLabel}>
//                 {user?.role === "Admin" ? "Applicants" : "My Jobs"}
//               </button>
//             </div>
//           </div>

//           {/* Export (Admin only) */}
//           {user?.role === "Admin" && (
//             <div className={styles.exportButtons}>
//               <button onClick={exportJobsToExcel} className={styles.excelButton} type="button">
//                 Export Excel
//               </button>
//               <button onClick={exportJobsToCSV} className={styles.csvButton} type="button">
//                 Export CSV
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Spacer */}
//       <div className={styles.headerSpacer} style={{ height: `${headerHeight}px` }} />

//       {/* ERROR */}
//       {error && (
//         <div className={styles.errorAlert}>
//           <div className={styles.errorContent}>
//             <XCircle size={20} />
//             <span>{error}</span>
//           </div>
//           <button onClick={() => setError(null)} className={styles.closeError} type="button">
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       {/* ADDED: FILTER TOGGLE ACTION ROW */}
//       <div className={styles.filterActionRow}>
//         <div className={styles.statsOverview}>
//           <div className={styles.miniStat}>
//             <span className={styles.miniStatValue}>{totalJobs}</span>
//             <span className={styles.miniStatLabel}>JOBS FOUND</span>
//           </div>
//           <div className={styles.miniStat}>
//             <span className={styles.miniStatValue}>{totalAllJobs}</span>
//             <span className={styles.miniStatLabel}>TOTAL JOBS</span>
//           </div>
//         </div>

//         <button
//           className={styles.toggleFiltersBtn}
//           onClick={() => setShowFilters(!showFilters)}
//           type="button"
//         >
//           {showFilters ? (
//             <><EyeOff size={18} /> Hide Filters</>
//           ) : (
//             <><Filter size={18} /> Show Filters</>
//           )}
//         </button>
//       </div>

//       {/* 2-COLUMN BODY (target image) */}
//       <div className={classNames(styles.pageBody, { [styles.filtersCollapsed]: !showFilters })}>
//         {/* LEFT FILTER SIDEBAR */}
//         {showFilters && (
//           <aside className={styles.filtersSidebar}>
//             <div className={styles.filtersHeader}>
//               <h3 className={styles.filtersTitle}>
//                 <Filter size={18} /> Filters
//               </h3>

//               <button type="button" className={styles.clearAllSmall} onClick={clearAllFilters}>
//                 Clear all
//               </button>
//             </div>

//             {/* Title */}
//             <div className={styles.sidebarField}>
//               <label className={styles.sidebarLabel}>JOB TITLE</label>
//               <Select
//                 options={[{ value: "", label: "All Titles" }, ...titleOptions.map((t) => ({ value: t, label: t }))]}
//                 value={getDisplayValue("title") ? { value: getDisplayValue("title"), label: getDisplayValue("title") } : { value: "", label: "All Titles" }}
//                 onChange={(selected) => handleFilterChange("title", selected?.value || "")}
//                 isSearchable
//                 isClearable
//                 placeholder="All Titles"
//                 styles={customSelectStyles}
//                 className={styles.reactSelect}
//                 menuPortalTarget={document.body}
//                 menuPosition="fixed"
//               />
//             </div>

//             {/* Company */}
//             <div className={styles.sidebarField}>
//               <label className={styles.sidebarLabel}>COMPANY</label>
//               <Select
//                 options={[{ value: "", label: "All Companies" }, ...companyOptions.map((c) => ({ value: c, label: c }))]}
//                 value={getDisplayValue("companyName") ? { value: getDisplayValue("companyName"), label: getDisplayValue("companyName") } : { value: "", label: "All Companies" }}
//                 onChange={(selected) => handleFilterChange("companyName", selected?.value || "")}
//                 isSearchable
//                 isClearable
//                 placeholder="All Companies"
//                 styles={customSelectStyles}
//                 className={styles.reactSelect}
//                 menuPortalTarget={document.body}
//                 menuPosition="fixed"
//               />
//             </div>

//             {/* Role */}
//             <div className={styles.sidebarField}>
//               <label className={styles.sidebarLabel}>JOB ROLE</label>
//               <Select
//                 options={[{ value: "", label: "All Roles" }, ...roleOptions.map((r) => ({ value: r, label: r }))]}
//                 value={getDisplayValue("role") ? { value: getDisplayValue("role"), label: getDisplayValue("role") } : { value: "", label: "All Roles" }}
//                 onChange={(selected) => handleFilterChange("role", selected?.value || "")}
//                 isSearchable
//                 isClearable
//                 placeholder="All Roles"
//                 styles={customSelectStyles}
//                 className={styles.reactSelect}
//                 menuPortalTarget={document.body}
//                 menuPosition="fixed"
//               />
//             </div>

//             {/* Employment Type (like target image) */}
//             <div className={styles.sidebarField}>
//               <label className={styles.sidebarLabel}>EMPLOYMENT TYPE</label>
//               <div className={styles.radioGroup}>
//                 <label className={styles.checkRow}>
//                   <input
//                     type="radio"
//                     name="employmentType"
//                     checked={(getDisplayValue("employmentType") || "") === ""}
//                     onChange={() => handleFilterChange("employmentType", "")}
//                   />
//                   <span>All Types</span>
//                 </label>
//                 {EMPLOYMENT_TYPES.map((t) => (
//                   <label key={t} className={styles.checkRow}>
//                     <input
//                       type="radio"
//                       name="employmentType"
//                       checked={(getDisplayValue("employmentType") || "") === t}
//                       onChange={() => handleFilterChange("employmentType", t)}
//                     />
//                     <span>{t}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Experience */}
//             <div className={styles.sidebarField}>
//               <label className={styles.sidebarLabel}>EXPERIENCE</label>
//               <Select
//                 options={[{ value: "", label: "All Experience" }, ...experienceOptions.map((e) => ({ value: e, label: e }))]}
//                 value={getDisplayValue("experience") ? { value: getDisplayValue("experience"), label: getDisplayValue("experience") } : { value: "", label: "All Experience" }}
//                 onChange={(selected) => handleFilterChange("experience", selected?.value || "")}
//                 isSearchable
//                 isClearable
//                 placeholder="All Experience"
//                 styles={customSelectStyles}
//                 className={styles.reactSelect}
//                 menuPortalTarget={document.body}
//                 menuPosition="fixed"
//               />
//             </div>

//             <div className={styles.sidebarActions}>
//               <button type="button" className={styles.applySidebarFilters} disabled={!hasPendingChanges} onClick={applyPendingFilters}>
//                 Apply Filters
//               </button>
//             </div>
//           </aside>
//         )}

//         {/* RIGHT MAIN */}
//         <main className={styles.mainContent}>
//           {/* Pagination */}
//           <div className={styles.paginationTop}>
//             <button
//               onClick={() => page > 1 && setPage(page - 1)}
//               disabled={page === 1 || loadingState.fetching}
//               type="button"
//               className={styles.paginationButton}
//             >
//               <ChevronLeft size={16} /> Previous
//             </button>
//             <span className={styles.pageInfo}>
//               Page <span className={styles.currentPage}>{page}</span> of {totalPages}
//             </span>
//             <button
//               onClick={() => page < totalPages && setPage(page + 1)}
//               disabled={page === totalPages || loadingState.fetching}
//               type="button"
//               className={styles.paginationButton}
//             >
//               Next <ChevronRight size={16} />
//             </button>
//           </div>

//           {/* LOADING */}
//           {loadingState.fetching ? (
//             <div className={styles.loadingContainer}>
//               <div className={styles.spinner}></div>
//               <p>Loading jobs...</p>
//             </div>
//           ) : (
//             <>
//               {/* VIEW: REQUEST */}
//               {view === "request" && (
//                 <div className={styles.jobsList}>
//                   <h2 className={styles.sectionTitle}>
//                     <NotebookPen size={24} /> Available Job Posts
//                   </h2>

//                   {paginatedJobs.length === 0 ? (
//                     <div className={styles.noResults}>
//                       <div className={styles.noResultsIcon}>🔍</div>
//                       <h3>No jobs found</h3>
//                       <p>Try adjusting your filters or search terms</p>
//                       <button onClick={clearAllFilters} className={styles.clearFiltersButton} type="button">
//                         Clear All Filters
//                       </button>
//                     </div>
//                   ) : (
//                     paginatedJobs.map((job) => (
//                       <div key={job._id} className={styles.jobRow} onClick={() => handleClick(job)}>
//                         <div className={styles.jobRowTop}>
//                           <div className={styles.jobRowTitle}>
//                             <div className={styles.avatarCircle}>{(job.title || "J").slice(0, 1).toUpperCase()}</div>
//                             <div>
//                               <h3>{job.title}</h3>
//                               <div className={styles.jobRowSub}>
//                                 <span>
//                                   <Building size={14} /> {job.companyName || "Company"}
//                                 </span>
//                                 {job.location && (
//                                   <span>
//                                     <MapPin size={14} /> {job.location}
//                                   </span>
//                                 )}
//                                 {job.experience && (
//                                   <span>
//                                     <TrendingUp size={14} /> {job.experience}
//                                   </span>
//                                 )}
//                                 {job.salary && (
//                                   <span>
//                                     <DollarSign size={14} /> {job.salary}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           <div className={styles.jobRowRightBadges}>
//                             {job?.refereedBy && (
//                               <span className={styles.referredPill}>
//                                 <User size={14} /> Referred
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         {job.keySkills && (
//                           <div className={styles.jobRowSkills}>
//                             {job.keySkills
//                               .split(",")
//                               .slice(0, 8)
//                               .map((skill, i) => (
//                                 <span key={i} className={styles.skillTag}>
//                                   {skill.trim()}
//                                 </span>
//                               ))}
//                           </div>
//                         )}

//                         <div className={styles.jobRowFooter}>
//                           <div className={styles.jobRowTime}>
//                             <Calendar size={14} />
//                             <span>
//                               {job.createdAt && !isNaN(new Date(job.createdAt))
//                                 ? `${new Date(job.createdAt).toLocaleDateString()} • ${formatDistanceToNow(new Date(job.createdAt), {
//                                   addSuffix: true,
//                                 })}`
//                                 : "Just Now"}
//                             </span>
//                           </div>

//                           <div className={styles.jobRowActions} onClick={(e) => e.stopPropagation()}>
//                             {(user?.role === "Member" || user?.role === "Candidate" || !user) && (
//                               <ApplyButton
//                                 job={job}
//                                 user={user}
//                                 isApplied={isApplied(job)}
//                                 onApplyClick={handleApplyClick}
//                                 loadingState={loadingState}
//                                 onGoogleLogin={handleGoogleLogin}
//                               />
//                             )}

//                             <button className={styles.viewDetailsBtn} type="button" onClick={() => handleClick(job)}>
//                               View Details
//                             </button>

//                             {user?.role === "Admin" && renderAdminActionButtons(job)}
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}

//               {/* VIEW: MYPOST */}
//               {view === "myPost" && (
//                 <div className={styles.jobsContainer}>
//                   <h2 className={styles.sectionTitle}>
//                     {user?.role === "Admin" ? (
//                       <>
//                         <BriefcaseBusiness size={24} /> Manage Applications
//                       </>
//                     ) : (
//                       <>
//                         <Star size={24} /> My Applications
//                       </>
//                     )}
//                   </h2>

//                   {filteredMyPost.length === 0 ? (
//                     <div className={styles.noResults}>
//                       <div className={styles.noResultsIcon}>{user?.role === "Admin" ? "📭" : "📋"}</div>
//                       <h3>{user?.role === "Admin" ? "No jobs posted yet" : "You haven't applied to any jobs yet"}</h3>
//                       <p>{user?.role === "Admin" ? "Create your first job post to get started" : "Browse jobs and apply to get started"}</p>
//                       {user?.role === "Admin" && (
//                         <button
//                           onClick={() => {
//                             setEditingJob(null);
//                             setShowProvidedModal(true);
//                           }}
//                           className={styles.createJobButton}
//                           type="button"
//                         >
//                           <Plus size={16} /> Create Job Post
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     <div className={styles.jobsGrid}>
//                       {paginatedJobs.map((request) => {
//                         const myStatus = getMyApplicationStatus(request);
//                         const pipelineStatus = getPipelineStatus(myStatus);

//                         return (
//                           <div key={request._id} className={styles.myJobCard}>
//                             <div className={styles.myJobCardHeader}>
//                               <div className={styles.myJobCardContent} onClick={() => handleClick(request)}>
//                                 <div className={styles.myJobCardTitle}>
//                                   <h3>{request.title}</h3>
//                                   <div className={styles.myJobCardMeta}>
//                                     {request?.companyName && (
//                                       <span className={styles.companyName}>
//                                         <Building size={14} /> {request.companyName}
//                                       </span>
//                                     )}
//                                     {request?.location && (
//                                       <span className={styles.location}>
//                                         <MapPin size={14} /> {request.location}
//                                       </span>
//                                     )}
//                                     {request?.employmentType && <span className={styles.jobType}>{request.employmentType}</span>}
//                                   </div>
//                                 </div>

//                                 <div className={styles.myJobCardDate}>
//                                   <Calendar size={12} />
//                                   <span>Posted on: {new Date(request.createdAt).toLocaleDateString()}</span>
//                                 </div>
//                               </div>

//                               {user?.role === "Admin" && renderAdminActionButtons(request)}
//                             </div>

//                             {(user?.role === "Member" || user?.role === "Candidate") && myStatus && (
//                               <div className={styles.applicationPipeline}>
//                                 {myStatus === "Rejected" ? (
//                                   <div className={styles.rejectedStatus}>
//                                     <XCircle size={20} />
//                                     <div>
//                                       <h4>Application Rejected</h4>
//                                       <p>Unfortunately, your application was not selected for this position.</p>
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <>
//                                     <div className={styles.pipelineHeader}>
//                                       <h4>Application Status</h4>
//                                       <div className={styles.currentStatusBadge}>{renderStatusBadge(myStatus)}</div>
//                                     </div>
//                                     <EnhancedStatusPipeline status={pipelineStatus} />
//                                   </>
//                                 )}
//                               </div>
//                             )}

//                             {user?.role === "Admin" && (
//                               <div className={styles.applicantsSection}>
//                                 <div className={styles.applicantsHeader}>
//                                   <h4>
//                                     <Users size={16} /> Applicants ({request.appliedMembers?.length || 0})
//                                   </h4>
//                                   <span className={styles.applicantsCount}>{request.appliedMembers?.length || 0} total</span>
//                                 </div>

//                                 {request.appliedMembers?.length > 0 ? (
//                                   <div className={styles.applicantsTable}>
//                                     <table>
//                                       <thead>
//                                         <tr>
//                                           <th>Name</th>
//                                           <th>Resume</th>
//                                           <th>Status</th>
//                                           <th>Action</th>
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         {request.appliedMembers.map((app, idx) => (
//                                           <tr key={idx}>
//                                             <td className={styles.applicantName}>{app.memberId?.name || "Unknown Applicant"}</td>
//                                             <td className={styles.applicantResume}>
//                                               {app.resumeLink || app.memberId?.resumeLink ? (
//                                                 <a
//                                                   href={getFileUrl(app.resumeLink || app.memberId.resumeLink)}
//                                                   target="_blank"
//                                                   rel="noopener noreferrer"
//                                                   className={styles.resumeLink}
//                                                 >
//                                                   <FileText size={16} /> View Resume
//                                                 </a>
//                                               ) : (
//                                                 <span className={styles.noResume}>No Resume</span>
//                                               )}
//                                             </td>
//                                             <td className={styles.applicantStatus}>{renderStatusBadge(app.status || "Applied")}</td>
//                                             <td className={styles.applicantActions}>
//                                               <select
//                                                 className={styles.statusSelect}
//                                                 value={app.status || "Applied"}
//                                                 onChange={(e) => handleStatusChange(request._id, app.memberId?._id, e.target.value)}
//                                               >
//                                                 <option value="Applied">Applied</option>
//                                                 <option value="Review">Review</option>
//                                                 <option value="Shortlisted">Shortlisted</option>
//                                                 <option value="Offer">Offer</option>
//                                                 <option value="Accepted">Accepted</option>
//                                                 <option value="Rejected">Rejected</option>
//                                               </select>
//                                             </td>
//                                           </tr>
//                                         ))}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 ) : (
//                                   <div className={styles.noApplicants}>
//                                     <Users size={24} />
//                                     <p>No applicants yet. Share this job to get applications!</p>
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </main>
//       </div>

//       {/* Floating Add (Admin only) */}
//       {user?.role === "Admin" && (
//         <button
//           className={styles.floatingAddButton}
//           onClick={() => {
//             setEditingJob(null);
//             setShowProvidedModal(true);
//           }}
//           disabled={loadingState.fetching}
//           aria-label="Add new job"
//           type="button"
//         >
//           <Plus size={24} />
//         </button>
//       )}

//       {/* MODALS */}
//       <ProvidedForm isOpen={showProvidedModal} onClose={handleCloseModal} onSubmit={handleFormSubmit} initialData={editingJob} />

//       <BulkCSVReviewModal
//         isOpen={showBulkReviewModal}
//         onClose={() => setShowBulkReviewModal(false)}
//         jobsData={bulkReviewJobs}
//         onSave={handleSaveBulkJobs}
//         onBulkSubmit={handleSubmitBulkJobs}
//         refereesList={refereesList}
//       />

//       <ResumeUploadModal
//         isOpen={showResumeModal}
//         onClose={() => setShowResumeModal(false)}
//         onUpload={handleUploadAndApply}
//         jobTitle={selectedJob?.title}
//         user={user}
//         onGoogleLogin={handleGoogleLogin}
//       />

//       {/* Google Login Modal */}
//       {showGoogleLoginModal && (
//         <div className={styles.googleLoginModal}>
//           <div className={styles.googleLoginContent}>
//             <div className={styles.googleLoginHeader}>
//               <h3>Login Required</h3>
//               <button onClick={() => setShowGoogleLoginModal(false)} className={styles.closeGoogleLogin} aria-label="Close" type="button">
//                 <X size={24} />
//               </button>
//             </div>

//             <p>Please login to apply for this position</p>

//             <div className={styles.googleLoginOptions}>
//               <GoogleLoginButton
//                 onLoginSuccess={() => {
//                   setShowGoogleLoginModal(false);
//                   if (selectedJob) handleApplyClick({ stopPropagation: () => { } }, selectedJob);
//                 }}
//               />

//               <button className={styles.googleLoginCancel} onClick={() => setShowGoogleLoginModal(false)} type="button">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* LOADING OVERLAY */}
//       {isSubmitting && (
//         <div className={styles.submittingOverlay}>
//           <div className={styles.submittingContent}>
//             <div className={styles.submittingSpinner}></div>
//             <span>Processing data, please wait...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// Jobs.propTypes = {};

// export default Jobs;

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import styles from "./Jobs.module.scss";
import {
  BriefcaseBusiness,
  NotebookPen,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Pencil,
  X,
  FileText,
  User,
  Edit,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  Users,
  Filter,
  Award,
  Target,
  Building,
  Sparkles,
  TrendingUp,
  BookOpen,
  Zap,
  Star,
  ChevronDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import classNames from "classnames";
import { useAuth } from "../../context/AuthContext";
import API from "../../axios";
import { useData } from "../../context/DataContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import debounce from "lodash/debounce";
import PropTypes from "prop-types";
import Select from "react-select";

// Google Login Component
const GoogleLoginButton = ({ onLoginSuccess, onLoginError }) => {
  const handleGoogleLogin = () => {
    try {
      const mockUser = {
        id: "google-user-123",
        name: "Google User",
        email: "user@gmail.com",
        picture: "https://via.placeholder.com/40",
      };
      onLoginSuccess?.(mockUser);
    } catch (e) {
      onLoginError?.(e);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className={styles.googleLoginButton}
      type="button"
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="white"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="white"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="white"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="white"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

// Apply Button
const ApplyButton = ({
  job,
  user,
  isApplied,
  onApplyClick,
  loadingState,
  onGoogleLogin,
}) => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (isApplied) return;
    onApplyClick(e, job);
  };

  if (isApplied) {
    return (
      <button
        className={styles.appliedButton}
        disabled
        onClick={(e) => e.stopPropagation()}
        type="button"
      >
        <CheckCircle size={16} /> Applied
      </button>
    );
  }

  return (
    <div
      className={styles.applyButtonWrapper}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={styles.applyButton}
        disabled={loadingState.applying}
        onClick={handleClick}
        type="button"
      >
        <Zap size={16} /> {loadingState.applying ? "Applying..." : "Apply"}
      </button>

      {showLoginPrompt && (
        <div className={styles.loginPrompt}>
          <div className={styles.loginPromptHeader}>
            <h4>Login Required</h4>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className={styles.closeLoginPrompt}
              aria-label="Close"
              type="button"
            >
              <X size={16} />
            </button>
          </div>

          <p>Please login to apply for this position</p>

          <div className={styles.loginOptions}>
            <GoogleLoginButton
              onLoginSuccess={() => {
                setShowLoginPrompt(false);
                onGoogleLogin?.(() => {
                  onApplyClick({ stopPropagation: () => {} }, job);
                });
              }}
            />
            <button
              className={styles.cancelLogin}
              onClick={() => setShowLoginPrompt(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Remote",
  "Contract",
  "Freelance",
];

const JOB_TITLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Scientist",
  "UI/UX Designer",
  "DevOps Engineer",
  "QA / Tester",
  "Product Manager",
  "HR Recruiter",
  "Business Analyst",
  "System Administrator",
  "Network Engineer",
  "Mobile App Developer",
];

const DEGREE_OPTIONS = [
  "SSLC / 10th", "PUC / 12th", "ITI", "Diploma (Polytechnic)", "B.A", "B.Com", "B.Sc",
  "B.B.A", "B.C.A", "B.S.W", "B.Voc", "B.E", "B.Tech", "B.Arch", "LLB", "BBA LLB",
  "BA LLB", "B.Pharm", "D.Pharm", "BPT", "BDS", "MBBS", "BAMS", "BHMS", "M.A",
  "M.Com", "M.Sc", "M.S.W", "M.B.A", "M.C.A", "M.Tech", "M.E", "LLM", "M.Pharm",
  "MPT", "MD", "MS", "PhD", "Post Graduate Diploma (PGD)", "Certification Course"
];

const PASSOUT_YEAR_OPTIONS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() + 3 - i));


const KARNATAKA_DISTRICTS = [
  "Bagalkote",
  "Ballari (Bellary)",
  "Belagavi (Belgaum)",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi (Gulbarga)",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru (Mysore)",
  "Raichur",
  "Ramanagara",
  "Shivamogga (Shimoga)",
  "Tumakuru (Tumkur)",
  "Udupi",
  "Uttara Kannada (Karwar)",
  "Vijayanagara",
  "Vijayapura (Bijapur)",
  "Yadgir",
];

const EditableDropdown = ({
  label,
  value,
  options,
  placeholder = "Select or type...",
  required = false,
  error = "",
  onChange,
}) => {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const norm = (s) => String(s || "").toLowerCase().trim();

  const filtered = options
    .filter(Boolean)
    .filter((opt) => norm(opt).includes(norm(query)));

  const commit = (val) => {
    const v = String(val || "").trim();
    onChange(v);
    setQuery(v);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={styles.edWrap}>
      <label className={styles.edLabel}>
        {label} {required && <span className={styles.edReq}>*</span>}
      </label>

      <div className={styles.edControl}>
        <div
          className={`${styles.edField} ${
            error ? styles.edFieldError : ""
          }`}
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <span className={styles.edIcon}>
            <Search size={16} />
          </span>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className={styles.edInput}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(query);
              }
              if (e.key === "Escape") setOpen(false);
            }}
          />

          <button
            type="button"
            className={styles.edBtn}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((p) => !p);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {open && (
          <div className={styles.edMenu}>
            {filtered.length === 0 ? (
              <div className={styles.edEmpty}>
                No matches. Press <b>Enter</b> to use: “{query}”
              </div>
            ) : (
              <div className={styles.edMenuList}>
                {filtered.slice(0, 200).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.edItem} ${
                      norm(opt) === norm(value)
                        ? styles.edItemActive
                        : ""
                    }`}
                    onClick={() => commit(opt)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.edTip}>
              <span>
                Tip: Type to search. If custom, type it and press <b>Enter</b>.
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <p className={styles.edErrorText}>{error}</p>}
    </div>
  );
};

// =========================================================================================
// BulkCSVReviewModal
// =========================================================================================
const BulkCSVReviewModal = ({
  isOpen,
  onClose,
  jobsData,
  onSave,
  onBulkSubmit,
  refereesList = [],
  recruitersList = [],
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedJobs, setEditedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const jobsPerPage = 5;

  useEffect(() => {
    if (isOpen && jobsData) {
      setEditedJobs([...jobsData]);
      setExpandedRows({});
      setEditingIndex(null);
      setCurrentPage(0);
    }
  }, [isOpen, jobsData]);

  if (!isOpen || !jobsData) return null;

  const totalPages = Math.ceil(editedJobs.length / jobsPerPage);
  const startIndex = currentPage * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = editedJobs.slice(startIndex, endIndex);

  const handleEdit = (index) => setEditingIndex(startIndex + index);
  const handleSaveEdit = () => setEditingIndex(null);

  const handleCancelEdit = () => {
    setEditingIndex(null);
    if (jobsData) setEditedJobs([...jobsData]);
  };

  const handleFieldChange = (pageIndex, field, value) => {
    const actualIndex = startIndex + pageIndex;
    const updatedJobs = [...editedJobs];
    updatedJobs[actualIndex] = { ...updatedJobs[actualIndex], [field]: value };
    setEditedJobs(updatedJobs);
  };

  const handleRemoveJob = (pageIndex) => {
    const actualIndex = startIndex + pageIndex;
    const updatedJobs = [...editedJobs];
    updatedJobs.splice(actualIndex, 1);
    setEditedJobs(updatedJobs);
    if (currentJobs.length === 1 && currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const toggleRowExpansion = (pageIndex) => {
    const actualIndex = startIndex + pageIndex;
    setExpandedRows((prev) => ({ ...prev, [actualIndex]: !prev[actualIndex] }));
  };

  return (
    <div className={styles.bulkModalOverlay}>
      <div className={styles.bulkModal}>
        <div className={styles.bulkModalHeader}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2 style={{ margin: 0 }}>Review & Edit CSV/Exel Jobs</h2>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>
              Review the imported rows, edit if needed, then submit all.
            </div>
          </div>

          <button
            onClick={onClose}
            className={styles.closeBulkModal}
            aria-label="Close modal"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.bulkStats}>
          <span>
            Total Jobs: <strong>{editedJobs.length}</strong>
          </span>
          <span>
            Page: <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
          </span>
          <span>
            Editing: <strong>{editingIndex !== null ? "Yes" : "No"}</strong>
          </span>
        </div>

        <div className={styles.bulkTableContainer}>
          <table className={styles.bulkTable}>
            <thead>
              <tr>
                <th style={{ width: 52 }}>#</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Job Role</th>
                <th style={{ width: 140 }}>Type</th>
                <th>Location</th>
                <th style={{ width: 140 }}>Experience</th>
                <th style={{ width: 140 }}>Salary</th>
                <th style={{ width: 170 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentJobs.map((job, index) => {
                const actualIndex = startIndex + index;
                const isEditing = editingIndex === actualIndex;
                const isExpanded = expandedRows[actualIndex];

                return (
                  <React.Fragment key={actualIndex}>
                    <tr
                      style={{
                        background: isEditing
                          ? "rgba(37,99,235,0.03)"
                          : "transparent",
                      }}
                    >
                      <td>{startIndex + index + 1}</td>

                      <td>
                        {isEditing ? (
                          <input
                            value={job.title || ""}
                            onChange={(e) =>
                              handleFieldChange(index, "title", e.target.value)
                            }
                            className={styles.bulkInput}
                            placeholder="Job title"
                          />
                        ) : (
                          <strong style={{ fontWeight: 1100 }}>
                            {job.title || "—"}
                          </strong>
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            value={job.companyName || ""}
                            onChange={(e) =>
                              handleFieldChange(index, "companyName", e.target.value)
                            }
                            className={styles.bulkInput}
                            placeholder="Company"
                          />
                        ) : (
                          job.companyName || "—"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            value={job.role || ""}
                            onChange={(e) =>
                              handleFieldChange(index, "role", e.target.value)
                            }
                            className={styles.bulkInput}
                            placeholder="Role"
                          />
                        ) : (
                          job.role || "—"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            value={job.employmentType || "Full-time"}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "employmentType",
                                e.target.value
                              )
                            }
                            className={styles.bulkSelect}
                          >
                            {EMPLOYMENT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          job.employmentType || "—"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            value={job.location || ""}
                            onChange={(e) =>
                              handleFieldChange(index, "location", e.target.value)
                            }
                            className={styles.bulkInput}
                            placeholder="Location"
                          />
                        ) : (
                          job.location || "—"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            value={job.experience || ""}
                            onChange={(e) =>
                              handleFieldChange(index, "experience", e.target.value)
                            }
                            className={styles.bulkInput}
                            placeholder="0-2 years"
                          />
                        ) : (
                          job.experience || "—"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            value={job.salary || ""}
                            onChange={(e) =>
                              handleFieldChange(index, "salary", e.target.value)
                            }
                            className={styles.bulkInput}
                            placeholder="₹..."
                          />
                        ) : (
                          job.salary || "—"
                        )}
                      </td>

                      <td>
                        <div className={styles.bulkActions}>
                          <div className={styles.bulkActionButtons}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className={styles.bulkSaveBtn}
                                  title="Save row"
                                  type="button"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className={styles.bulkCancelBtn}
                                  title="Cancel edit"
                                  type="button"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(index)}
                                  className={styles.bulkEditBtn}
                                  title="Edit row"
                                  type="button"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleRemoveJob(index)}
                                  className={styles.bulkDeleteBtn}
                                  title="Remove row"
                                  type="button"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className={styles.bulkExpandBtn}
                            type="button"
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff size={12} /> Hide details
                              </>
                            ) : (
                              <>
                                <Eye size={12} /> Show details
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className={styles.bulkExpandedRow}>
                        <td colSpan="9">
                          <div className={styles.bulkExpandedContent}>
                            <div className={styles.bulkFieldGroup}>
                              <label>Education</label>
                              {isEditing ? (
                                <select
                                  value={job.education || ""}
                                  onChange={(e) =>
                                    handleFieldChange(index, "education", e.target.value)
                                  }
                                  className={styles.bulkSelect}
                                >
                                  <option value="">Select Education</option>
                                  {DEGREE_OPTIONS.map((opt, i) => (
                                    <option key={i} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div>{job.education || "—"}</div>
                              )}
                            </div>

                            <div className={styles.bulkFieldGroup}>
                              <label>Passed Out Year</label>
                              {isEditing ? (
                                <select
                                  value={job.passedOutYear || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      index,
                                      "passedOutYear",
                                      e.target.value
                                    )
                                  }
                                  className={styles.bulkSelect}
                                >
                                  <option value="">Select Year</option>
                                  {PASSOUT_YEAR_OPTIONS.map((year, i) => (
                                    <option key={i} value={year}>
                                      {year}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div>{job.passedOutYear || "—"}</div>
                              )}
                            </div>

                            <div className={styles.bulkFieldGroup}>
                              <label>Key Skills</label>
                              {isEditing ? (
                                <input
                                  value={job.keySkills || ""}
                                  onChange={(e) =>
                                    handleFieldChange(index, "keySkills", e.target.value)
                                  }
                                  className={styles.bulkInput}
                                  placeholder="React, Node, MongoDB"
                                />
                              ) : (
                                <div>{job.keySkills || "—"}</div>
                              )}
                            </div>

                            <div className={styles.bulkFieldGroup}>
                              <label>Refereed Person</label>
                              {isEditing ? (
                                <select
                                  value={job.refereedBy || ""}
                                  onChange={(e) =>
                                    handleFieldChange(index, "refereedBy", e.target.value)
                                  }
                                  className={styles.bulkSelect}
                                >
                                  <option value="">
                                    Select a Referee
                                  </option>
                                  {refereesList?.map((referee) => (
                                    <option
                                      key={referee._id}
                                      value={referee._id}
                                    >
                                      {referee.name ||
                                        referee.email ||
                                        "Unknown Name"}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div>
                                  {job.refereedBy
                                    ? refereesList?.find(
                                        (r) => r._id === job.refereedBy
                                      )?.name || "Referee Selected"
                                    : "None"}
                                </div>
                              )}
                            </div>

                            <div className={styles.bulkFieldGroup}>
                              <label>Job Posted By (Recruiter)</label>
                              {isEditing ? (
                                <select
                                  value={job.jobPostedBy || ""}
                                  onChange={(e) =>
                                    handleFieldChange(index, "jobPostedBy", e.target.value)
                                  }
                                  className={styles.bulkSelect}
                                >
                                  <option value="">
                                    Select a Recruiter
                                  </option>
                                  {recruitersList?.map((recruiter) => (
                                    <option
                                      key={recruiter._id}
                                      value={recruiter._id}
                                    >
                                      {recruiter.fullName ||
                                        recruiter.email ||
                                        "Unknown Recruiter"}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div>
                                  {job.jobPostedBy
                                    ? recruitersList?.find(
                                        (r) => r._id === job.jobPostedBy
                                      )?.fullName || "Recruiter Selected"
                                    : "None"}
                                </div>
                              )}
                            </div>

                            <div
                              className={styles.bulkFieldGroup}
                              style={{ gridColumn: "1 / -1" }}
                            >
                              <label>Description</label>
                              {isEditing ? (
                                <textarea
                                  value={job.description || ""}
                                  onChange={(e) =>
                                    handleFieldChange(index, "description", e.target.value)
                                  }
                                  className={styles.bulkTextarea}
                                  placeholder="Job description..."
                                />
                              ) : (
                                <div className={styles.bulkDescription}>
                                  {job.description || "—"}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.bulkPagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className={`${styles.bulkPageButton} ${
              currentPage === 0 ? styles.disabled : ""
            }`}
            type="button"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
            className={`${styles.bulkPageButton} ${
              currentPage === totalPages - 1 ? styles.disabled : ""
            }`}
            type="button"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.bulkFooterButtons}>
          <button
            onClick={() => onSave(editedJobs)}
            className={styles.bulkSaveAllButton}
            type="button"
          >
            Save Changes
          </button>
          <button
            onClick={() => onBulkSubmit(editedJobs)}
            className={styles.bulkSubmitAllButton}
            type="button"
          >
            Submit All Jobs
          </button>
          <button
            onClick={onClose}
            className={styles.bulkCancelButton}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

BulkCSVReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  jobsData: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onBulkSubmit: PropTypes.func.isRequired,
  refereesList: PropTypes.array,
};

const CSV_TEMPLATE_HEADERS =
  "title,companyName,role,employmentType,location,experience,salary,education,passedOutYear,keySkills,description\n";

// =========================================================================================
// ProvidedForm
// =========================================================================================
const ProvidedForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [education, setEducation] = useState("");
  const [passedOutYear, setPassedOutYear] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [role, setRole] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const [jobPosted, setJobPosted] = useState("");

  const { memberContext } = useData();
  const [refereedBy, setRefereedBy] = useState("");
  const [refereesList, setRefereesList] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);

  const [csvFileName, setCsvFileName] = useState("");

  const downloadCSVTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_HEADERS], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "jobs_template.csv");
  };

    const downloadExcelTemplate = () => {
    const headers = [
      "title",
      "companyName",
      "Job role",
      "employmentType",
      "location",
      "experience",
      "salary",
      "education",
      "passedOutYear",
      "keySkills",
      "description",
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);

    // Set column widths for better readability
    const colWidths = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Jobs Template");
    XLSX.writeFile(wb, "jobs_template.xlsx");
  };

  useEffect(() => {
    if (memberContext) {
      const filtered = memberContext.filter((m) => m.memberType === "Referee");
      setRefereesList(filtered);
    }
  }, [memberContext]);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters`);
        setRecruitersList(response.data);
      } catch (error) {
        console.error("Error fetching recruiters:", error);
      }
    };
    fetchRecruiters();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setCsvFileName("");

    if (initialData) {
      setTitle(initialData.title || "");
      setCompanyName(initialData.companyName || "");
      setEmploymentType(initialData.employmentType || EMPLOYMENT_TYPES[0]);
      setLocation(initialData.location || "");
      setDescription(initialData.description || "");
      setEducation(initialData.education || "");
      setPassedOutYear(initialData.passedOutYear || "");
      setExperience(initialData.experience || "");
      setSalary(initialData.salary || "");
      setRole(initialData.role || "");
      setKeySkills(initialData.keySkills || "");

      const refId =
        initialData.refereedBy && typeof initialData.refereedBy === "object"
          ? initialData.refereedBy._id
          : initialData.refereedBy || "";

      setRefereedBy(refId);

      const recId =
        initialData.jobPosted && typeof initialData.jobPosted === "object"
          ? initialData.jobPosted._id
          : initialData.jobPosted || "";

      setJobPosted(recId);
    } else {
      setTitle("");
      setCompanyName("");
      setEmploymentType(EMPLOYMENT_TYPES[0]);
      setLocation("");
      setDescription("");
      setEducation("");
      setPassedOutYear("");
      setExperience("");
      setSalary("");
      setRole("");
      setKeySkills("");
      setRefereedBy("");
      setJobPosted("");
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.toLowerCase().endsWith(".csv") &&
      !file.name.toLowerCase().endsWith(".xlsx") &&
      !file.name.toLowerCase().endsWith(".xls")
    ) {
      alert("Please upload a valid CSV or Excel file");
      e.target.value = "";
      setCsvFileName("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      e.target.value = "";
      setCsvFileName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const bulkData = [];

        if (file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv") {
          const text = new TextDecoder("utf-8").decode(data);
          const rows = String(text)
            .split("\n")
            .filter((row) => row.trim() !== "");

          if (rows.length < 2) {
            alert("CSV is empty or invalid format");
            return;
          }

          const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());

          for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(",").map((v) => v.trim());
            const entry = {};
            headers.forEach((header, index) => {
              entry[header] = values[index] || "";
            });

            bulkData.push({
              title: entry.title || "",
              companyName: entry.companyname || entry.companyName || "",
              role: entry.role || "",
              employmentType:
                entry.employmenttype || entry.employmentType || "Full-time",
              location: entry.location || "",
              experience: entry.experience || "",
              salary: entry.salary || "",
              education: entry.education || "",
              passedOutYear:
                entry.passedoutyear || entry.passedOutYear || "",
              keySkills: entry.keyskills || entry.keySkills || "",
              description: entry.description || "",
              refereedBy: "",
              jobPosted: "",
            });
          }
        } else {
          // Parse as Excel
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

          if (jsonData.length < 2) {
            alert("Excel file is empty or invalid format");
            return;
          }

          const headers = jsonData[0].map((h) => String(h || "").trim().toLowerCase());

          for (let i = 1; i < jsonData.length; i++) {
            const rowData = jsonData[i];
            // Skip completely empty rows
            if (rowData.every((cell) => cell === "")) continue;

            const entry = {};
            headers.forEach((header, index) => {
              entry[header] = String(rowData[index] || "").trim();
            });

            bulkData.push({
              title: entry.title || "",
              companyName: entry.companyname || entry.companyName || "",
              role: entry.role || "",
              employmentType:
                entry.employmenttype || entry.employmentType || "Full-time",
              location: entry.location || "",
              experience: entry.experience || "",
              salary: entry.salary || "",
              education: entry.education || "",
              passedOutYear:
                entry.passedoutyear || entry.passedOutYear || "",
              keySkills: entry.keyskills || entry.keySkills || "",
              description: entry.description || "",
              refereedBy: "",
              jobPosted: "",
            });
          }
        }

        if (bulkData.length === 1) {
          const job = bulkData[0];
          setTitle(job.title);
          setCompanyName(job.companyName);
          setRole(job.role);
          setEmploymentType(job.employmentType);
          setLocation(job.location);
          setExperience(job.experience);
          setSalary(job.salary);
          setEducation(job.education);
          setPassedOutYear(job.passedOutYear);
          setKeySkills(job.keySkills);
          setDescription(job.description);
          setRefereedBy("");
          setJobPosted("");
          alert("Data loaded into form. Review and click Post.");
        } else if (bulkData.length > 1) {
          onSubmit(bulkData, true);
        } else {
          alert("No valid data found in file.");
        }
      } catch (error) {
        console.error("File parsing error:", error);
        alert("Error parsing file. Please check the format.");
      }
    };

    reader.onerror = () => alert("Error reading file. Please try again.");
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!refereedBy && !jobPosted) {
      alert("Please select either a Refereed Person or a Job Posted By (Recruiter).");
      return;
    }

    onSubmit(
      {
        title,
        companyName,
        employmentType,
        location,
        description,
        education,
        passedOutYear,
        experience,
        salary,
        role,
        keySkills,
        refereedBy: refereedBy || null,
        jobPosted: jobPosted || null,
      },
      false
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>{initialData ? "Edit Job Post" : "Create Job Post"}</h2>
          <button
            onClick={onClose}
            className={styles.closeModalBtn}
            aria-label="Close modal"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {!initialData && (
            <div className={styles.csvUploadSection}>
              <div className={styles.csvTemplateRow}>
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className={styles.downloadTemplateBtn}
                >
                  Download CSV Template
                </button>
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className={styles.downloadTemplateBtn}
                >
                  Download Excel Template
                </button>
              </div>

              <input
                type="file"
                accept=".csv, .xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                id="csv-upload"
                className={styles.csvInput}
                onChange={handleFileChange}
              />

              <label htmlFor="csv-upload" className={styles.csvUploadCard}>
                <span className={styles.csvIcon}>
                  <FileText size={20} />
                </span>
                <span className={styles.csvText}>
                  <h4>Upload CSV/Excel Format</h4>
                  <p>Drop your CSV or Excel file here or click to browse (max 5MB)</p>
                </span>
                <span className={styles.csvAction}>Choose File</span>
              </label>

              {csvFileName && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  Selected file: {csvFileName}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.createJobForm}>
            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <EditableDropdown
                label={
                  <>
                    <BookOpen size={14} /> Job Title
                  </>
                }
                value={title}
                options={JOB_TITLE_OPTIONS}
                placeholder="Select or Type Job Title"
                required={true}
                onChange={setTitle}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Building size={14} /> Company Name
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Target size={14} /> Job Role
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <Calendar size={14} /> Employment Type
              </label>
              <select
                className={styles.formSelect}
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <EditableDropdown
                label="Location"
                value={location}
                options={KARNATAKA_DISTRICTS}
                placeholder="Select location..."
                onChange={setLocation}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <TrendingUp size={14} /> Experience
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                <DollarSign size={14} /> Salary
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <EditableDropdown
                label={
                  <>
                    <GraduationCap size={14} /> Education
                  </>
                }
                value={education}
                options={DEGREE_OPTIONS}
                placeholder="Select or Type Education"
                onChange={setEducation}
              />
            </div>

            <div className={styles.formGroup}>
              <EditableDropdown
                label={
                  <>
                    <Award size={14} /> Passout Year
                  </>
                }
                value={passedOutYear}
                options={PASSOUT_YEAR_OPTIONS}
                placeholder="Select or Type Year"
                onChange={setPassedOutYear}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label>
                <Users size={14} /> Refereed Person 
                {!jobPosted && <span className={styles.required}> (Required if Recruiter is empty)</span>}
              </label>
              <select
                className={styles.formSelect}
                value={refereedBy}
                onChange={(e) => setRefereedBy(e.target.value)}
                required={!jobPosted}
              >
                <option value="">Select a Referee </option>
                {refereesList.length > 0 ? (
                  refereesList.map((referee) => (
                    <option key={referee._id} value={referee._id}>
                      {referee.name || referee.email || "Unknown Name"}
                    </option>
                  ))
                ) : (
                  <option disabled>No referees found</option>
                )}
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label>
                <Users size={14} /> Job Posted By (Recruiter) 
                {!refereedBy && <span className={styles.required}> (Required if Referee is empty)</span>}
              </label>
              <select
                className={styles.formSelect}
                value={jobPosted}
                onChange={(e) => setJobPosted(e.target.value)}
                required={!refereedBy}
              >
                <option value="">Select a Recruiter</option>
                {recruitersList.length > 0 ? (
                  recruitersList.map((recruiter) => (
                    <option key={recruiter._id} value={recruiter._id}>
                      {recruiter.fullName || recruiter.email || "Unknown Recruiter"}
                    </option>
                  ))
                ) : (
                  <option disabled>No recruiters found</option>
                )}
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label>
                <Sparkles size={14} /> Key Skills
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={keySkills}
                onChange={(e) => setKeySkills(e.target.value)}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label>
                <FileText size={14} /> Description{" "}
                <span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.formTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className={`${styles.modalFooter} ${styles.fullRow}`}>
              <button type="submit" className={styles.submitButton}>
                {initialData ? "Update Job" : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ProvidedForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

// =========================================================================================
// ResumeChoiceModal — shown when user already has a resume in profile
// =========================================================================================
const ResumeChoiceModal = ({ isOpen, onClose, onUseExisting, onUploadNew, jobTitle, existingResumeUrl, isDarkTheme }) => {
  if (!isOpen) return null;

  const getResumeName = (url) => {
    if (!url) return "Your profile resume";
    try {
      const parts = url.split("/");
      const raw = parts[parts.length - 1];
      return decodeURIComponent(raw.split("?")[0]) || "Your profile resume";
    } catch {
      return "Your profile resume";
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: isDarkTheme ? "#0f172a" : "#fff",
          borderRadius: "20px", padding: "32px 28px 28px",
          width: "100%", maxWidth: "460px",
          boxShadow: isDarkTheme ? "0 25px 60px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.3)" : "0 25px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)",
          animation: "slideUpFade 0.25s ease",
          border: isDarkTheme ? "1px solid rgba(148, 163, 184, 0.18)" : "none",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: isDarkTheme ? "#e5e7eb" : "#0f172a" }}>Choose Your Resume</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: isDarkTheme ? "#cbd5e1" : "#64748b", fontWeight: 600 }}>
              Applying for: <span style={{ color: "#4f46e5" }}>{jobTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isDarkTheme ? "rgba(148, 163, 184, 0.10)" : "#f1f5f9",
              border: "none", cursor: "pointer",
              color: isDarkTheme ? "#94a3b8" : "#94a3b8", padding: "4px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.color = isDarkTheme ? "#fca5a5" : "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = isDarkTheme ? "#94a3b8" : "#94a3b8"}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: isDarkTheme ? "rgba(148, 163, 184, 0.18)" : "#e2e8f0", marginBottom: 20 }} />

        {/* Option 1 — Use Existing */}
        <button
          onClick={onUseExisting}
          style={{
            width: "100%", textAlign: "left", padding: "18px 20px",
            border: isDarkTheme ? "2px solid rgba(79, 70, 229, 0.3)" : "2px solid #e0e7ff",
            borderRadius: "14px",
            background: isDarkTheme ? "linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.08))" : "linear-gradient(135deg, #f0f4ff 0%, #f8f9ff 100%)",
            cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", gap: 16,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDarkTheme ? "rgba(79, 70, 229, 0.3)" : "#e0e7ff"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle size={22} color="#fff" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: isDarkTheme ? "#e5e7eb" : "#1e293b", marginBottom: 3 }}>
              Use Existing Resume
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{
                fontSize: 12, color: isDarkTheme ? "#a5b4fc" : "#6366f1", fontWeight: 600,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 180,
              }}>
                {getResumeName(existingResumeUrl)}
              </div>
              {/* View link — stops propagation so it doesn't trigger apply */}
              {existingResumeUrl && (
                <a
                  href={existingResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontWeight: 700, color: isDarkTheme ? "#38bdf8" : "#0ea5e9",
                    textDecoration: "none", padding: "2px 8px",
                    background: isDarkTheme ? "rgba(56, 189, 248, 0.15)" : "#e0f2fe", borderRadius: "6px",
                    flexShrink: 0, whiteSpace: "nowrap",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDarkTheme ? "rgba(56, 189, 248, 0.25)" : "#bae6fd"}
                  onMouseLeave={e => e.currentTarget.style.background = isDarkTheme ? "rgba(56, 189, 248, 0.15)" : "#e0f2fe"}
                >
                  {/* Eye icon */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </a>
              )}
            </div>
            <div style={{ fontSize: 11, color: isDarkTheme ? "#cbd5e1" : "#94a3b8", fontWeight: 500, marginTop: 3 }}>
              Click to apply instantly with this resume
            </div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Option 2 — Upload New */}
        <button
          onClick={onUploadNew}
          style={{
            width: "100%", textAlign: "left", padding: "18px 20px",
            border: isDarkTheme ? "2px solid rgba(148, 163, 184, 0.2)" : "2px solid #e2e8f0",
            borderRadius: "14px",
            background: isDarkTheme ? "rgba(148, 163, 184, 0.06)" : "#fafbff", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 16,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = isDarkTheme ? "#cbd5e1" : "#94a3b8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDarkTheme ? "rgba(148, 163, 184, 0.2)" : "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FileText size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: isDarkTheme ? "#e5e7eb" : "#1e293b", marginBottom: 2 }}>
              Upload a Different Resume
            </div>
            <div style={{ fontSize: 11, color: isDarkTheme ? "#cbd5e1" : "#94a3b8", fontWeight: 500 }}>
              PDF, DOC, or DOCX (Max 5MB)
            </div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDarkTheme ? "#cbd5e1" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 16, padding: "11px",
            background: "none", border: "none", cursor: "pointer",
            color: isDarkTheme ? "#94a3b8" : "#94a3b8", fontWeight: 700, fontSize: 13,
            borderRadius: "10px", transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = isDarkTheme ? "#cbd5e1" : "#64748b"}
          onMouseLeave={e => e.currentTarget.style.color = isDarkTheme ? "#94a3b8" : "#94a3b8"}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// =========================================================================================
// ResumeUploadModal
// =========================================================================================
const ResumeUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  jobTitle,
  user,
  onGoogleLogin,
}) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setResumeFile(null);
      setFileName("");
      setIsUploading(false);
      setShowGoogleLogin(!user);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or Word document only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setResumeFile(file);
    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB");
  };

  const removeFile = (e) => {
    e.preventDefault();
    setResumeFile(null);
    setFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowGoogleLogin(true);
      return;
    }

    if (!resumeFile) {
      alert("Please select a resume file");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(resumeFile);
      setResumeFile(null);
      setFileName("");
      onClose();
    } catch (error) {
      alert("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setResumeFile(null);
    setFileName("");
    setIsUploading(false);
    setShowGoogleLogin(false);
    onClose();
  };

  return (
    <div className={styles.resumeModalOverlay} onMouseDown={handleClose}>
      <div
        className={styles.resumeModal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.resumeModalHeader}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h3 style={{ margin: 0 }}>Upload Resume</h3>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>
              Applying for: <strong style={{ color: "#2563eb" }}>{jobTitle}</strong>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={styles.closeResumeModal}
            aria-label="Close modal"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.resumeModalBody}>
          {showGoogleLogin ? (
            <div className={styles.resumeLoginSection}>
              <p>Please login to apply for this position</p>
              <div className={styles.resumeLoginOptions}>
                <GoogleLoginButton
                  onLoginSuccess={() => {
                    onGoogleLogin?.(() => setShowGoogleLogin(false));
                    setShowGoogleLogin(false);
                  }}
                />
                <button
                  className={styles.resumeCancelButton}
                  onClick={handleClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.resumeForm}>
              <input
                type="file"
                id="resume-upload-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className={styles.resumeFileInput}
              />

              {!resumeFile ? (
                <label
                  htmlFor="resume-upload-input"
                  className={styles.resumeUploadArea}
                >
                  <div className={styles.uploadIcon}>
                    <FileText size={32} />
                    <span>Click to upload resume</span>
                  </div>
                  <div className={styles.uploadHint}>
                    PDF, DOC, or DOCX (Max 5MB)
                  </div>
                </label>
              ) : (
                <div className={styles.selectedFile}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <FileText size={24} style={{ color: "#2563eb" }} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 1000,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {fileName}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#64748b",
                        }}
                      >
                        {fileSize}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: 8,
                    }}
                    title="Remove file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={!resumeFile || isUploading}
                className={`${styles.resumeSubmitButton} ${
                  !resumeFile || isUploading ? styles.disabled : ""
                }`}
              >
                {isUploading ? "Uploading..." : "Upload & Apply Now"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

ResumeUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  jobTitle: PropTypes.string,
  user: PropTypes.object,
  onGoogleLogin: PropTypes.func,
};

// =========================================================================================
// Enhanced Status Pipeline
// =========================================================================================
const EnhancedStatusPipeline = ({ status }) => {
  const steps = [
    { key: "Submitted", label: "Applied", icon: "📝" },
    { key: "Review", label: "Under Review", icon: "🔍" },
    { key: "Interview", label: "Interview", icon: "💼" },
    { key: "Offer", label: "Offer", icon: "📄" },
    { key: "Hired", label: "Hired", icon: "🎉" },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className={styles.statusPipeline}>
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`${styles.statusStep} ${
            index < currentIndex
              ? styles.completed
              : index === currentIndex
              ? styles.active
              : ""
          }`}
        >
          <div className={styles.stepIcon}>
            <span>{step.icon}</span>
          </div>
          <div className={styles.stepLabel}>{step.label}</div>
        </div>
      ))}
    </div>
  );
};

// =========================================================================================
// MAIN COMPONENT: Jobs
// =========================================================================================
function Jobs() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [jobPosts, setJobPosts] = useState([]);
  const [myPost, setMyPost] = useState([]);
  const [view, setView] = useState("request");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showProvidedModal, setShowProvidedModal] = useState(false);
  const [showBulkReviewModal, setShowBulkReviewModal] = useState(false);
  const [bulkReviewJobs, setBulkReviewJobs] = useState([]);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showResumeChoiceModal, setShowResumeChoiceModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingState, setLoadingState] = useState({
    fetching: false,
    applying: false,
    uploading: false,
    deleting: false,
    filtering: false,
  });
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { jobContext, memberContext } = useData();
  const navigate = useNavigate();

  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280;

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(90);

  const [filters, setFilters] = useState({
  jobId: "",
  title: "",
  companyName: "",
  role: "",
  employmentType: "",
  location: "",
  experience: "",
  salary: "",
  education: "",
  passedOutYear: "",
  keySkills: "",
  refereedBy: "",
  description: "",
  startDate: null,
  endDate: null,
  initialNumber: "",
  finalNumber: "",
});

  const [pendingFilters, setPendingFilters] = useState({});
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const [refereesList, setRefereesList] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);

  const BACKEND_URL = "http://localhost:5000";
  const JOBS_PER_PAGE = 10;

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDarkTheme(theme === "dark");
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (memberContext) {
      const filtered = memberContext.filter((m) => m.memberType === "Referee");
      setRefereesList(filtered);
    }
  }, [memberContext]);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiters`);
        setRecruitersList(response.data);
      } catch (error) {
        console.error("Error fetching recruiters:", error);
      }
    };
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight + 16);
      }
    };
    updateHeaderHeight();
    const t = setTimeout(updateHeaderHeight, 100);
    return () => clearTimeout(t);
  }, [sidebarWidth, view, globalFilter, pendingFilters, filters]);

  const handleGoogleLogin = async (callback) => {
    try {
      if (callback) callback();
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed. Please try again.");
    }
  };

  const checkIsApplied = (job, userId) => {
    if (!job?.appliedMembers || !userId || job.appliedMembers.length === 0)
      return false;
    const userIdStr = String(userId).trim();

    return job.appliedMembers.some((app) => {
      const possibleIds = [
        app.memberId?._id,
        app.memberId,
        app.member?._id,
        app.member,
        app.userId?._id,
        app.userId,
        app.applicantId?._id,
        app.applicantId,
        app._id,
      ].filter((id) => id != null);

      return possibleIds.some((id) => String(id).trim() === userIdStr);
    });
  };

  const isApplied = (job) => checkIsApplied(job, user?.memberId);

  const getMyApplicationStatus = (job) => {
    if (!job?.appliedMembers || !user?.memberId) return null;
    const userIdStr = String(user.memberId).trim();

    const application = job.appliedMembers.find((app) => {
      const possibleIds = [
        app.memberId?._id,
        app.memberId,
        app.member?._id,
        app.member,
        app.userId?._id,
        app.userId,
        app.applicantId?._id,
        app.applicantId,
        app._id,
      ].filter((id) => id != null);

      return possibleIds.some((id) => String(id).trim() === userIdStr);
    });

    return application ? application.status || "Applied" : null;
  };

  const getPipelineStatus = (dbStatus) => {
    switch (dbStatus) {
      case "Applied":
        return "Submitted";
      case "Review":
        return "Review";
      case "Shortlisted":
        return "Interview";
      case "Offer":
        return "Offer";
      case "Accepted":
        return "Hired";
      case "Rejected":
        return "Rejected";
      default:
        return "Submitted";
    }
  };

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("uploads") || url.includes("\\")) {
      return `${BACKEND_URL}/${url.replace(/\\/g, "/")}`;
    }
    return url;
  };

  const hasDefaultResume = () => !!user?.resumeLink;

  const applyFilters = useCallback(
    (jobs) => {
      const search = globalFilter.trim().toLowerCase();

      const {
  jobId,
  title,
  companyName,
  role,
  employmentType,
  location,
  experience,
  salary,
  education,
  passedOutYear,
  keySkills,
  refereedBy,
  description,
  startDate,
  endDate,
  initialNumber,
  finalNumber,
} = filters;

      const titleFilter = title?.trim().toLowerCase() || "";
      const companyFilter = companyName?.trim().toLowerCase() || "";
      const roleFilter = role?.trim().toLowerCase() || "";
      const locationFilter = location?.trim().toLowerCase() || "";
      const experienceFilter = experience?.trim().toLowerCase() || "";
      const salaryFilter = salary?.trim().toLowerCase() || "";
      const educationFilter = education?.trim().toLowerCase() || "";
      const passoutFilter = passedOutYear?.trim().toLowerCase() || "";
      const keySkillsFilter = keySkills?.trim().toLowerCase() || "";
      const descriptionFilter = description?.trim().toLowerCase() || "";
      const refereedByFilter = refereedBy?.trim().toLowerCase() || "";
      const jobIdFilter = jobId?.trim().toLowerCase() || "";

      const toDate = (val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        return new Date(val);
      };

      const start = toDate(startDate);
      const end = toDate(endDate);

      return jobs.filter((job) => {
        if (search) {
          const haystack = [
  job.jobId,
  job.title,
  job.companyName,
  job.location,
  job.role,
  job.description,
  job.keySkills,
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();
          if (!haystack.includes(search)) return false;
        }

        if (jobIdFilter && !(job.jobId || "").toLowerCase().includes(jobIdFilter))
  return false;

        if (titleFilter && !(job.title || "").toLowerCase().includes(titleFilter))
          return false;
        if (
          companyFilter &&
          !(job.companyName || "").toLowerCase().includes(companyFilter)
        )
          return false;
        if (roleFilter && !(job.role || "").toLowerCase().includes(roleFilter))
          return false;
        if (
          locationFilter &&
          !(job.location || "").toLowerCase().includes(locationFilter)
        )
          return false;
        if (
          experienceFilter &&
          !(job.experience || "").toLowerCase().includes(experienceFilter)
        )
          return false;
        if (salaryFilter && !(job.salary || "").toLowerCase().includes(salaryFilter))
          return false;
        if (
          educationFilter &&
          !(job.education || "").toLowerCase().includes(educationFilter)
        )
          return false;
        if (
          passoutFilter &&
          !(String(job.passedOutYear || "")).toLowerCase().includes(passoutFilter)
        )
          return false;

        if (keySkillsFilter) {
          const jobSkills = (job.keySkills || "").toLowerCase();
          if (!jobSkills.includes(keySkillsFilter)) return false;
        }

        if (
          descriptionFilter &&
          !(job.description || "").toLowerCase().includes(descriptionFilter)
        )
          return false;

        if (employmentType && job.employmentType !== employmentType) return false;

        if (refereedByFilter) {
          const refName = (
            job.refereedBy?.name ||
            job.refereedBy?.email ||
            ""
          ).toLowerCase();
          if (!refName.includes(refereedByFilter)) return false;
        }

        if (start || end) {
          if (!job.createdAt) return false;
          const created = new Date(job.createdAt);
          if (start && created < start) return false;
          if (end && created > end) return false;
        }

        const applicantsCount = job.appliedMembers?.length || 0;
        if (initialNumber !== "" && initialNumber != null) {
          if (applicantsCount < Number(initialNumber)) return false;
        }
        if (finalNumber !== "" && finalNumber != null) {
          if (applicantsCount > Number(finalNumber)) return false;
        }

        return true;
      });
    },
    [filters, globalFilter]
  );

  const filteredJobPosts = useMemo(
    () => applyFilters(jobPosts),
    [jobPosts, applyFilters]
  );

  const filteredMyPost = useMemo(() => {
    if (view !== "myPost") return [];
    if (user?.role === "Admin") return applyFilters(jobPosts);

    if (!user) return [];
    const memberJobs = jobPosts.filter((job) => checkIsApplied(job, user?.memberId));
    return applyFilters(memberJobs);
  }, [view, jobPosts, user, applyFilters]);

  const jobIdOptions = useMemo(
  () => Array.from(new Set(jobPosts.map((j) => j.jobId).filter(Boolean))),
  [jobPosts]
);

  const paginatedJobs = useMemo(() => {
    const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
    return source.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);
  }, [view, filteredMyPost, filteredJobPosts, page]);

  useEffect(() => {
    const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
    const newTotalPages = Math.ceil(source.length / JOBS_PER_PAGE);
    setTotalPages(newTotalPages || 1);
    if (page > newTotalPages && newTotalPages > 0) setPage(1);
  }, [view, filteredMyPost, filteredJobPosts, page]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setGlobalFilter(value);
      setPage(1);
    }, 300),
    []
  );

  const handleSearchChange = (e) => debouncedSearch(e.target.value);

  const handleFilterChange = (name, value) => {
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
    setHasPendingChanges(true);
  };

  const applyPendingFilters = () => {
    const newFilters = { ...filters, ...pendingFilters };
    setFilters(newFilters);
    setPendingFilters({});
    setHasPendingChanges(false);
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
  jobId: "",
  title: "",
  companyName: "",
  role: "",
  employmentType: "",
  location: "",
  experience: "",
  salary: "",
  education: "",
  passedOutYear: "",
  keySkills: "",
  refereedBy: "",
  description: "",
  startDate: null,
  endDate: null,
  initialNumber: "",
  finalNumber: "",
});
    setPendingFilters({});
    setHasPendingChanges(false);
    setPage(1);
  };

  const getDisplayValue = (fieldName) => {
    if (pendingFilters[fieldName] !== undefined) return pendingFilters[fieldName];
    return filters[fieldName] || "";
  };

  const locationOptions = useMemo(
    () => Array.from(new Set(jobPosts.map((j) => j.location).filter(Boolean))),
    [jobPosts]
  );
  const titleOptions = useMemo(
    () => Array.from(new Set(jobPosts.map((j) => j.title).filter(Boolean))),
    [jobPosts]
  );
  const roleOptions = useMemo(
    () => Array.from(new Set(jobPosts.map((j) => j.role).filter(Boolean))),
    [jobPosts]
  );
  const companyOptions = useMemo(
    () => Array.from(new Set(jobPosts.map((j) => j.companyName).filter(Boolean))),
    [jobPosts]
  );
  const experienceOptions = useMemo(
    () => Array.from(new Set(jobPosts.map((j) => j.experience).filter(Boolean))),
    [jobPosts]
  );

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      height: "40px",
      fontSize: "13px",
      backgroundColor: isDarkTheme ? "#1e293b" : "#ffffff",
      borderColor: state.isFocused
        ? isDarkTheme
          ? "#6366f1"
          : "#4f46e5"
        : isDarkTheme
        ? "rgba(148, 163, 184, 0.25)"
        : "#d1d5db",
      borderRadius: "10px",
      boxShadow: state.isFocused
        ? isDarkTheme
          ? "0 0 0 2px rgba(99, 102, 241, 0.2)"
          : "0 0 0 2px rgba(79, 70, 229, 0.12)"
        : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? isDarkTheme
            ? "#6366f1"
            : "#4f46e5"
          : isDarkTheme
          ? "rgba(148, 163, 184, 0.4)"
          : "#9ca3af",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: "38px",
      padding: "0 10px",
    }),
    input: (base) => ({
      ...base,
      color: isDarkTheme ? "#e5e7eb" : "#111827",
      margin: 0,
      padding: 0,
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkTheme ? "#e5e7eb" : "#111827",
      fontWeight: 600,
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkTheme ? "rgba(148, 163, 184, 0.7)" : "#9ca3af",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "38px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDarkTheme ? "rgba(148, 163, 184, 0.7)" : "#6b7280",
      padding: "8px",
      "&:hover": {
        color: isDarkTheme ? "#e5e7eb" : "#374151",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: isDarkTheme ? "rgba(148, 163, 184, 0.7)" : "#6b7280",
      padding: "8px",
      "&:hover": {
        color: isDarkTheme ? "#f87171" : "#ef4444",
      },
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: isDarkTheme ? "#1e293b" : "#ffffff",
      border: isDarkTheme
        ? "1px solid rgba(148, 163, 184, 0.2)"
        : "1px solid #e5e7eb",
      borderRadius: "10px",
      boxShadow: isDarkTheme
        ? "0 10px 25px rgba(0, 0, 0, 0.3)"
        : "0 10px 25px rgba(0,0,0,0.10)",
      marginTop: "4px",
    }),
    menuList: (base) => ({
      ...base,
      padding: "8px 0",
      borderRadius: "10px",
      backgroundColor: isDarkTheme ? "#1e293b" : "#ffffff",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      fontWeight: 500,
      backgroundColor: state.isSelected
        ? isDarkTheme
          ? "rgba(99, 102, 241, 0.4)"
          : "#4f46e5"
        : state.isFocused
        ? isDarkTheme
          ? "rgba(99, 102, 241, 0.2)"
          : "#f3f4f6"
        : isDarkTheme
        ? "#1e293b"
        : "#ffffff",
      color: state.isSelected ? "white" : isDarkTheme ? "#e5e7eb" : "#111827",
      padding: "10px 12px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: state.isSelected
          ? isDarkTheme
            ? "rgba(99, 102, 241, 0.4)"
            : "#4f46e5"
          : isDarkTheme
          ? "rgba(99, 102, 241, 0.2)"
          : "#f3f4f6",
      },
    }),
  };

  const fetchJobPosts = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, fetching: true }));
      setError(null);

      const res = await API.get("/service");
      const allJobs = res.data.data;
      setJobPosts(allJobs);

      if (user) {
        if (user?.role === "Admin") setMyPost(allJobs);
        else setMyPost(allJobs.filter((job) => checkIsApplied(job, user?.memberId)));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Unable to load jobs. Please try again later.");
      if (jobContext?.length) setJobPosts(jobContext);
    } finally {
      setLoadingState((prev) => ({ ...prev, fetching: false }));
    }
  };

  useEffect(() => {
    fetchJobPosts();
  }, [user, jobContext]);

  const handleClick = (job) => navigate(`/jobs/${job._id}`);

  const buildJobsExportRows = () => {
    const source = view === "myPost" ? filteredMyPost : filteredJobPosts;
    return source.map((j) => ({
      JobID: j.jobId || "",
      JobTitle: j.title || "",
      CompanyName: j.companyName || "",
      EmploymentType: j.employmentType || "",
      Location: j.location || "",
      Role: j.role || "",
      Education: j.education || "",
      Experience: j.experience || "",
      Salary: j.salary || "",
      PassoutYear: j.passedOutYear || "",
      KeySkills: j.keySkills || "",
      RefereedBy: j.refereedBy?.name || "",
      Description: j.description || "",
      PostedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "",
      Applicants: j.appliedMembers?.length || 0,
    }));
  };

  const exportJobsToExcel = () => {
    const data = buildJobsExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jobs");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `Jobs_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportJobsToCSV = () => {
    const data = buildJobsExportRows();
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Jobs_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const handleDelete = async (jobId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this job post?")) return;

    try {
      setLoadingState((prev) => ({ ...prev, deleting: true }));
      await API.delete(`/service/${jobId}`);
      setJobPosts((prev) => prev.filter((job) => job._id !== jobId));
      setMyPost((prev) => prev.filter((job) => job._id !== jobId));
      alert("Job deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete job.");
    } finally {
      setLoadingState((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleEditClick = (e, job) => {
    e.stopPropagation();
    setEditingJob(job);
    setShowProvidedModal(true);
  };

  const renderAdminActionButtons = (request) => (
    <div
      className={styles.adminActions}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => handleEditClick(e, request)}
        title="Edit Post"
        className={styles.btnEdit}
        type="button"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={(e) => handleDelete(request._id, e)}
        title="Delete Post"
        className={styles.btnDelete}
        type="button"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const cloudName = "dwelwaavj";
    const uploadPreset = "jobbridge_preset";
    const api = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      setLoadingState((prev) => ({ ...prev, uploading: true }));
      const res = await axios.post(api, data);
      return res.data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Failed to upload file to cloud.");
    } finally {
      setLoadingState((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleApply = async (job, resumeFile = null, useExistingResume = false) => {
    try {
      setLoadingState((prev) => ({ ...prev, applying: true }));

      if (!user) {
        setSelectedJob(job);
        setShowGoogleLoginModal(true);
        return;
      }

      // Guard: new users without a completed profile cannot apply
      if (!user.memberId) {
        alert("Please complete your profile first before applying for jobs.");
        navigate("/profile-setup");
        return;
      }

      // Only show upload modal if no file AND not using the existing profile resume
      if (!resumeFile && !useExistingResume && (user?.role === "Member" || user?.role === "Candidate")) {
        setSelectedJob(job);
        setShowResumeModal(true);
        return;
      }

      let finalResumeLink = null;
      if (resumeFile) finalResumeLink = await uploadToCloudinary(resumeFile);

      await API.post(`/service/${job._id}/apply`, { resumeLink: finalResumeLink });

      alert("Applied successfully");
      fetchJobPosts();
      setShowResumeModal(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoadingState((prev) => ({ ...prev, applying: false }));
    }
  };

  const handleUploadAndApply = async (resumeFile) => {
    if (selectedJob) await handleApply(selectedJob, resumeFile);
  };

  const handleApplyClick = (e, job) => {
    e.stopPropagation();
    if (isApplied(job)) return;

    setSelectedJob(job);

    if (hasDefaultResume()) {
      // Show the nice choice modal instead of browser confirm()
      setShowResumeChoiceModal(true);
    } else {
      setShowResumeModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowProvidedModal(false);
    setEditingJob(null);
  };

  const handleUpdateProvided = async (jobData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const dataToSend = { ...jobData, refereedBy: jobData.refereedBy || null };

    try {
      const response = await API.patch(`/service/${editingJob._id}`, dataToSend);
      const updatedJob = response.data.data || response.data;

      setJobPosts((prev) =>
        prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
      setMyPost((prev) =>
        prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );

      alert("Job updated successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error updating Job:", error);
      alert("Failed to update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProvided = async (jobData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const dataToSend = { ...jobData, refereedBy: jobData.refereedBy || null };

    try {
      const response = await API.post("/service", dataToSend);
      const newJob = response.data.data || response.data;

      setJobPosts((prev) => [newJob, ...prev]);
      if (user?.role === "Admin") setMyPost((prev) => [newJob, ...prev]);

      handleCloseModal();
      alert("Job posted successfully!");
    } catch (error) {
      console.error("Error adding Job:", error);
      alert("Failed to save job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCSVUpload = (data) => {
    setBulkReviewJobs(data);
    setShowBulkReviewModal(true);
  };

  const handleSaveBulkJobs = (editedJobs) => {
    setBulkReviewJobs(editedJobs);
    alert(`Saved ${editedJobs.length} jobs. Ready to submit.`);
  };

  const handleSubmitBulkJobs = async (editedJobs) => {
    if (!editedJobs.length) return;

    setIsSubmitting(true);
    try {
      const jobsToSubmit = editedJobs.map((job) => ({
        ...job,
        refereedBy: job.refereedBy || null,
      }));
      const uploadPromises = jobsToSubmit.map((job) => API.post("/service", job));
      await Promise.all(uploadPromises);

      alert(`${editedJobs.length} jobs uploaded successfully!`);
      fetchJobPosts();
      setShowBulkReviewModal(false);
    } catch (error) {
      alert("Error during bulk upload. Some jobs may not have posted.");
      console.error(error);
      fetchJobPosts();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (data, isBulk = false) => {
    if (isBulk) handleBulkCSVUpload(data);
    else {
      if (editingJob) handleUpdateProvided(data);
      else handleAddProvided(data);
    }
  };

  const renderStatusBadge = (status) => {
    let stylesObj = {
      bg: "#e0f2fe",
      color: "#0369a1",
      icon: "📝",
      text: "Applied",
    };
    if (status === "Review")
      stylesObj = {
        bg: "#f3e8ff",
        color: "#7e22ce",
        icon: "🔍",
        text: "Under Review",
      };
    else if (status === "Shortlisted")
      stylesObj = {
        bg: "#fef3c7",
        color: "#d97706",
        icon: "⭐",
        text: "Shortlisted",
      };
    else if (status === "Offer")
      stylesObj = {
        bg: "#ccfbf1",
        color: "#0f766e",
        icon: "📄",
        text: "Offer Sent",
      };
    else if (status === "Accepted")
      stylesObj = {
        bg: "#dcfce7",
        color: "#166534",
        icon: "✅",
        text: "Accepted",
      };
    else if (status === "Rejected")
      stylesObj = {
        bg: "#fee2e2",
        color: "#991b1b",
        icon: "❌",
        text: "Rejected",
      };

    return (
      <div
        className={styles.statusBadge}
        style={{ backgroundColor: stylesObj.bg, color: stylesObj.color }}
      >
        <span>{stylesObj.icon}</span> <span>{stylesObj.text}</span>
      </div>
    );
  };

  const handleStatusChange = async (jobId, memberId, newStatus) => {
    try {
      await API.patch(`/service/status`, { jobId, memberId, status: newStatus });
      alert(`Status updated to ${newStatus}`);
      fetchJobPosts();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const totalJobs = view === "myPost" ? filteredMyPost.length : filteredJobPosts.length;
  const totalAllJobs = view === "myPost" ? myPost.length : jobPosts.length;

  return (
    <div className={styles.jobs}>
      <div
        ref={headerRef}
        className={classNames(styles.headerWrapper, {
          [styles.sidebarCollapsed]: sidebarCollapsed,
        })}
        style={{
          left: sidebarWidth + "px",
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        <div className={styles.topSearchBar}>
          <div className={styles.cardSearch}>
            <div className={styles.searchIcon}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search job ID, jobs, companies, or skills..."
              defaultValue={globalFilter || ""}
              onChange={handleSearchChange}
              aria-label="Search jobs"
            />
          </div>

          <div className={styles.searchActions}>
            <select
              className={styles.locationSelect}
              value={getDisplayValue("location") || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={styles.searchButton}
              onClick={applyPendingFilters}
            >
              Search Jobs
            </button>
          </div>

          <div className={styles.tabsContainer}>
            <div
              className={classNames(styles.tab, {
                [styles.active]: view === "request",
              })}
              onClick={() => setView("request")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setView("request")}
            >
              <div className={styles.tabIcon}>
                <NotebookPen size={22} />
              </div>
              <button type="button" className={styles.tabLabel}>
                Job Posts
              </button>
            </div>

            <div
              className={classNames(styles.tab, {
                [styles.active]: view === "myPost",
              })}
              onClick={() => setView("myPost")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setView("myPost")}
            >
              <div className={styles.tabIcon}>
                <BriefcaseBusiness size={22} />
              </div>
              <button type="button" className={styles.tabLabel}>
                {user?.role === "Admin" ? "Applicants" : "My Jobs"}
              </button>
            </div>
          </div>

          {user?.role === "Admin" && (
            <div className={styles.exportButtons}>
              <button
                onClick={exportJobsToExcel}
                className={styles.excelButton}
                type="button"
              >
                Export Excel
              </button>
              <button
                onClick={exportJobsToCSV}
                className={styles.csvButton}
                type="button"
              >
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={styles.headerSpacer}
        style={{ height: `${headerHeight}px` }}
      />

      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <XCircle size={20} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className={styles.closeError}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.filterActionRow}>
        <div className={styles.statsOverview}>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{totalJobs}</span>
            <span className={styles.miniStatLabel}>JOBS FOUND</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{totalAllJobs}</span>
            <span className={styles.miniStatLabel}>TOTAL JOBS</span>
          </div>
        </div>

        <button
          className={styles.toggleFiltersBtn}
          onClick={() => setShowFilters(!showFilters)}
          type="button"
        >
          {showFilters ? (
            <>
              <EyeOff size={18} /> Hide Filters
            </>
          ) : (
            <>
              <Filter size={18} /> Show Filters
            </>
          )}
        </button>
      </div>

      <div
        className={classNames(styles.pageBody, {
          [styles.filtersCollapsed]: !showFilters,
        })}
      >
        {showFilters && (
          <aside className={styles.filtersSidebar}>
            <div className={styles.filtersHeader}>
              <h3 className={styles.filtersTitle}>
                <Filter size={18} /> Filters
              </h3>

              <button
                type="button"
                className={styles.clearAllSmall}
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>

            <div className={styles.sidebarField}>
  <label className={styles.sidebarLabel}>JOB ID</label>
  <Select
    options={[
      { value: "", label: "All Job IDs" },
      ...jobIdOptions.map((id) => ({ value: id, label: id })),
    ]}
    value={
      getDisplayValue("jobId")
        ? {
            value: getDisplayValue("jobId"),
            label: getDisplayValue("jobId"),
          }
        : { value: "", label: "All Job IDs" }
    }
    onChange={(selected) =>
      handleFilterChange("jobId", selected?.value || "")
    }
    isSearchable
    isClearable
    placeholder="All Job IDs"
    styles={customSelectStyles}
    className={styles.reactSelect}
    menuPortalTarget={document.body}
    menuPosition="fixed"
  />
</div>

            <div className={styles.sidebarField}>
              <label className={styles.sidebarLabel}>JOB TITLE</label>
              <Select
                options={[
                  { value: "", label: "All Titles" },
                  ...titleOptions.map((t) => ({ value: t, label: t })),
                ]}
                value={
                  getDisplayValue("title")
                    ? {
                        value: getDisplayValue("title"),
                        label: getDisplayValue("title"),
                      }
                    : { value: "", label: "All Titles" }
                }
                onChange={(selected) =>
                  handleFilterChange("title", selected?.value || "")
                }
                isSearchable
                isClearable
                placeholder="All Titles"
                styles={customSelectStyles}
                className={styles.reactSelect}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className={styles.sidebarField}>
              <label className={styles.sidebarLabel}>COMPANY</label>
              <Select
                options={[
                  { value: "", label: "All Companies" },
                  ...companyOptions.map((c) => ({ value: c, label: c })),
                ]}
                value={
                  getDisplayValue("companyName")
                    ? {
                        value: getDisplayValue("companyName"),
                        label: getDisplayValue("companyName"),
                      }
                    : { value: "", label: "All Companies" }
                }
                onChange={(selected) =>
                  handleFilterChange("companyName", selected?.value || "")
                }
                isSearchable
                isClearable
                placeholder="All Companies"
                styles={customSelectStyles}
                className={styles.reactSelect}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className={styles.sidebarField}>
              <label className={styles.sidebarLabel}>JOB ROLE</label>
              <Select
                options={[
                  { value: "", label: "All Roles" },
                  ...roleOptions.map((r) => ({ value: r, label: r })),
                ]}
                value={
                  getDisplayValue("role")
                    ? {
                        value: getDisplayValue("role"),
                        label: getDisplayValue("role"),
                      }
                    : { value: "", label: "All Roles" }
                }
                onChange={(selected) =>
                  handleFilterChange("role", selected?.value || "")
                }
                isSearchable
                isClearable
                placeholder="All Roles"
                styles={customSelectStyles}
                className={styles.reactSelect}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className={styles.sidebarField}>
              <label className={styles.sidebarLabel}>EMPLOYMENT TYPE</label>
              <div className={styles.radioGroup}>
                <label className={styles.checkRow}>
                  <input
                    type="radio"
                    name="employmentType"
                    checked={(getDisplayValue("employmentType") || "") === ""}
                    onChange={() => handleFilterChange("employmentType", "")}
                  />
                  <span>All Types</span>
                </label>
                {EMPLOYMENT_TYPES.map((t) => (
                  <label key={t} className={styles.checkRow}>
                    <input
                      type="radio"
                      name="employmentType"
                      checked={(getDisplayValue("employmentType") || "") === t}
                      onChange={() => handleFilterChange("employmentType", t)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.sidebarField}>
              <label className={styles.sidebarLabel}>EXPERIENCE</label>
              <Select
                options={[
                  { value: "", label: "All Experience" },
                  ...experienceOptions.map((e) => ({ value: e, label: e })),
                ]}
                value={
                  getDisplayValue("experience")
                    ? {
                        value: getDisplayValue("experience"),
                        label: getDisplayValue("experience"),
                      }
                    : { value: "", label: "All Experience" }
                }
                onChange={(selected) =>
                  handleFilterChange("experience", selected?.value || "")
                }
                isSearchable
                isClearable
                placeholder="All Experience"
                styles={customSelectStyles}
                className={styles.reactSelect}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className={styles.sidebarActions}>
              <button
                type="button"
                className={styles.applySidebarFilters}
                disabled={!hasPendingChanges}
                onClick={applyPendingFilters}
              >
                Apply Filters
              </button>
            </div>
          </aside>
        )}

        <main className={styles.mainContent}>
          <div className={styles.paginationTop}>
            <button
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page === 1 || loadingState.fetching}
              type="button"
              className={styles.paginationButton}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className={styles.pageInfo}>
              Page <span className={styles.currentPage}>{page}</span> of{" "}
              {totalPages}
            </span>
            <button
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages || loadingState.fetching}
              type="button"
              className={styles.paginationButton}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {loadingState.fetching ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading jobs...</p>
            </div>
          ) : (
            <>
              {view === "request" && (
                <div className={styles.jobsList}>
                  <h2 className={styles.sectionTitle}>
                    <NotebookPen size={24} /> Available Job Posts
                  </h2>

                  {paginatedJobs.length === 0 ? (
                    <div className={styles.noResults}>
                      <div className={styles.noResultsIcon}>🔍</div>
                      <h3>No jobs found</h3>
                      <p>Try adjusting your filters or search terms</p>
                      <button
                        onClick={clearAllFilters}
                        className={styles.clearFiltersButton}
                        type="button"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  ) : (
                    paginatedJobs.map((job) => (
                      <div
                        key={job._id}
                        className={styles.jobRow}
                        onClick={() => handleClick(job)}
                      >
                        <div className={styles.jobRowTop}>
                          <div className={styles.jobRowTitle}>
                            <div className={styles.avatarCircle}>
                              {(job.title || "J").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <h3 style={{ margin: 0 }}>{job.title}</h3>
                                {job.jobId && (
                                  <span style={{
                                    fontSize: 11,
                                    fontWeight: 900,
                                    backgroundColor: "#e0f2fe",
                                    color: "#0369a1",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    whiteSpace: "nowrap"
                                  }}>
                                    ID: {job.jobId}
                                  </span>
                                )}
                              </div>
                              <div className={styles.jobRowSub}>
                                <span>
                                  <Building size={14} />{" "}
                                  {job.companyName || "Company"}
                                </span>
                                {job.location && (
                                  <span>
                                    <MapPin size={14} /> {job.location}
                                  </span>
                                )}
                                {job.experience && (
                                  <span>
                                    <TrendingUp size={14} /> {job.experience}
                                  </span>
                                )}
                                {job.salary && (
                                  <span>
                                    <DollarSign size={14} /> {job.salary}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.jobRowRightBadges}>
                            {job?.refereedBy && (
                              <span className={styles.referredPill}>
                                <User size={14} /> Referred
                              </span>
                            )}
                            {job?.jobPosted && (
                              <span className={styles.referredPill} style={{ backgroundColor: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', fontWeight: '600' }}>
                                <User size={14} /> Recruited By: {job.jobPosted?.fullName || "Recruiter"}
                              </span>
                            )}
                          </div>
                        </div>

                        {job.keySkills && (
                          <div className={styles.jobRowSkills}>
                            {job.keySkills
                              .split(",")
                              .slice(0, 8)
                              .map((skill, i) => (
                                <span key={i} className={styles.skillTag}>
                                  {skill.trim()}
                                </span>
                              ))}
                          </div>
                        )}

                        <div className={styles.jobRowFooter}>
                          <div className={styles.jobRowTime}>
                            <Calendar size={14} />
                            <span>
                              {job.createdAt && !isNaN(new Date(job.createdAt))
                                ? `${new Date(job.createdAt).toLocaleDateString()} • ${formatDistanceToNow(
                                    new Date(job.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}`
                                : "Just Now"}
                            </span>
                          </div>

                          <div
                            className={styles.jobRowActions}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(user?.role === "Member" ||
                              user?.role === "Candidate" ||
                              !user) && (
                              <ApplyButton
                                job={job}
                                user={user}
                                isApplied={isApplied(job)}
                                onApplyClick={handleApplyClick}
                                loadingState={loadingState}
                                onGoogleLogin={handleGoogleLogin}
                              />
                            )}

                            <button
                              className={styles.viewDetailsBtn}
                              type="button"
                              onClick={() => handleClick(job)}
                            >
                              View Details
                            </button>

                            {user?.role === "Admin" &&
                              renderAdminActionButtons(job)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {view === "myPost" && (
                <div className={styles.jobsContainer}>
                  <h2 className={styles.sectionTitle}>
                    {user?.role === "Admin" ? (
                      <>
                        <BriefcaseBusiness size={24} /> Manage Applications
                      </>
                    ) : (
                      <>
                        <Star size={24} /> My Applications
                      </>
                    )}
                  </h2>

                  {filteredMyPost.length === 0 ? (
                    <div className={styles.noResults}>
                      <div className={styles.noResultsIcon}>
                        {user?.role === "Admin" ? "📭" : "📋"}
                      </div>
                      <h3>
                        {user?.role === "Admin"
                          ? "No jobs posted yet"
                          : "You haven't applied to any jobs yet"}
                      </h3>
                      <p>
                        {user?.role === "Admin"
                          ? "Create your first job post to get started"
                          : "Browse jobs and apply to get started"}
                      </p>
                      {user?.role === "Admin" && (
                        <button
                          onClick={() => {
                            setEditingJob(null);
                            setShowProvidedModal(true);
                          }}
                          className={styles.createJobButton}
                          type="button"
                        >
                          <Plus size={16} /> Create Job Post
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={styles.jobsGrid}>
                      {paginatedJobs.map((request) => {
                        const myStatus = getMyApplicationStatus(request);
                        const pipelineStatus = getPipelineStatus(myStatus);

                        return (
                          <div key={request._id} className={styles.myJobCard}>
                            <div className={styles.myJobCardHeader}>
                              <div
                                className={styles.myJobCardContent}
                                onClick={() => handleClick(request)}
                              >
                                <div className={styles.myJobCardTitle}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                    <h3 style={{ margin: 0 }}>{request.title}</h3>
                                    {request.jobId && (
                                      <span style={{
                                        fontSize: 11,
                                        fontWeight: 900,
                                        backgroundColor: "#e0f2fe",
                                        color: "#0369a1",
                                        padding: "3px 8px",
                                        borderRadius: 4,
                                        whiteSpace: "nowrap"
                                      }}>
                                        ID: {request.jobId}
                                      </span>
                                    )}
                                  </div>
                                  <div className={styles.myJobCardMeta}>
                                    {request?.companyName && (
                                      <span className={styles.companyName}>
                                        <Building size={14} />{" "}
                                        {request.companyName}
                                      </span>
                                    )}
                                    {request?.location && (
                                      <span className={styles.location}>
                                        <MapPin size={14} /> {request.location}
                                      </span>
                                    )}
                                    {request?.employmentType && (
                                      <span className={styles.jobType}>
                                        {request.employmentType}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.myJobCardDate}>
                                  <Calendar size={12} />
                                  <span>
                                    Posted on:{" "}
                                    {new Date(request.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {user?.role === "Admin" &&
                                renderAdminActionButtons(request)}
                            </div>

                            {(user?.role === "Member" ||
                              user?.role === "Candidate") &&
                              myStatus && (
                                <div className={styles.applicationPipeline}>
                                  {myStatus === "Rejected" ? (
                                    <div className={styles.rejectedStatus}>
                                      <XCircle size={20} />
                                      <div>
                                        <h4>Application Rejected</h4>
                                        <p>
                                          Unfortunately, your application was not
                                          selected for this position.
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className={styles.pipelineHeader}>
                                        <h4>Application Status</h4>
                                        <div
                                          className={styles.currentStatusBadge}
                                        >
                                          {renderStatusBadge(myStatus)}
                                        </div>
                                      </div>
                                      <EnhancedStatusPipeline
                                        status={pipelineStatus}
                                      />
                                    </>
                                  )}
                                </div>
                              )}

                            {user?.role === "Admin" && (
                              <div className={styles.applicantsSection}>
                                <div className={styles.applicantsHeader}>
                                  <h4>
                                    <Users size={16} /> Applicants (
                                    {request.appliedMembers?.length || 0})
                                  </h4>
                                  <span className={styles.applicantsCount}>
                                    {request.appliedMembers?.length || 0} total
                                  </span>
                                </div>

                                {request.appliedMembers?.length > 0 ? (
                                  <div className={styles.applicantsTable}>
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>Name</th>
                                          <th>Resume</th>
                                          <th>Status</th>
                                          <th>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {request.appliedMembers.map((app, idx) => (
                                          <tr key={idx}>
                                            <td className={styles.applicantName}>
                                              {app.memberId?.name ||
                                                "Unknown Applicant"}
                                            </td>
                                            <td className={styles.applicantResume}>
                                              {app.resumeLink ||
                                              app.memberId?.resumeLink ? (
                                                <a
                                                  href={getFileUrl(
                                                    app.resumeLink ||
                                                      app.memberId.resumeLink
                                                  )}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className={styles.resumeLink}
                                                >
                                                  <FileText size={16} /> View Resume
                                                </a>
                                              ) : (
                                                <span className={styles.noResume}>
                                                  No Resume
                                                </span>
                                              )}
                                            </td>
                                            <td className={styles.applicantStatus}>
                                              {renderStatusBadge(
                                                app.status || "Applied"
                                              )}
                                            </td>
                                            <td className={styles.applicantActions}>
                                              <select
                                                className={styles.statusSelect}
                                                value={app.status || "Applied"}
                                                onChange={(e) =>
                                                  handleStatusChange(
                                                    request._id,
                                                    app.memberId?._id,
                                                    e.target.value
                                                  )
                                                }
                                              >
                                                <option value="Applied">
                                                  Applied
                                                </option>
                                                <option value="Review">
                                                  Review
                                                </option>
                                                <option value="Shortlisted">
                                                  Shortlisted
                                                </option>
                                                <option value="Offer">Offer</option>
                                                <option value="Accepted">
                                                  Accepted
                                                </option>
                                                <option value="Rejected">
                                                  Rejected
                                                </option>
                                              </select>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className={styles.noApplicants}>
                                    <Users size={24} />
                                    <p>
                                      No applicants yet. Share this job to get
                                      applications!
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {user?.role === "Admin" && (
        <button
          className={styles.floatingAddButton}
          onClick={() => {
            setEditingJob(null);
            setShowProvidedModal(true);
          }}
          disabled={loadingState.fetching}
          aria-label="Add new job"
          type="button"
        >
          <Plus size={24} />
        </button>
      )}

      <ProvidedForm
        isOpen={showProvidedModal}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editingJob}
      />

      <BulkCSVReviewModal
        isOpen={showBulkReviewModal}
        onClose={() => setShowBulkReviewModal(false)}
        jobsData={bulkReviewJobs}
        onSave={handleSaveBulkJobs}
        onBulkSubmit={handleSubmitBulkJobs}
        refereesList={refereesList}
        recruitersList={recruitersList}
      />

      <ResumeChoiceModal
        isOpen={showResumeChoiceModal}
        onClose={() => setShowResumeChoiceModal(false)}
        jobTitle={selectedJob?.title}
        existingResumeUrl={user?.resumeLink}
        isDarkTheme={isDarkTheme}
        onUseExisting={() => {
          setShowResumeChoiceModal(false);
          handleApply(selectedJob, null, true); // useExistingResume = true → skips upload guard
        }}
        onUploadNew={() => {
          setShowResumeChoiceModal(false);
          setShowResumeModal(true);
        }}
      />

      <ResumeUploadModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onUpload={handleUploadAndApply}
        jobTitle={selectedJob?.title}
        user={user}
        onGoogleLogin={handleGoogleLogin}
      />

      {showGoogleLoginModal && (
        <div className={styles.googleLoginModal}>
          <div className={styles.googleLoginContent}>
            <div className={styles.googleLoginHeader}>
              <h3>Login Required</h3>
              <button
                onClick={() => setShowGoogleLoginModal(false)}
                className={styles.closeGoogleLogin}
                aria-label="Close"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <p>Please login to apply for this position</p>

            <div className={styles.googleLoginOptions}>
              <GoogleLoginButton
                onLoginSuccess={() => {
                  setShowGoogleLoginModal(false);
                  if (selectedJob)
                    handleApplyClick({ stopPropagation: () => {} }, selectedJob);
                }}
              />

              <button
                className={styles.googleLoginCancel}
                onClick={() => setShowGoogleLoginModal(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className={styles.submittingOverlay}>
          <div className={styles.submittingContent}>
            <div className={styles.submittingSpinner}></div>
            <span>Processing data, please wait...</span>
          </div>
        </div>
      )}
    </div>
  );
}

Jobs.propTypes = {};

export default Jobs;