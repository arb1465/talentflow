// src/pages/JobsPage.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Container,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive'; // Import the Unarchive icon
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';


// --- API Functions (no changes needed here) ---
const fetchJobs = async () => {
  const { db } = await import('../db');
  await new Promise(res => setTimeout(res, 500));
  return db.jobs.toArray();
};

// --- Create a new API function for deleting a job ---
const deleteJob = async (jobId) => {
  const response = await fetch(`/jobs/${jobId}`, {
    method: 'DELETE',
  });
  // A 204 response has no body, so we don't call response.json()
  if (!response.ok) {
    throw new Error('Failed to delete job.');
  }
  return true; // Return something on success
};

const updateJobStatus = async ({ jobId, status }) => {
  const response = await fetch(`/jobs/${jobId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    if (Math.random() < 0.2) throw new Error('Random API Error!'); 
    throw new Error('Failed to update job status.');
  }
  return response.json();
};


// --- The Main Jobs Page Component ---
function JobsPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  // --- Mutation for optimistic update (no changes needed here) ---
  const updateStatusMutation = useMutation({
    mutationFn: updateJobStatus,
    onMutate: async ({ jobId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']);
      queryClient.setQueryData(['jobs'], (oldData) =>
        oldData.map(j => (j.id === jobId ? { ...j, status } : j))
      );
      return { previousJobs };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['jobs'], context.previousJobs);
      alert("Update failed! Rolling back changes.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onMutate: async (jobId) => {
      // Optimistic Update: Immediately remove the job from the UI
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']);
      queryClient.setQueryData(['jobs'], (oldData) =>
        oldData.filter(j => j.id !== jobId)
      );
      return { previousJobs };
    },
    // If the delete fails, roll back the UI to its previous state
    onError: (err, variables, context) => {
      queryClient.setQueryData(['jobs'], context.previousJobs);
      alert("Delete failed! Rolling back changes.");
    },
    // Always refetch the jobs list to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // --- Create the handler function to call the mutation ---
  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to permanently delete this job?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleToggleArchive = (job) => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    updateStatusMutation.mutate({ jobId: job.id, status: newStatus });
  };


  const activeJobs = jobs.filter(job => job.status === 'active');
  const archivedJobs = jobs.filter(job => job.status === 'archived');
  
  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (isError) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Jobs
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>
            Apply Filter
          </Button>
          <TextField 
            size="small" 
            placeholder="Search Job..." 
            variant="outlined"
            sx={{ minWidth: '250px' }}
            InputProps={{ endAdornment: <SearchIcon sx={{ color: 'action.active' }} /> }}
          />
          <Button component={RouterLink} to="/jobs/create" variant="contained" color="primary" startIcon={<AddIcon />}>
            Create Job
          </Button>
          <IconButton>
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Box>

      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={`Active Jobs (${activeJobs.length})`} />
          <Tab label={`Archive Jobs (${archivedJobs.length})`} />
        </Tabs>
      </Box>

      {/* --- Job Cards Grid Section --- */}
      <Grid container spacing={3}>
        {(currentTab === 0 ? activeJobs : archivedJobs).map((job) => (
          <Grid item key={job.id} xs={12} sm={6} md={4} lg={3}>
            <JobCard job={job} onToggleArchive={handleToggleArchive} onDelete={handleDeleteJob} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

/** 
 * @param {{ 
 *   job: import('../types').Job;
 *   onToggleArchive: (job: import('../types').Job) => void;
 * }} props 
 */
function JobCard({ job, onToggleArchive, onDelete }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
              {job.title}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {job.company.name}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, ml: 1 }}>
            {job.company.name.charAt(0)}
          </Avatar>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 2 }}>
          {job.tags.slice(0, 4).map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {job.salary.formatted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {job.candidatesCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Candidates
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1, px: 1 }}>
        <IconButton size="small" aria-label="Toggle Archive" onClick={() => onToggleArchive(job)}>
          {job.status === 'active' ? <ArchiveIcon fontSize="small" /> : <UnarchiveIcon fontSize="small" />}
        </IconButton>
        <IconButton size="small" aria-label="delete" onClick={() => onDelete(job.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton component={RouterLink} to={`/jobs/edit/${job.id}`} size="small" aria-label="edit">
          <EditIcon fontSize='small'/>
        </IconButton>
        <IconButton component={RouterLink} to={`/jobs/${job.id}`} size="small" aria-label="details">
          <ArrowRightAltIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default JobsPage;