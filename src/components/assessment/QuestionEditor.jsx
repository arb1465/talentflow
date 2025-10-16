// src/components/assessment/QuestionEditor.jsx

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

/**
 * A form to add new questions to the assessment.
 * @param {{ onAddQuestion: (newQuestion: import('../../types').AssessmentQuestion) => void }} props
 */


function QuestionEditor({ onAddQuestion }) {
  const [formState, setFormState] = useState({
    title: '',
    type: 'short-text',
    options: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddQuestion = () => {
    if (!formState.title.trim()) {
      alert("Question title is required.");
      return;
    }

    // Create the new question object directly from the form state
    const newQuestion = {
      id: uuidv4(),
      title: formState.title,
      type: formState.type,
      required: true,
      options: formState.type.includes('choice')
        ? formState.options.split('\n').filter(opt => opt.trim() !== '').map(opt => ({ id: uuidv4(), text: opt.trim() }))
        : [],
      validation: {},
      conditionalLogic: {}
    };
    
    // Call the parent function to add the question to the main state
    onAddQuestion(newQuestion);
    
    // Reset the form state to its initial values
    setFormState({
      title: '',
      type: 'short-text',
      options: '',
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Add a New Question</Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Question Type</InputLabel>
        <Select name="type" value={formState.type} label="Question Type" onChange={handleChange}>
          <MenuItem value="short-text">Short Text</MenuItem>
          <MenuItem value="long-text">Long Text</MenuItem>
          <MenuItem value="single-choice">Single Choice</MenuItem>
          <MenuItem value="multi-choice">Multi Choice</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Question"
        name="title"
        value={formState.title}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      
      {formState.type.includes('choice') && (
        <TextField
          fullWidth
          label="MCQ Options (one per line)"
          name="options"
          multiline
          rows={4}
          value={formState.options}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      )}

      <Button variant="contained" onClick={handleAddQuestion}>Add Question</Button>
    </Box>
  );
}


export default QuestionEditor;