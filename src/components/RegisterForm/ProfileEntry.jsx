// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// //import "./ProfileEntry.scss"; // We will create this style file next

// const ProfileEntry = () => {
//   const navigate = useNavigate();

//   // State to hold the form data
//   const [formData, setFormData] = useState({
//     name: "",
//     age: "",
//     phone: "",
//     email: "",
//     location: "", // Replaces "Community Issue" to match your dashboard
//     role: "Job Seeker" // Default role
//   });

//   // Handle typing in inputs
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle Form Submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch("http://localhost:5000/api/user/add-member", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert("Profile Created Successfully!");
//         navigate("/members"); // Go back to dashboard after saving
//       } else {
//         alert("Error: " + data.message);
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Failed to connect to server.");
//     }
//   };

//   return (
//     <div className="profile-entry-page">
//       <div className="form-container">
//         {/* Header Section */}
//         <h2 className="form-title">New Member Registration</h2>
//         <p className="form-subtitle">Enter the details to create a new profile</p>

//         <form onSubmit={handleSubmit}>
          
//           {/* Name Field */}
//           <div className="form-group">
//             <label>Name:</label>
//             <input 
//               type="text" 
//               name="name" 
//               value={formData.name} 
//               onChange={handleChange} 
//               required 
//             />
//           </div>

//           {/* Age Field */}
//           <div className="form-group">
//             <label>Age:</label>
//             <input 
//               type="number" 
//               name="age" 
//               value={formData.age} 
//               onChange={handleChange} 
//               required 
//             />
//           </div>

//           {/* Phone Field */}
//           <div className="form-group">
//             <label>Phone Number:</label>
//             <input 
//               type="tel" 
//               name="phone" 
//               value={formData.phone} 
//               onChange={handleChange} 
//               required 
//             />
//           </div>

//           {/* Email Field */}
//           <div className="form-group">
//             <label>Email:</label>
//             <input 
//               type="email" 
//               name="email" 
//               value={formData.email} 
//               onChange={handleChange} 
//               required 
//             />
//           </div>

//           {/* Location / District Field */}
//           <div className="form-group">
//             <label>Location (District):</label>
//             <input 
//               type="text" 
//               name="location" 
//               value={formData.location} 
//               onChange={handleChange} 
//               placeholder="e.g. Bangalore"
//               required 
//             />
//           </div>

//           {/* Role Dropdown (Optional) */}
//           <div className="form-group">
//             <label>Role:</label>
//             <select name="role" value={formData.role} onChange={handleChange}>
//               <option value="Job Seeker">Job Seeker</option>
//               <option value="Recruiter">Recruiter</option>
//             </select>
//           </div>

//           {/* Submit Button */}
//           <button type="submit" className="submit-btn">Register Member</button>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProfileEntry;