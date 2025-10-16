// src/pages/AssessmentBuilderPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuestionEditor from '../components/assessment/QuestionEditor';
import LivePreview from '../components/assessment/LivePreview';
import {
  Typography, Box, Button, Paper, Grid, Container, CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';


// --- API Functions ---
const fetchAssessment = async (jobId) => {
  const response = await fetch(`/assessments/${jobId}`);
  if (response.status === 404) return null; // No assessment exists yet, this is fine.
  if (!response.ok) throw new Error('Failed to fetch assessment.');
  return response.json();
};

const saveAssessment = async ({ jobId, assessmentData }) => {
  const response = await fetch(`/assessments/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assessmentData),
  });
  if (!response.ok) throw new Error('Failed to save assessment.');
  return response.json();
};


// --- The Main Builder Page Component ---
function AssessmentBuilderPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // The main state for our entire assessment builder
  const [assessment, setAssessment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch existing assessment data or start with a new one
  const { data: initialData, isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => fetchAssessment(jobId),
  });

  // Populate our state once the data is fetched
  useEffect(() => {
    // This effect runs when the query is finished (isSuccess becomes true)
    if (isSuccess) {
      if (initialData) {
        // If we found an existing assessment, use it.
        console.log("Found existing assessment, setting state...");
        setAssessment(initialData);
        setIsEditMode(true); 
      } else {
        // If the query succeeded but returned null (a 404), create a new one.
        console.log("No assessment found for this job, creating a new one...");
        setIsEditMode(false);
        setAssessment({
          id: uuidv4(),
          jobId: jobId,
          title: 'New Skills Assessment',
          // ... all other default properties for a blank assessment
          sections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [isSuccess, initialData, jobId]); // Run this logic when the query completes

  const saveMutation = useMutation({
    mutationFn: saveAssessment,
    onSuccess: () => {
      // 1. Invalidate queries to ensure both the builder and the list page refetch data
      queryClient.invalidateQueries({ queryKey: ['assessment', jobId] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      alert('Assessment saved successfully!');
      
      // 2. Navigate the user back to the main assessments list page
      navigate('/assessments');
    },
    onError: (err) => {
      alert(`Error saving assessment: ${err.message}`);
      console.error("Save assessment error details:", err);
      console.error("Save assessment error msg:", err.message);
    }
  });

  const handleSave = () => {
    saveMutation.mutate({ jobId, assessmentData: assessment });
  };

  const handleAddQuestion = (newQuestion) => {
    setAssessment(prevAssessment  => {
      const updatedAssessment = JSON.parse(JSON.stringify(prevAssessment ));
      // If no sections exist, create one first
      if (!updatedAssessment.sections || updatedAssessment.sections.length === 0) {
        updatedAssessment.sections = [{ id: uuidv4(), title: 'Main Section', questions: [] }];
      }
      // Add the new question to the first section
      updatedAssessment.sections[0].questions.push(newQuestion);

      return updatedAssessment;
    });
  };
  
  // --- Render Logic ---
  if (isLoading || !assessment) {
    return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  }

  if (isError) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Assessments</Typography>
          <Typography variant="h5" color="text.secondary">
            {isEditMode ? 'Edit Assessment' : 'New Assessment'}  
          </Typography>
          <Typography variant="caption" color="text.secondary">Assessment ID: {assessment.id.substring(0,8)}...</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/assessments')}>
            Back to Assessments
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Assessment' : 'Create this Assessment')}
          </Button>
        </Box>
      </Box>

      {/* Two-Pane Layout */}
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Left Pane: Editor */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: 'content-fit' }}>
            <QuestionEditor onAddQuestion={handleAddQuestion} />
          </Paper>
        </Grid>
        
        {/* Right Pane: Live Preview */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6">Preview</Typography>
            <LivePreview assessment={assessment} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AssessmentBuilderPage;