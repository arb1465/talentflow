// src/pages/AssessmentsPage.jsx

import React, {useEffect} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography, Box, Button, TextField, Container, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const fetchAssessments = async () => {
  // We already created this MSW handler. It gets all assessments and their job details.
  const response = await fetch('/assessments');
  if (!response.ok) throw new Error('Failed to fetch assessments.');
  return response.json();
};

const deleteAssessment = async (jobId) => {
  const response = await fetch(`/assessments/${jobId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete assessment.');
  return true;
};

function AssessmentsPage() {
  const queryClient = useQueryClient();

  const { data: assessments = [], isLoading, isError, error } = useQuery({
    queryKey: ['assessments'],
    queryFn: fetchAssessments,
  });
  
  useEffect(() => {
    // This will run whenever the 'assessments' variable changes.
    console.log("Assessments data from useQuery:", assessments);
  }, [assessments]);
  
  const deleteMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      // When delete is successful, refetch the list
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    onError: (err) => {
      alert(`Error deleting assessment: ${err.message}`);
    }
  });

  const handleDelete = (jobId) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      deleteMutation.mutate(jobId);
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (isError) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', 
            fontSize: { xs: '2rem', sm: 'h4.fontSize' },
            alignSelf: { xs: 'flex-start', sm: 'center' } 
        }}>
          Assessments
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, 
          width: { xs: '100%', sm: 'auto' }}}>
          <TextField size="small" placeholder="Search Assessment..." InputProps={{ endAdornment: <SearchIcon /> }}  sx={{flexGrow: 1}}/>
          <Button component={RouterLink} to="/assessments/create" variant="contained" startIcon={<AddIcon />} sx={{ flexShrink: 0}}>
            Create Assessment
          </Button>
        </Box>
      </Box>

      {/* Assessments Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="assessments table">
          <TableHead>
            <TableRow>
              <TableCell>Assessment Title</TableCell>
              <TableCell>Job Role</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessments.map((assessment) => (
              <TableRow key={assessment.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{assessment.title}</TableCell>
                <TableCell>{assessment.jobRole}</TableCell>
                <TableCell>{new Date(assessment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton component={RouterLink} to={`/assessments/builder/${assessment.jobId}`} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(assessment.jobId)} size="small" disabled={deleteMutation.isPending}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default AssessmentsPage;