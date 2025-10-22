// src/pages/JobDetailPage.jsx

import React from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // <-- Import useQuery
import {
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Avatar,
  Container,
  Divider,
  CircularProgress // For the loading state
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

const fetchJobDetails = async (jobId) => {
  const { db } = await import('../db');
  await new Promise(res => setTimeout(res, 300));
  
  const job = await db.jobs.get(jobId);
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found.`);
  }

  const candidatesCount = await db.candidates
                              .where('appliedJobIds') // Use the simple array field
                              .equals(jobId)
                              .count();
  
  return { ...job, candidatesCount };
};


function JobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { 
    data: job, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJobDetails(jobId),
  });

  if (isLoading) {
    return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  }

  if (isError) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  if (!job) {
    return <Typography>Job not found or still loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2,
        flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography variant="h5" color="text.secondary">
          Job ID: {job.id.substring(0, 8)}...
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Button component={RouterLink} to="/jobs/create" variant="contained" startIcon={<AddIcon />}>Create Job</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </Box>
      </Box>

      {/* Main Content Paper */}
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Left Column*/}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, // Stack avatar and title on mobile
              textAlign: { xs: 'center', sm: 'left' } }}>
              <Avatar sx={{ width: { xs: 80, sm: 64 }, 
                height: { xs: 80, sm: 64 }, 
                mb: { xs: 2, sm: 0 }, 
                mr: { xs: 0, sm: 2 }, 
                 }} 
              src={job.company.avatarUrl}>
                {job.company.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '2.2rem', md: '3rem' }  }}>{job.title}</Typography>
                <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>{job.company.name}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Job Description</Typography>
            <Typography paragraph sx={{ whiteSpace: 'pre-wrap' }}>{job.description}</Typography>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>Required Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {job.tags.map(tag => <Chip key={tag} label={tag} />)}
            </Box>
          </Grid>

          {/* Right Column - now uses dynamic 'job' data */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{job.candidatesCount}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>Candidate Count</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>{new Date(job.createdAt).toLocaleDateString()}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>Date of Creation</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>${job.salary.min} - ${job.salary.max}k/year</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>Salary</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>{job.location}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>Job Location</Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Action Buttons Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
          <Button variant="outlined">Archive Job</Button>
          <Button variant="outlined" color="error">Delete Job</Button>
          <Button component={RouterLink} to={`/jobs/edit/${job.id}`} variant="contained">Edit Details</Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default JobDetailPage;