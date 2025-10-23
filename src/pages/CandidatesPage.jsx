// src/pages/CandidatesPage.jsx

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates, useUpdateCandidateStage } from '../hooks/useCandidates';
import {
  Typography, Box, TextField, Avatar, Paper, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DndContext, useDraggable, useDroppable, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useVirtualizer } from '@tanstack/react-virtual';

const STAGES = [
  { id: 'applied', title: 'Applied' },
  { id: 'screen', title: 'Screen' },
  { id: 'tech', title: 'Tech' },
  { id: 'offer', title: 'Offer' },
  { id: 'hired', title: 'Hired' },
];


function CandidateCard({ candidate, isOverlay = false, dragListeners, onClick }) {
  const colorIndex = candidate.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
  const pastelColors = ['#bceeeeff', '#b9c1d6ff', '#C4D7F2', '#eee3f7ff'];

  return (
    <Paper 
      onClick={onClick}
      sx={{ 
        p: { xs: 1.5, sm: 2 }, mb: 2, borderRadius: 2, 
        backgroundColor: pastelColors[colorIndex], 
        overflow: 'hidden', 
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {!isOverlay && (
        <Box
          {...dragListeners}
          onClick={(e) => e.stopPropagation()} 
          sx={{
            position: 'absolute', top: 4, right: 4, cursor: 'grab',
            color: 'text.secondary', opacity: 0.5, touchAction: 'none',
          }}
        >
          <DragIndicatorIcon />
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ mr:1, width: { xs: 20, sm: 24 },
          height: { xs: 20, sm: 24 },
          fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>{candidate.name.charAt(0)}</Avatar>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', 
            fontSize: { xs: '0.8rem', sm: 'subtitle2.fontSize' } }}>{candidate.name}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" noWrap sx={{ textOverflow: 'ellipsis', fontSize: { xs: '0.75rem', sm: 'body2.fontSize' } }}>{candidate.email}</Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 1, display: 'block', fontSize: { xs: '0.7rem', sm: 'caption.fontSize' } }}>{Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills}</Typography>
    </Paper>
  );
}

function Draggable({ id, data, children }) {
   const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data });
  const navigate = useNavigate(); // Import useNavigate hook from react-router-dom

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999 } : undefined;


  const handleCardClick = () => {
    // ONLY navigate if we are NOT currently dragging the card.
    if (!isDragging) {
      navigate(`/candidates/${id}`);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children, { 
        dragListeners: listeners, 
        onClick: handleCardClick 
      })}
    </div>
  );
}

function DroppableColumn({ id, title, items }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: items.length, // The total number of items
    getScrollElement: () => parentRef.current, // The element that will scroll
    estimateSize: () => 120, // The estimated height of each card (px)
    overscan: 5, // Render 5 extra items above/below the viewport
  });

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: isOver ? 'action.hover' : 'grey.50',
        borderRadius: 2, overflow: 'hidden',
      }}
    >
      <Typography variant="h6" sx={{  p: 2, textAlign: 'center', flexShrink: 0 }}>{title}</Typography>
      
      <Box ref={parentRef} sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <Box sx={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const candidate = items[virtualItem.index];
            return (
              <Box
                key={virtualItem.key}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Draggable id={candidate.id} data={{ candidate }}>
                  <CandidateCard candidate={candidate} />
                </Draggable>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}

function CandidatesPage() {
  const [filters, setFilters] = useState({ stage: 'all', search: '' });
  const [activeCandidate, setActiveCandidate] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const { data: candidates = [], isLoading } = useCandidates(filters);
  const updateStageMutation = useUpdateCandidateStage();

  const candidatesByStage = useMemo(() => {
    const grouped = {};
    STAGES.forEach(stage => grouped[stage.id] = []);
    candidates.forEach(candidate => {
      if (grouped[candidate.stage]) {
        grouped[candidate.stage].push(candidate);
      }
    });
    return grouped;
  }, [candidates]);

  const handleDragStart = (event) => {
    setActiveCandidate(event.active.data.current.candidate);
  };
  
  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveCandidate(null);

    if (over && active.data.current?.candidate) {
      const candidate = active.data.current.candidate;
      const targetStage = over.id;
      if (candidate.stage !== targetStage) {
        updateStageMutation.mutate({ candidateId: candidate.id, stage: targetStage });
      }
    }
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 94px)', display: 'flex', flexDirection: 'column'  }}>
      {/* ... Header and Filters ... */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Candidates
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            size="small" 
            placeholder="Search Candidate..."
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            InputProps={{ endAdornment: <SearchIcon /> }}
          />
        </Box>
      </Box>
      
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Box sx={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns:  { xs: '1fr', md: 'repeat(5, 1fr)' },
          gap: 2, 
          overflow: { xs: 'auto', md: 'hidden' }
        }}>
          {isLoading ? (
            <CircularProgress sx={{ margin: 'auto', gridColumn: '1 / -1' }} />
          ) : (
            STAGES.map(stage => (
              <DroppableColumn key={stage.id} id={stage.id} title={stage.title} items={candidatesByStage[stage.id]} /> 
            ))
          )}
        </Box>
        
        <DragOverlay>
          {activeCandidate ? <CandidateCard candidate={activeCandidate} isOverlay={true} /> : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}

export default CandidatesPage;