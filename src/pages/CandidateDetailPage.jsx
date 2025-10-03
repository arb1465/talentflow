// src/pages/CandidateDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography, Box, Button, Paper, Grid, TextField, Container,
  CircularProgress, Avatar, Stepper, Step, StepLabel, StepConnector, MenuItem,
  StepContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


// --- Define the authoritative order of our hiring stages ---
const TIMELINE_STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

// --- API Fetching and Updating Functions ---
const fetchCandidateDetails = async (candidateId) => {
  const response = await fetch(`/candidates/${candidateId}`);
  if (!response.ok) throw new Error('Candidate not found.');
  return response.json();
};

const updateCandidate = async ({ candidateId, updates }) => {
  const response = await fetch(`/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update candidate.');
  return response.json();
};


function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for the editable fields
  const [stage, setStage] = useState('');
  const [note, setNote] = useState('');

  // Fetch the candidate data
  const { data: candidate, isLoading, isError, error } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => fetchCandidateDetails(candidateId),
  });
  
  // Update local state when the fetched data arrives
  useEffect(() => {
    if (candidate) {
      setStage(candidate.stage);
      setNote(candidate.notes || '');
    }
  }, [candidate]);

  // Mutation for updating the candidate
  const updateMutation = useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => {
      // Refetch the data to get the latest version
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
      // Also refetch the main candidates list for the Kanban board
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      alert("Candidate updated successfully!");
    },
    onError: (err) => {
      alert(`Update failed: ${err.message}`);
    }
  });

  const handleUpdate = () => {
    const updates = {};
    if (stage !== candidate.stage) updates.stage = stage;
    if (note !== candidate.notes) updates.notes = note;
    
    if (Object.keys(updates).length > 0) {
      updateMutation.mutate({ candidateId, updates });
    }
  };

  // --- Render Logic ---
  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (isError) return <Typography color="error">Error: {error.message}</Typography>;
  if (!candidate) return <Typography>Candidate not found.</Typography>;

  const activeStepIndex = TIMELINE_STAGES.indexOf(candidate.stage);
  const timelineEventsByStage = (candidate.timeline || []).reduce((acc, event) => {
    // We only care about the 'toStage' for this map
    if (event.details.toStage) {
      acc[event.details.toStage] = event;
    }
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56 }} src={candidate.avatarUrl}>{candidate.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>{candidate.name}</Typography>
            <Typography color="text.secondary">{candidate.email}</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/candidates')}>
          Back to Candidates
        </Button>
      </Box>

      {/* Main Content Paper */}
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* Details & Resume */}
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Candidate ID" value={candidate.id.substring(0,8)} disabled InputProps={{readOnly: true}} />
            <TextField fullWidth label="Phone No." value={candidate.phone || ''} disabled InputProps={{readOnly: true}} sx={{ mt: 2 }} />
            <TextField fullWidth label="Skills" value={candidate.skills?.join(', ') || ''} multiline disabled InputProps={{readOnly: true}} sx={{ mt: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Date of Birth" value={candidate.personalDetails?.dateOfBirth || ''} disabled InputProps={{readOnly: true}} />
            <TextField fullWidth label="Gender" value={candidate.personalDetails?.gender || ''} disabled InputProps={{readOnly: true}} sx={{ mt: 2 }} />
            <Button variant="contained" sx={{ mt: 3, width: '100%', height: 56 }}>View Resume</Button>
          </Grid>
        </Grid>

        {/* Timeline */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>Timeline</Typography>
        <Stepper activeStepIndex={activeStepIndex} orientation="vertical">
          {TIMELINE_STAGES.map((stageId, index) => {
            const event = timelineEventsByStage[stageId];
            const isCompleted = activeStepIndex >= index;

            return (
              <Step key={stageId}>
                <StepLabel
                  StepIconProps={{
                    // Style the icon based on whether the step is completed
                    sx: { color: isCompleted ? 'primary.main' : 'grey.400' }
                  }}
                >
                  {stageId.charAt(0).toUpperCase() + stageId.slice(1)}
                </StepLabel>
                {/* StepContent only shows for completed steps */}
                {isCompleted && event && (
                  <StepContent>
                    <Typography variant="caption">
                      Moved on: {new Date(event.timestamp).toLocaleDateString()} by {event.actorName}
                    </Typography>
                  </StepContent>
                )}
              </Step>
            );
          })}
        </Stepper>

        {/* Stage & Notes Update */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Current Stage" value={stage} onChange={(e) => setStage(e.target.value)} select>
              {['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'].map(option => (
                <MenuItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Candidate Note" multiline rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
          </Grid>
        </Grid>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate('/candidates')}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CandidateDetailPage;