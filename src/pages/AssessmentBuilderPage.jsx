// src/pages/AssessmentBuilderPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuestionEditor from '../components/assessment/QuestionEditor';
import LivePreview from '../components/assessment/LivePreview';
import {
  Typography, Box, Button, Paper, Grid, Container, CircularProgress, Alert, Tabs, Tab, useTheme, useMediaQuery
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
  const [mobileTab, setMobileTab] = useState(0);
  const theme = useTheme();

  const [assessment, setAssessment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: initialData, isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => fetchAssessment(jobId),
  });

  useEffect(() => {
    if (isSuccess) {
      if (initialData) {
        console.log("Found existing assessment, setting state...");
        setAssessment(initialData);
        setIsEditMode(true); 
      } else {
        console.log("No assessment found for this job, creating a new one...");
        setIsEditMode(false);
        setAssessment({
          id: uuidv4(),
          jobId: jobId,
          title: 'New Skills Assessment',
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
      queryClient.invalidateQueries({ queryKey: ['assessment', jobId] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      alert('Assessment saved successfully!');
      
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
  
  const handleMobileTabChange = (event, newValue) => {
    setMobileTab(newValue);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' } 
      }}>
        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: {xs: '2rem', sm: 'h4.fontSize'} }}>Assessments</Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.2rem', sm: 'h5.fontSize' } }}>
            {isEditMode ? 'Edit Assessment' : 'New Assessment'}  
          </Typography>
          <Typography variant="caption" color="text.secondary">Assessment ID: {assessment.id.substring(0,8)}...</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto'} }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/assessments')} sx={{ flexGrow: 1}}>
            Back to Assessments
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending} sx={{ flexGrow: 1 }}>
            {saveMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Assessment' : 'Create this Assessment')}
          </Button>
        </Box>
      </Box>

      {/* Two-Pane Layout */}
      {isMobile ? (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={mobileTab} onChange={handleMobileTabChange} variant="fullWidth">
              <Tab label="Editor" />
              <Tab label="Preview" />
            </Tabs>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {mobileTab === 0 && <QuestionEditor onAddQuestion={handleAddQuestion} />}
            {mobileTab === 1 && <LivePreview assessment={assessment} />}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, overflow: 'hidden' }}>
          <Paper sx={{ width: '40%', flexShrink: 0, p: 2, overflowY: 'auto' }}>
            <QuestionEditor onAddQuestion={handleAddQuestion} />
          </Paper>
          <Paper sx={{ flexGrow: 1, p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6">Preview</Typography>
            <LivePreview assessment={assessment} />
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default AssessmentBuilderPage;