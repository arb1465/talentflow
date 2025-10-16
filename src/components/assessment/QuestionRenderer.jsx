import React from 'react';
import {
    Typography,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    FormControl,
    Checkbox,
    FormGroup,
    Box
} from '@mui/material';

/**
Renders a single question as a fillable form field.
@param {{
    question: import('../../types').AssessmentQuestion;
    response: any;
    onResponseChange: (questionId: string, answer: any) => void;
}} props
*/

function QuestionRenderer({ question, response, onResponseChange }) {
    const handleChange = (event) => {
        onResponseChange(question.id, event.target.value);
    };
    const handleMultiChange = (event) => {
        const { value, checked } = event.target;
        const currentAnswers = response || [];
        const newAnswers = checked
            ? [...currentAnswers, value]
            : currentAnswers.filter(ans => ans !== value);
        onResponseChange(question.id, newAnswers);
    };
    const renderQuestion = () => {
        switch (question.type) {
            case 'short-text':
            case 'long-text':
                return (
                    <TextField
                        fullWidth
                        label={question.title}
                        multiline={question.type === 'long-text'}
                        rows={question.type === 'long-text' ? 4 : 1}
                        value={response || ''}
                        onChange={handleChange}
                        required={question.required}
                    />
                );
            case 'single-choice':
                return (
                    <FormControl component="fieldset" required={question.required}>
                        <FormLabel component="legend">{question.title}</FormLabel>
                        <RadioGroup value={response || ''} onChange={handleChange}>
                            {question.options.map(opt => (
                                <FormControlLabel key={opt.id} value={opt.id} control={<Radio />} label={opt.text} />
                            ))}
                        </RadioGroup>
                    </FormControl>
                );

            case 'multi-choice':
                return (
                    <FormControl component="fieldset" required={question.required}>
                        <FormLabel component="legend">{question.title}</FormLabel>
                        <FormGroup>
                            {question.options.map(opt => (
                                <FormControlLabel
                                    key={opt.id}
                                    control={
                                        <Checkbox
                                            checked={(response || []).includes(opt.id)}
                                            onChange={handleMultiChange}
                                            value={opt.id}
                                        />
                                    }
                                    label={opt.text}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                );

            default:
                return <Typography color="error">Unsupported question type: {question.type}</Typography>;
        }
    };
    return <Box sx={{ mb: 3 }}>{renderQuestion()}</Box>;
}
export default QuestionRenderer;