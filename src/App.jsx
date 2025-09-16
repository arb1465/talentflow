// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// --- Component Imports ---
import Layout from './components/Layout.jsx';
import JobsPage from './pages/JobsPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import CandidatesPage from './pages/CandidatesPage.jsx';
import CandidateDetailPage from './pages/CandidateDetailPage.jsx';
import AssessmentsPage from './pages/AssessmentsPage.jsx';
import CreateJobPage from './pages/CreateJobPage.jsx';
import EditJobPage from './pages/EditJobPage'; 

import { DatabaseSeeder } from './pages/dev/DatabaseSeeder.jsx'; // Assuming it's in components/dev

// A simple component for the "Not Found" page
function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}


function App() {
  return (
    // The Box wrapper from MUI is a great way to set up the base layout
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
          
          <Route path="/assessments/:jobId" element={<AssessmentsPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      
      {/* The DatabaseSeeder button will only be rendered in development mode */}
      {import.meta.env.DEV && <DatabaseSeeder />}
    </Box>
  );
}

export default App;