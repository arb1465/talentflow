// src/pages/JobsPage.jsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CircularProgress // --- The key component for layout
} from '@mui/material';

// --- ADD THIS CORRECTED BLOCK ---
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// // --- Temporary Static Data (to be replaced by API call) ---
// const fakeJobs = [
//   { id: 1, title: 'Senior Frontend Engineer', company: { name: 'Innovate Inc.' }, tags: ['React', 'TypeScript', 'Remote'], salary: { formatted: '$120 - $150k/year' }, location: 'Remote', candidatesCount: 5, status: 'active' },
//   { id: 2, title: 'UX/UI Designer', company: { name: 'Creative Solutions' }, tags: ['Figma', 'User Research'], salary: { formatted: '$90 - $110k/year' }, location: 'New York, NY', candidatesCount: 12, status: 'active' },
//   { id: 3, title: 'Archived - Product Manager', company: { name: 'Innovate Inc.' }, tags: ['Agile', 'Roadmap'], salary: { formatted: '$130 - $160k/year' }, location: 'Remote', candidatesCount: 2, status: 'archived' },
//   { 
//     id: 4, 
//     title: 'Backend Engineer', 
//     company: { name: 'Techify Labs' }, 
//     tags: ['Node.js', 'PostgreSQL', 'Docker'], 
//     salary: { formatted: '$110 - $140k/year' }, 
//     location: 'Austin, TX', 
//     candidatesCount: 8, 
//     status: 'archived' 
//   },
//   { 
//     id: 5, 
//     title: 'Data Scientist', 
//     company: { name: 'AI Ventures' }, 
//     tags: ['Python', 'Machine Learning', 'Pandas'], 
//     salary: { formatted: '$100 - $130k/year' }, 
//     location: 'San Francisco, CA', 
//     candidatesCount: 20, 
//     status: 'active' 
//   },
//   { 
//     id: 6, 
//     title: 'DevOps Engineer', 
//     company: { name: 'CloudOps Ltd.' }, 
//     tags: ['AWS', 'Kubernetes', 'CI/CD'], 
//     salary: { formatted: '$115 - $140k/year' }, 
//     location: 'Remote', 
//     candidatesCount: 6, 
//     status: 'active' 
//   },
//   { 
//     id: 7, 
//     title: 'Mobile App Developer', 
//     company: { name: 'Appify' }, 
//     tags: ['Flutter', 'iOS', 'Android'], 
//     salary: { formatted: '$95 - $120k/year' }, 
//     location: 'Boston, MA', 
//     candidatesCount: 10, 
//     status: 'active' 
//   },
//   { 
//     id: 8, 
//     title: 'QA Automation Engineer', 
//     company: { name: 'QualityFirst' }, 
//     tags: ['Selenium', 'Cypress', 'Jest'], 
//     salary: { formatted: '$85 - $105k/year' }, 
//     location: 'Chicago, IL', 
//     candidatesCount: 4, 
//     status: 'archived' 
//   },
//   { 
//     id: 9, 
//     title: 'Full Stack Developer', 
//     company: { name: 'NextGen Solutions' }, 
//     tags: ['React', 'Node.js', 'GraphQL'], 
//     salary: { formatted: '$105 - $135k/year' }, 
//     location: 'Remote', 
//     candidatesCount: 15, 
//     status: 'active' 
//   },
//   { 
//     id: 10, 
//     title: 'Cybersecurity Analyst', 
//     company: { name: 'SecureTech' }, 
//     tags: ['Network Security', 'SIEM', 'Threat Analysis'], 
//     salary: { formatted: '$100 - $125k/year' }, 
//     location: 'Washington, DC', 
//     candidatesCount: 3, 
//     status: 'active' 
//   }
// ];

const fetchJobs = async () => {
  // We'll replace this with a real fetch call once MSW is set up.
  // For now, it fetches directly from Dexie.
  const { db } = await import('../db');
  await new Promise(res => setTimeout(res, 500)); // Simulate latency
  return db.jobs.toArray();
};

// --- The Reusable Job Card Component ---
/** @param {{ job: import('../types').Job }} props */
function JobCard({ job }) {
  
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
        <IconButton size="small" aria-label="archive"><ArchiveIcon fontSize="small" /></IconButton>
        <IconButton size="small" aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
        <IconButton component={RouterLink} to={`/jobs/edit/${job.id}`} size="small" aria-label="edit">
          <EditIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}


// --- The Main Jobs Page Component ---
function JobsPage() {
  const [currentTab, setCurrentTab] = useState(0);

  // --- THIS IS THE KEY CHANGE ---
  // We use React Query to fetch, cache, and manage our jobs data.
  const { data: jobs = [], isLoading, isError, error } = useQuery({
    queryKey: ['jobs'], // A unique key for this query
    queryFn: fetchJobs, // The function that fetches the data
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const activeJobs = jobs.filter(job => job.status === 'active');
  const archivedJobs = jobs.filter(job => job.status === 'archived');
  
  if (isLoading) {
    return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  }
  if (isError) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    // This Container component is the fix. It centers its content and gives it a max-width.
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Jobs
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FilterListIcon />}>Apply Filter</Button>
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
          <IconButton><AccountCircleIcon /></IconButton>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="jobs tabs">
          <Tab label={`Active Jobs (${activeJobs.length})`} />
          <Tab label={`Archive Jobs (${archivedJobs.length})`} />
        </Tabs>
      </Box>

      {/* Job Cards Grid Section */}
      <Grid container spacing={3}>
        {(currentTab === 0 ? activeJobs : archivedJobs).map((job) => (
          <Grid item key={job.id} xs={12} sm={6} md={4} lg={3}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default JobsPage;