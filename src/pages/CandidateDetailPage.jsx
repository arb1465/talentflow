// src/pages/CandidateDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Typography, Box, Button, Paper, Grid, TextField, Container,
  CircularProgress, Avatar, Stepper, Step, StepLabel, MenuItem,
  StepContent, List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';

const MOCK_USERS = [
  { id: 'hr-admin-1', name: 'Admin User' },
  { id: 'hr-admin-2', name: 'Jane Doe' },
];

// --- Define the authoritative order of our hiring stages ---
const TIMELINE_STAGES = ['applied', 'screen', 'tech', 'offer', 'rejected', 'hired'];

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

// --- New API function for adding a note ---
const addNoteToCandidate = async ({ candidateId, content }) => {
  const response = await fetch(`/candidates/${candidateId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      authorId: 'hr-admin-1', // In a real app, this would be the logged-in user's ID
      authorName: 'Admin User'
    }),
  });
  if (!response.ok) throw new Error('Failed to add note.');
  return response.json();
};


function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  console.log("Fetching details for candidateId:", candidateId, "Type:", typeof candidateId); // Add this line

  // State for the editable fields
  const [stage, setStage] = useState('');
  const [newNote, setNewNote] = useState('');

  // Fetch the candidate data
  const { data: candidate, isLoading, isError, error } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => fetchCandidateDetails(candidateId),
  });
  
  // Update local state when the fetched data arrives
  useEffect(() => {
    if (candidate) {
      setStage(candidate.stage);
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
    
    if (Object.keys(updates).length > 0) {
      updateMutation.mutate({ candidateId, updates });
    }
  };

  const addNoteMutation = useMutation({
    mutationFn: addNoteToCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
      setNewNote('');
    },
    onError: (err) => {
      alert(`Failed to add note: ${err.message}`);
    }
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({ candidateId, content: newNote });
    }
  };

  // --- Render Logic ---
  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (isError) return <Typography color="error">Error: {error.message}</Typography>;
  if (!candidate) return <Typography>Candidate not found.</Typography>;

  const activeStepIndex = TIMELINE_STAGES.indexOf(candidate.stage);
  const timelineEventsByStage = (candidate.timeline || []).reduce((acc, event) => {
    if (event.details.toStage) {
      acc[event.details.toStage] = event;
    }
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, sm: 0 } }}>
          <Avatar sx={{ width: 56, height: 56 }} src={candidate.avatarUrl}>{candidate.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: 'h4.fontSize' } }}>{candidate.name}</Typography>
            <Typography color="text.secondary"  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{candidate.email}</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/candidates')}>
          Back to Candidates
        </Button>
      </Box>

      {/* Main Content Paper */}
      <Paper sx={{ p: { xs: 2, sm: 4}, borderRadius: 2 }}>
        {/* Main Details */}
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
            {/* <Button variant="contained" sx={{ mt: 3, width: '100%', height: 56 }}>View Resume</Button> */}
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
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Current Stage" value={stage} onChange={(e) => setStage(e.target.value)} select>
              {['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'].map(option => (
                <MenuItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        {/* --- NOTES SECTION --- */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>Notes</Typography>
        <List sx={{ mb: 2 }}>
          {(Array.isArray(candidate.notes) && candidate.notes.length > 0) ? (
            candidate.notes.map(note => (
              <ListItem key={note.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{note.authorName.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={note.content}
                  secondary={`${note.authorName} — ${new Date(note.createdAt).toLocaleString()}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography color="text.secondary">No notes added yet.</Typography>
          )}
        </List>

        {/* Input for adding a new note */}
        <Box sx={{ display: 'flex', gap: 2, flexdirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            label="Add a new note... (try typing @)"
            multiline
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={addNoteMutation.isPending}
            sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
          >
            {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
          </Button>
        </Box>

        {/* Simple @mention suggestion renderer */}
        {newNote.includes('@') && (
          <Paper sx={{ p: 1, mt: 1 }}>
             <Typography variant="caption">Suggestions:</Typography>
             {MOCK_USERS.map(user => <Chip key={user.id} label={user.name} size="small" sx={{ ml: 1 }} />)}
          </Paper>
        )}
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button variant="outlined" onClick={() => navigate('/candidates')}  sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updateMutation.isPending} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {updateMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default CandidateDetailPage;