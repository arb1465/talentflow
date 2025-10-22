import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Sends a request to the mock API to create a new job.
 * @param {object} newJobData - The data from the form.
 */
const createNewJob = async (newJobData) => {
  const response = await fetch('/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newJobData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create job.');
  }
  return response.json();
};

// --- The Main Create Job Page Component ---
function CreateJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get the query client instance
  
  // A single state object to hold all form data
  const [jobData, setJobData] = useState({
    jobTitle: '',
    jobDescription: '',
    companyWebsite: '',
    companyDescription: '',
    companyLogo: '',
    industrySection: '',
    hiringType: 'Full-Time', 
    ctcStipend: '',
    experienceRequired: '',
    requiredSkills: [],
    location: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSkillsChange = (event) => {
    const { target: { value } } = event;
    setJobData(prevState => ({
      ...prevState,
      requiredSkills: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const createJobMutation = useMutation({
    mutationFn: createNewJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });

      navigate('/jobs');
    },
    onError: (error) => {
      alert(`Error creating job: ${error.message}`);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const jobToCreate = {
      title: jobData.jobTitle,
      description: jobData.jobDescription,
      company: {
        name: 'Placeholder Company Name',
        description: jobData.companyDescription,
        avatarUrl: jobData.companyLogo,
      },
      industry: jobData.industrySection,
      jobType: jobData.hiringType,
      salary: {
          min: 0,
          max: 0,
          formatted: jobData.ctcStipend
      },
      status: 'active',
      location: jobData.location,
      tags: jobData.requiredSkills,
    };

    createJobMutation.mutate(jobToCreate);
  };

  const skillsOptions = ['React', 'Node.js', 'TypeScript', 'Figma', 'PostgreSQL', 'Agile', 'Remote'];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' }
        }}>
        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize:  { xs: '2rem', sm: 'h4.fontSize' } }}>
            Jobs
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.2rem', sm: 'h5.fontSize' } }}>
            Create Job
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Box>

      {/* Form Section */}
      <Paper sx={{ p: { xs: 2, sm: 4}, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Job Title" name="jobTitle" value={jobData.jobTitle} onChange={handleChange} required />
              <TextField fullWidth label="Company Website" name="companyWebsite" value={jobData.companyWebsite} onChange={handleChange} sx={{ mt: 3 }} />
              <TextField fullWidth label="Company Logo URL" name="companyLogo" value={jobData.companyLogo} onChange={handleChange} sx={{ mt: 3 }} />
              <TextField fullWidth label="Industry Section" name="industrySection" value={jobData.industrySection} onChange={handleChange} sx={{ mt: 3 }} />
              
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel id="skills-chip-label">Required Skills</InputLabel>
                <Select
                  labelId="skills-chip-label"
                  multiple
                  name="requiredSkills"
                  value={jobData.requiredSkills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput id="select-multiple-chip" label="Required Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => <Chip key={value} label={value} />)}
                    </Box>
                  )}
                >
                  {skillsOptions.map((skill) => (
                    <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField fullWidth label="Location" name="location" value={jobData.location} onChange={handleChange} sx={{ mt: 3 }} />
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Job Description" name="jobDescription" multiline rows={4} value={jobData.jobDescription} onChange={handleChange} required />
              <TextField fullWidth label="Company Description" name="companyDescription" multiline rows={4} value={jobData.companyDescription} onChange={handleChange} sx={{ mt: 3 }}/>
              
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel id="hiring-type-label">Hiring Type</InputLabel>
                <Select
                  labelId="hiring-type-label"
                  name="hiringType"
                  value={jobData.hiringType}
                  label="Hiring Type"
                  onChange={handleChange}
                >
                  <MenuItem value="Full-Time">Full-Time</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                </Select>
              </FormControl>
              
              <TextField fullWidth label="CTC / Stipend" name="ctcStipend" value={jobData.ctcStipend} onChange={handleChange} sx={{ mt: 3 }} />
              <TextField fullWidth label="Experience Required" name="experienceRequired" value={jobData.experienceRequired} onChange={handleChange} sx={{ mt: 3 }} />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3,
              flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
              <Button variant="outlined" onClick={() => navigate('/jobs')} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ width: { xs: '100%', sm: 'auto' } }}>Create Job</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateJobPage;