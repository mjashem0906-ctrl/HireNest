// import React, { useState } from 'react';
// import '../RegisterForm/JobBridgeForm.scss'; 
// import API from "../../axios";// <--- 1. Import your Axios instance

// const JobBridgeForm = () => {
//   // YOUR GOOGLE SCRIPT URL
//   const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxmk-t9k45sdi1IQica38Ht8k-iUDDiyfU1rsADvrzsZpbmZ4rsF-Qz1G94yb-wtWsHSw/exec";

//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     age: '',
//     phone: '',
//     email: '',
//     jobRole: '',
//     location: '',
//     timeline: '',
//     fileName: '',
//     fileType: '',
//     fileData: '' // Base64 string
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const getBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result.split(',')[1]);
//       reader.onerror = error => reject(error);
//     });
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       try {
//         const base64 = await getBase64(file);
//         setFormData({
//           ...formData,
//           fileName: file.name,
//           fileType: file.type,
//           fileData: base64
//         });
//       } catch (error) {
//         console.error("Error converting file", error);
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // --- STEP 1: Send to Google Sheets ---
//       console.log("Sending to Google Sheets...");
//       await fetch(SCRIPT_URL, {
//         method: "POST",
//         body: JSON.stringify(formData)
//       });

//       // --- STEP 2: Send to Your Database ---
//       console.log("Sending to Database...");
//       // Make sure this route exists in your Node.js backend!
//       await API.post('/api/candidates/web-register', formData);

//       alert("Application Submitted Successfully to both System and Excel!");
      
//       // Reset form
//       setFormData({
//         name: '', age: '', phone: '', email: '', 
//         jobRole: '', location: '', timeline: '', 
//         fileName: '', fileType: '', fileData: ''
//       });

//     } catch (error) {
//       console.error("Error submitting form!", error);
//       alert("Submission failed. Check console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="form-container">
//       <div className="form-card">
//         <div className="form-header">
//           <h1>JOB Bridge Karnataka</h1>
//           <p>Candidate Registration & Resume Upload</p>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           {/* ... inputs same as before ... */}
          
//           <div className="form-group">
//             <label>Full Name</label>
//             <input 
//               type="text" name="name" className="form-input" 
//               placeholder="Enter your full name" required 
//               value={formData.name} onChange={handleChange}
//             />
//           </div>

//           <div className="form-group row">
//             <div className="col">
//               <label>Age</label>
//               <input 
//                 type="number" name="age" className="form-input" 
//                 placeholder="Age" required 
//                 value={formData.age} onChange={handleChange}
//               />
//             </div>
//             <div className="col">
//               <label>Phone Number</label>
//               <input 
//                 type="tel" name="phone" className="form-input" 
//                 placeholder="+91..." required 
//                 value={formData.phone} onChange={handleChange}
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Email Address</label>
//             <input 
//               type="email" name="email" className="form-input" 
//               placeholder="you@example.com" required 
//               value={formData.email} onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <label>Job Role / Key Skills</label>
//             <textarea 
//               name="jobRole" className="form-textarea" rows="3"
//               placeholder="e.g., React Developer, Data Entry..." required
//               value={formData.jobRole} onChange={handleChange}
//             ></textarea>
//           </div>

//           <div className="form-group row">
//             <div className="col">
//               <label>Current Location</label>
//               <input 
//                 type="text" name="location" className="form-input" 
//                 placeholder="City/Town" required 
//                 value={formData.location} onChange={handleChange}
//               />
//             </div>
//             <div className="col">
//               <label>Availability</label>
//               <input 
//                 type="text" name="timeline" className="form-input" 
//                 placeholder="e.g. Immediate" 
//                 value={formData.timeline} onChange={handleChange}
//               />
//             </div>
//           </div>

//           <div className="form-group file-upload-wrapper">
//             <label style={{marginBottom: '10px', display: 'block'}}>Upload Resume / CV</label>
//             <input 
//               type="file" 
//               onChange={handleFileChange}
//               accept=".pdf,.doc,.docx,.jpg,.png"
//             />
//           </div>

//           <button type="submit" className="submit-btn" disabled={loading}>
//             {loading ? "Submitting Application..." : "Submit Application"}
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default JobBridgeForm;