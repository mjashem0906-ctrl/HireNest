import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import  './styles/global.scss'
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
// import Projects from './pages/Projects/Projects';
// import Tasks from './pages/Tasks/Tasks';
// import Subtasks from './pages/Subtasks/Subtasks';
// import Settings from './pages/Settings/Settings';
import Members from './pages/Members/Members';
import MembersDetail from './pages/Members/MembersDetail';
// import AssignFor from './pages/AssignFor/AssignFor';
// import ProjectDetail from './pages/Projects/ProjectDetail';
// import TaskDetail from './pages/Tasks/TaskDetail';
// import SubtaskDetail from './pages/Subtasks/SubtaskDetail';
// import AssignForDetail from './pages/AssignFor/AssignForDetail';
import PrivateRoute from './PrivateRoute';
import LoginForm from './LoginForm';
// import StatusRequests from './pages/StatusRequest/StatusRequests';
// import MembersWorking from './pages/Members_Working/MembersWorking';
 import Unauthorized from './pages/Unauthorized/Unauthorized';
import NotFound from './pages/NotFound/NotFound';
// import ActivityList from './pages/ActivityList/ActivityList';
import UserList from './pages/CreateUser/UserList';
// import MemberComments from './pages/MemberComments/MemberComments';
import InstallPopup from './components/UI/InstallPopup';

import GoogleLogin from './components/Google/GoogleLogin'; // We'll create this next
import CandidateForm from './components/Google/CandidateForm';
import CandidateDashboard from './pages/CandidateDashboard/CandidateDashboard';
import Jobs from './pages/Jobs/Jobs';
import JobDetail from "./pages/Jobs/JobDetail";

function App() {
  return (
    <>
       <Router>
       
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            {/* Add Google Login route */}
            <Route path="/google-login" element={<GoogleLogin />} />
            {/* Add Candidate Form route - should be accessible after Google login */}
            <Route path="/candidate-form" element={<CandidateForm />} />
            {/* Add Candidate Dashboard route */}
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

            <Route path="/" element={<PrivateRoute> <Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            {/* <Route path="status-requests" element={<PrivateRoute roles={['Admin']}><StatusRequests /></PrivateRoute>} /> */}
            {/* <Route path="membersWorking" element={<PrivateRoute roles={['Admin']}><MembersWorking /></PrivateRoute> }/> */}
            <Route path="members" element={<PrivateRoute roles={['Admin', 'IT_Member']}><Members /></PrivateRoute> }/>
            {/* <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="subtasks" element={<Subtasks />} />
            <Route path="assignFor" element={<AssignFor />} /> */}
            <Route path="jobs" element={<Jobs/>} /> 
            <Route path="/jobs/:id" element={<JobDetail />} />

            <Route path="createUser" element={<PrivateRoute roles={['Admin']}><UserList /> </PrivateRoute>} />
            {/* <Route path="settings" element={<Settings />}/> */}
            <Route path="member/:id" element={<PrivateRoute roles={['Admin','IT_Member','Member']}><MembersDetail /></PrivateRoute>} />
            {/* <Route path="project/:id" element={<ProjectDetail />} />
            <Route path="task/:id" element={<TaskDetail />} />
            <Route path="subTask/:id" element={<SubtaskDetail />} />
            <Route path="assignFor/:id" element={<AssignForDetail />} /> */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* <Route path="/activities" element={<ActivityList/>} />
            <Route path="/memberComments" element={<MemberComments/>} /> */}
            <Route path="*" element={<NotFound />} />
            </Route>

          </Routes> 
       
        </Router>
        <InstallPopup />
     </>
  )
}

export default App