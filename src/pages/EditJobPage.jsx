
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Chip,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db } from '../db';

const fetchJobById = async (jobId) => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));

  const job = await db.jobs.get(jobId);
  
  if (!job) throw new Error("Job not found");
  
  return {
    jobTitle: job.title || '',
    jobDescription: job.description || '',
    companyWebsite: job.company?.website || '',
    companyDescription: job.company?.description || '',
    companyLogo: job.company?.avatarUrl || '',
    industrySection: job.industry || '',
    hiringType: job.jobType || 'Full-Time',
    ctcStipend: job.salary?.formatted || '',
    experienceRequired: job.experience || '',
    requiredSkills: job.tags || [],
    location: job.location || ''
  };
};


function EditJobPage() {
  const navigate = useNavigate();
  const { jobId } = useParams(); // Get the job ID from the URL
  
  const [jobData, setJobData] = useState(null); // Start with null
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- useEffect to fetch the job data when the page loads ---
  useEffect(() => {
    fetchJobById(jobId)
      .then(data => {
        setJobData(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [jobId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobData(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleSkillsChange = (event) => {
    const { target: { value } } = event;
    setJobData(prevState => ({ ...prevState, requiredSkills: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("--- Job Data Updated ---");
    console.log({ id: jobId, ...jobData });
    alert("Changes saved! Check the console for the updated data.");
    navigate('/jobs');
  };

  const skillsOptions = ['React', 'Node.js', 'TypeScript', 'Figma', 'PostgreSQL', 'Agile', 'Remote'];

  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold',fontSize: { xs: '2rem', sm: 'h4.fontSize'} }}>
            Jobs
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.2rem', sm: 'h5.fontSize' } }}>
            Edit Job
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Box>

      {/* Form Section */}
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        {jobData && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              
              {/* --- Left Column --- */}
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
              
              {/* --- Right Column --- */}
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

              {/* --- Action Buttons --- */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 , flexDirection: { xs: 'column', sm: 'row' }}}>
                <Button variant="outlined" onClick={() => navigate('/jobs')} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ width: { xs: '100%', sm: 'auto' } }}>Save Changes</Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
}

export default EditJobPage;