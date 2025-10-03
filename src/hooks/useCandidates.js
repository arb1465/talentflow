// src/hooks/useCandidates.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { db } from '../db'; // We might need this for some direct interactions

// --- API Fetching Functions ---

/**
 * Fetches a list of candidates from the mock API.
 * @param {object} filters - The filters to apply.
 * @param {string} filters.stage - Filter by candidate stage.
 * @param {string} filters.search - Search by name or email.
 */
const fetchCandidates = async ({ stage, search }) => {
  const queryParams = new URLSearchParams();
  if (stage && stage !== 'all') queryParams.set('stage', stage);
  if (search) queryParams.set('search', search);

  const response = await fetch(`/candidates?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

/**
 * Updates a candidate's stage.
 * @param {object} data
 * @param {string} data.candidateId
 * @param {string} data.stage
 */
const updateCandidateStage = async ({ candidateId, stage }) => {
  const response = await fetch(`/candidates/${candidateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
  if (!response.ok) throw new Error('Failed to update candidate stage.');
  return response.json();
};


// --- Custom Hooks ---

/**
 * Hook to fetch and manage the list of candidates.
 * @param {object} filters
 */
export function useCandidates(filters) {
  return useQuery({
    queryKey: ['candidates', filters], // The query key now includes filters
    queryFn: () => fetchCandidates(filters),
  });
}

/**
 * Hook to provide the mutation for updating a candidate's stage.
 */
export function useUpdateCandidateStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCandidateStage,
    // We will use optimistic updates for the Kanban board
    onMutate: async ({ candidateId, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      const previousCandidates = queryClient.getQueryData(['candidates']);
      
      // Optimistically update the local cache
      queryClient.setQueryData(['candidates'], (oldData) =>
        oldData?.map(c => c.id === candidateId ? { ...c, stage } : c)
      );
      
      return { previousCandidates };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCandidates) {
        queryClient.setQueryData(['candidates'], context.previousCandidates);
      }
    },
    onSettled: (updatedCandidate, error, { candidateId }) => {
      // 1. Invalidate the main list of all candidates (for the Kanban board)
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      
      // 2. ALSO invalidate the specific query for the candidate we just updated.
      //    This ensures the detail page will refetch fresh data.
      queryClient.invalidateQueries({ queryKey: ['candidate', candidateId] });
    },
  });
}

