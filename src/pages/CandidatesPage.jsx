// src/pages/CandidatesPage.jsx

import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates, useUpdateCandidateStage } from '../hooks/useCandidates';
import {
  Typography, Box, TextField, Avatar, Paper, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// --- DND-Kit Imports ---
import { DndContext, useDraggable, useDroppable, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useVirtualizer } from '@tanstack/react-virtual';

// --- Define the stages for our Kanban board ---
const STAGES = [
  { id: 'applied', title: 'Applied' },
  { id: 'screen', title: 'Screen' },
  { id: 'tech', title: 'Tech' },
  { id: 'offer', title: 'Offer' },
  { id: 'hired', title: 'Hired' },
];

// --- Visual Candidate Card Component (No changes needed) ---
function CandidateCard({ candidate, isOverlay = false, dragListeners, onClick }) {
  const colorIndex = candidate.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
  const pastelColors = ['#D4F0F0', '#cbd5f0ff', '#C4D7F2', '#eee3f7ff'];

  return (
    <Paper 
      onClick={onClick}
      sx={{ 
        p: 2, mb: 2, borderRadius: 2, 
        backgroundColor: pastelColors[colorIndex], 
        overflow: 'hidden', 
        position: 'relative',
        cursor: 'pointer' // Add pointer cursor to show it's clickable
      }}
    >
      {!isOverlay && (
        <Box
          {...dragListeners}
          // The handle also needs to stop the click from bubbling to the Paper
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
        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>{candidate.name.charAt(0)}</Avatar>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{candidate.name}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" noWrap sx={{ textOverflow: 'ellipsis' }}>{candidate.email}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Job Title Here</Typography>
    </Paper>
  );
}

// --- Draggable Wrapper Component ---
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

// --- NEW: The Virtualized List Component ---
const VirtualizedList = ({ items }) => {
  const Row = ({ index, style }) => {
    const candidate = items[index];
    return (
      <div style={style}>
        <Draggable key={candidate.id} id={candidate.id} data={{ candidate }}>
          <CandidateCard candidate={candidate} />
        </Draggable>
      </div>
    );
  };
  

  return (
    // AutoSizer provides the width and height of the parent container to the list
    <AutoSizer>
      {({ height, width }) => (
        // --- USE THE CORRECT COMPONENT NAME HERE ---
        <List
          height={height}
          itemCount={items.length}
          itemSize={120}
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};

// --- THIS IS THE NEW, CORRECT DroppableColumn ---
function DroppableColumn({ id, title, items }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // 1. Create a ref for the scrolling container
  const parentRef = useRef();

  // 2. Set up the virtualizer hook
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
      <Typography variant="h6" sx={{  p: 2, pb: 1, textAlign: 'center', flexShrink: 0 }}>{title}</Typography>
      
      {/* 3. This is the scrolling container */}
      <Box ref={parentRef} sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {/* 4. We need a container with the total calculated height */}
        <Box sx={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {/* 5. Map over the virtual items, not the full list */}
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

// --- Main Kanban Page Component ---
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
    <Box sx={{ p: 3, width: '100%', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* ... Header and Filters ... */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Candidates
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* TODO: Implement filter buttons (All, Job Role, Company) */}
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
          flexGrow: 1, // Make the board fill the available vertical space
          display: 'grid',
          // Create 5 columns that each take up an equal fraction (1fr) of the space.
          // This is the core of the horizontal layout.
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: 2,
          // IMPORTANT: Prevent the grid itself from overflowing its container
          overflow: 'hidden', 
        }}>
          {isLoading ? (
            <CircularProgress sx={{ margin: 'auto' }} />
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