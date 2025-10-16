// src/pages/CreateAssessmentPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Typography, Box, Button, Paper, Grid, Container, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db } from '../db';


// The new fetching function talks DIRECTLY to Dexie, not an API.
const fetchJobListFromDB = async () => {
  console.log("Fetching job list directly from Dexie DB...");
  const allJobs = await db.jobs.toArray();
  const jobList = allJobs.map(job => ({ 
    id: job.id, 
    title: job.title, 
    company: job.company 
  }));
  return jobList;
};


function CreateAssessmentPage() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // The useQuery hook now calls our direct database function.
  const { 
    data: jobs = [], 
    isLoading,
  } = useQuery({
    queryKey: ['jobsList'], // The key remains the same
    queryFn: fetchJobListFromDB, // We use the new, direct function
  });

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  const handleNext = () => {
    if (selectedJobId) {
      navigate(`/assessments/builder/${selectedJobId}`);
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;


  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Assessments
          </Typography>
          <Typography variant="h5" color="text.secondary">
            New Assessment
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/assessments')}>
          Back to Assessments
        </Button>
      </Box>

      {/* Form Section */}
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Link to a Job</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Select the job for which you want to create a new assessment.
        </Typography>

        <Box component="form" noValidate autoComplete="off">
          {/* Main content row */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* The Select dropdown */}
              <FormControl sx={{ minWidth: 240, flexGrow: 1 }}>
                  <InputLabel id="job-select-label">Select Job</InputLabel>
                  <Select
                      labelId="job-select-label"
                      value={selectedJobId}
                      label="Select Job"
                      onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {jobs.map(job => (
                          <MenuItem key={job.id} value={job.id}>{job.title}</MenuItem>
                      ))}
                  </Select>
              </FormControl>

              {/* The Job Title TextField */}
              <TextField 
                  label="Job Title" 
                  value={selectedJob?.title || ''} 
                  disabled 
                  sx={{ flexGrow: 1 }}
              />
              {/* The Company Name TextField */}
              <TextField 
                  label="Company Name" 
                  value={selectedJob?.company.name || ''} 
                  disabled 
                  sx={{ flexGrow: 1 }}
              />
          </Box>

          {/* Action Buttons row (using your sx prop) */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="outlined" onClick={() => navigate('/assessments')}>Cancel</Button>
              <Button variant="contained" onClick={handleNext} disabled={!selectedJobId}>
                  Next
              </Button>
          </Box>

        </Box>
      </Paper>
    </Container>
  );
}

export default CreateAssessmentPage;