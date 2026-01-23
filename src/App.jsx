// //-----------------19/01---------------------------------5.20--------------------

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { GoogleOAuthProvider } from "@react-oauth/google";

// import './styles/global.scss';
// import Layout from './components/Layout/Layout';
// import Dashboard from './pages/Dashboard/Dashboard';
// import Members from './pages/Members/Members';
// import MembersDetail from './pages/Members/MembersDetail';
// import PrivateRoute from './PrivateRoute';
// import LoginForm from './LoginForm';
// import Unauthorized from './pages/Unauthorized/Unauthorized';
// import NotFound from './pages/NotFound/NotFound';
// import UserList from './pages/CreateUser/UserList';
// import InstallPopup from './components/UI/InstallPopup';

// import GoogleLogin from './components/Google/GoogleLogin';
// import CandidateForm from './components/Google/CandidateForm';
// import CandidateDashboard from './pages/CandidateDashboard/CandidateDashboard';
// import Jobs from './pages/Jobs/Jobs';
// import JobDetail from "./pages/Jobs/JobDetail";
// import RefereePage from './pages/Referees/RefereePage';
// import MentorsPage from './pages/Mentor/MentorsPage';

// function App() {
//   return (
//     <>
//       <Router>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/google-login" element={<GoogleLogin />} />
//           <Route path="/candidate-form" element={<CandidateForm />} />
//           <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

//           {/* Protected Routes (Wrapped in Layout) */}
//           <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
//             <Route index element={<Dashboard />} />
            
//             {/* Admin & IT Member Routes */}
//             <Route path="members" element={<PrivateRoute roles={['Admin', 'IT_Member']}><Members /></PrivateRoute>} />
//             <Route path="member/:id" element={<PrivateRoute roles={['Admin', 'IT_Member', 'Member']}><MembersDetail /></PrivateRoute>} />
//             <Route path="createUser" element={<PrivateRoute roles={['Admin']}><UserList /></PrivateRoute>} />
            
//             {/* General Routes */}
//             <Route path="mentors" element={<MentorsPage />} />
//             <Route path="referees" element={<RefereePage />} />
//             <Route path="jobs" element={<Jobs />} />
//             <Route path="jobs/:id" element={<JobDetail />} />

//             {/* Error Pages */}
//             <Route path="unauthorized" element={<Unauthorized />} />
//             <Route path="*" element={<NotFound />} />
//           </Route>
//         </Routes>
//       </Router>
//       <InstallPopup />
//     </>
//   );
// }

// export default App;

//-----------------19/01---------------------------------5.20--------------------

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";

import './styles/global.scss';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Members from './pages/Members/Members';
import MembersDetail from './pages/Members/MembersDetail';
import PrivateRoute from './PrivateRoute';
import LoginForm from './LoginForm';
import Unauthorized from './pages/Unauthorized/Unauthorized';
import NotFound from './pages/NotFound/NotFound';
import UserList from './pages/CreateUser/UserList';
import InstallPopup from './components/UI/InstallPopup';

import GoogleLogin from './components/Google/GoogleLogin';
import CandidateForm from './components/Google/CandidateForm';
import CandidateDashboard from './pages/CandidateDashboard/CandidateDashboard';
import Jobs from './pages/Jobs/Jobs';
import JobDetail from "./pages/Jobs/JobDetail";
import RefereePage from './pages/Referees/RefereePage';
import RefereeDetailsPage from './pages/Referees/RefereeDetailsPage'; // Add this import
import MentorsPage from './pages/Mentor/MentorsPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/google-login" element={<GoogleLogin />} />
          <Route path="/candidate-form" element={<CandidateForm />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

          {/* Protected Routes (Wrapped in Layout) */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Admin & IT Member Routes */}
            <Route path="members" element={<PrivateRoute roles={['Admin', 'IT_Member']}><Members /></PrivateRoute>} />
            <Route path="member/:id" element={<PrivateRoute roles={['Admin', 'IT_Member', 'Member']}><MembersDetail /></PrivateRoute>} />
            <Route path="createUser" element={<PrivateRoute roles={['Admin']}><UserList /></PrivateRoute>} />
            
            {/* General Routes */}
            <Route path="mentors" element={<MentorsPage />} />
            
            {/* Referee Routes */}
            <Route path="referees" element={<RefereePage />} />
            <Route path="referee/:id" element={<RefereeDetailsPage />} /> {/* Add this route */}
            
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />

            {/* Error Pages */}
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <InstallPopup />
    </>
  );
}

export default App;