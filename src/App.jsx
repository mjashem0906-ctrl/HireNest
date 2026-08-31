import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";

import './styles/global.scss';
import { initializeGlobalEffects } from './utils/globalEffects';
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
import OAuthSuccess from './OAuthSuccess';
import ProfileSetup from './pages/ProfileSetup/ProfileSetup';
import Jobs from './pages/Jobs/Jobs';
import JobDetail from "./pages/Jobs/JobDetail";
import RefereePage from './pages/Referees/RefereePage';
import RefereeDetailsPage from './pages/Referees/RefereeDetailsPage';

// ✅ Mentors
import MentorsPage from './pages/Mentor/MentorsPage';
import MentorDetails from './pages/Mentor/MentorDetails';
import MentorConnectionsAdmin from './pages/Mentor/MentorConnectionsAdmin';

// ✅ Recruiters
import RecruitersPage from './pages/Recruiter/RecruitersPage';
import RecruiterDetail from './pages/Recruiter/RecruiterDetail';
import AddRecruiterPage from './pages/Recruiter/AddRecruiterPage';
import Settings from './pages/Settings/Settings';

// ✅ Job Seekers
import JobSeekersPage from './pages/JobSeeker/JobSeekersPage';
import { recordPortalVisit } from './utils/portalAnalytics';

function App() {

  // ✅ THIS IS THE FIX (DARK THEME ACTIVATION) & GLOBAL EFFECTS INJECTION
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    initializeGlobalEffects();
    recordPortalVisit();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/google-login" element={<GoogleLogin />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/candidate-form" element={<CandidateForm />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

          {/* Add Recruiter — public bare page (no login required, no header/sidebar) */}
          <Route path="/recruiters/add" element={<AddRecruiterPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />

            <Route
              path="members"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member']}>
                  <Members />
                </PrivateRoute>
              }
            />

            <Route
              path="job-seekers"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member']}>
                  <JobSeekersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="member/:id"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member', 'Member', 'Mentor', 'Job', 'Candidate']}>
                  <MembersDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="createUser"
              element={
                <PrivateRoute roles={['Admin']}>
                  <UserList />
                </PrivateRoute>
              }
            />

            {/* Mentors */}
            <Route
              path="mentors"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member', 'Member', 'Candidate', 'Job', 'Mentor']}>
                  <MentorsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="mentors/:id"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member', 'Member', 'Candidate', 'Job', 'Mentor']}>
                  <MentorDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="mentor-connections"
              element={
                <PrivateRoute roles={['Admin']}>
                  <MentorConnectionsAdmin />
                </PrivateRoute>
              }
            />

            {/* Recruiters */}
            <Route
              path="recruiters"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member', 'Member', 'Job', 'Candidate']}>
                  <RecruitersPage />
                </PrivateRoute>
              }
            />
            {/* Static route — must be BEFORE recruiters/:id so it always wins */}
            <Route path="recruiters/add" element={<AddRecruiterPage />} />
            <Route
              path="recruiters/:id"
              element={
                <PrivateRoute roles={['Admin', 'IT_Member', 'Member', 'Job', 'Candidate']}>
                  <RecruiterDetail />
                </PrivateRoute>
              }
            />

            {/* Referee */}
            <Route path="referees" element={<RefereePage />} />
            <Route path="referee/:id" element={<RefereeDetailsPage />} />

            {/* Jobs */}
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />

            {/* Settings */}
            <Route
              path="settings"
              element={
                <PrivateRoute roles={['Admin']}>
                  <Settings />
                </PrivateRoute>
              }
            />

            {/* Errors */}
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