import React, {useState, useEffect} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Layout from './components/Layout.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';

import JobsPage from './pages/JobsPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import CandidateDetailPage from './pages/CandidateDetailPage.jsx';
import AssessmentsPage from './pages/AssessmentsPage.jsx';
import CreateJobPage from './pages/CreateJobPage.jsx';
import EditJobPage from './pages/EditJobPage'; 
import CreateAssessmentPage from './pages/CreateAssessmentPage.jsx';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage.jsx';
import { DatabaseSeeder } from './pages/dev/DatabaseSeeder.jsx';


function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}


function App() {
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(false);

  useEffect(() => {
    // Check if the user has seen the welcome message before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeMessage');
    
    if (!hasSeenWelcome) {
      // If they haven't, open the modal
      setWelcomeModalOpen(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    // When the user clicks "Acknowledge", close the modal
    setWelcomeModalOpen(false);
    // And save a flag in localStorage so it doesn't show again
    localStorage.setItem('hasSeenWelcomeMessage', 'true');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/create" element={<CreateJobPage />} /> 
          <Route path="/jobs/edit/:jobId" element={<EditJobPage />} /> 
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
          
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/create" element={<CreateAssessmentPage />} />
          <Route path="/assessments/builder/:jobId" element={<AssessmentBuilderPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      
      <WelcomeModal open={isWelcomeModalOpen} handleClose={handleCloseWelcomeModal} />

      {/* The DatabaseSeeder button will only be rendered in development mode */}
      {import.meta.env.DEV && <DatabaseSeeder />}
    </Box>
  );
}

export default App;