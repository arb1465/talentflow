
import React, { useState } from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import QuestionRenderer from './QuestionRenderer';

/**
 * Renders the entire assessment as a fillable form.
 * @param {{ assessment: import('../../types').Assessment }} props
 */
function LivePreview({ assessment }) {
  const [responses, setResponses] = useState({});

  const handleResponseChange = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  
  const handleSubmit = () => {
    console.log("--- Live Preview Submitted ---", responses);
    alert("Check the console for the submitted responses!");
  };

  if (!assessment || !assessment.sections) {
    return <Typography>Start building your assessment to see the preview.</Typography>;
  }

  return (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.25rem', sm: 'h5.fontSize' },
          fontWeight: 'bold' 
        }}
      >
        {assessment.title}
      </Typography>

      {assessment.sections.map(section => (
        <Paper 
          key={section.id} 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: 3, 
            boxShadow: 'none', 
            border: '1px solid', 
            borderColor: 'divider' 
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.1rem', sm: 'h6.fontSize' },
              fontWeight: 500
            }}
          >
            {section.title}
          </Typography>
          
          {section.questions.map(question => (
            <QuestionRenderer
              key={question.id}
              question={question}
              response={responses[question.id]}
              onResponseChange={handleResponseChange}
            />
          ))}
        </Paper>
      ))}
      <Button 
        variant="contained" 
        onClick={handleSubmit} 
        sx={{ width: { xs: '100%', sm: 'auto' } }}>
        Submit Preview
      </Button>
    </Box>
  );
}

export default LivePreview;