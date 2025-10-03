// src/mocks/handlers.js

import { http, HttpResponse, delay } from 'msw';
import { db } from '../db'; // Import your Dexie database instance
import { v4 as uuidv4 } from 'uuid';

// --- Configuration for Simulation ---
const FAKE_DELAY_MS = 500; // Simulate a 500ms network delay
const FAKE_ERROR_RATE = 0.1; // 10% chance of a random server error on writes

// --- Helper to simulate a random error ---
const simulateRandomError = () => {
  if (Math.random() < FAKE_ERROR_RATE) {
    throw new Error('A random server error occurred! Please try again.');
  }
};

export const handlers = [
  // =================================================================
  // ==  JOB HANDLERS
  // =================================================================

   http.get('/jobs', async () => {
    try {
      // 1. Fetch the raw list of jobs from the database
      const jobsFromDB = await db.jobs.toArray();

      // 2. Enhance each job with its candidate count
      const enhancedJobs = await Promise.all(
        jobsFromDB.map(async (job) => {
          // For each job, perform a query to count the candidates
          const candidatesCount = await db.candidates
            .where('appliedJobIds')
            .equals(job.id)
            .count();
          
          // Return a new object that includes the job data AND the count
          return { ...job, candidatesCount };
        })
      );

      // 3. Simulate a network delay
      await delay(FAKE_DELAY_MS);
      
      // 4. Return the final, enhanced list of jobs
      return HttpResponse.json(enhancedJobs);

    } catch (error) {
      console.error("Error in GET /jobs handler:", error);

      return HttpResponse.json(
        { error: error.message || 'A server error occurred.' }, 
        { status: 500 }
      );
    }
  }),


  /**
   * Handler for: GET /jobs/:jobId
   * Fetches a single job by its ID.
   */
  http.get('/jobs/:jobId', async ({ params }) => {
    const { jobId } = params;
    const job = await db.jobs.get(jobId);
    
    await delay(FAKE_DELAY_MS);
    
    if (job) {
      return HttpResponse.json(job);
    }
    return new HttpResponse(null, { status: 404, statusText: 'Job Not Found' });
  }),


  /**
   * Handler for: POST /jobs
   * Creates a new job.
   */
  http.post('/jobs', async ({ request }) => {
    try {
      simulateRandomError();
      const newJobData = await request.json();

      // Basic validation
      if (!newJobData.title) {
        return HttpResponse.json({ error: 'Job title is required.' }, { status: 400 });
      }

      const newJob = {
        id: uuidv4(),
        slug: newJobData.title.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
        order: (await db.jobs.count()) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newJobData, // Spread the rest of the data from the form
      };
      
      await db.jobs.add(newJob);
      await delay(FAKE_DELAY_MS);
      
      return HttpResponse.json(newJob, { status: 201 });

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  /**
   * Handler for: PATCH /jobs/:jobId
   * Updates an existing job.
   */
  http.patch('/jobs/:jobId', async ({ request, params }) => {
    try {
      simulateRandomError();
      const { jobId } = params;
      const updates = await request.json();

      const updatedCount = await db.jobs.update(jobId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      if (updatedCount === 0) {
        return new HttpResponse(null, { status: 404, statusText: 'Job Not Found' });
      }
      
      await delay(FAKE_DELAY_MS);
      const updatedJob = await db.jobs.get(jobId);
      return HttpResponse.json(updatedJob);

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),
  
  /**
   * Handler for: PATCH /jobs/:jobId/reorder
   * Handles drag-and-drop reordering.
   */
  http.patch('/jobs/:jobId', async ({ request, params }) => {
    try {
      simulateRandomError(); // This will help us test the rollback
      const { jobId } = params;
      const updates = await request.json(); // This will be { status: 'archived' }

      await db.jobs.update(jobId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await delay(FAKE_DELAY_MS);
      const updatedJob = await db.jobs.get(jobId);
      return HttpResponse.json(updatedJob);

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.delete('/jobs/:jobId', async ({ params }) => {
    try {
      simulateRandomError(); // For testing error states
      const { jobId } = params;

      // Find the job first to make sure it exists
      const jobExists = await db.jobs.get(jobId);
      if (!jobExists) {
        return new HttpResponse(JSON.stringify({ error: 'Job not found.' }), { status: 404 });
      }

      // Delete the job from the Dexie database
      await db.jobs.delete(jobId);
      
      await delay(FAKE_DELAY_MS);
      
      // Send a success response with no content
      return new HttpResponse(null, { status: 204 });

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // =================================================================
  // ==  Add your CANDIDATE and ASSESSMENT handlers below...
  // =================================================================

  http.get('/candidates', async ({ request }) => {
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');
    const search = url.searchParams.get('search');
    
    // Start with the full collection
    let candidateQuery = db.candidates;

    // Apply "server-like" filter
    if (stage && stage !== 'all') {
      candidateQuery = candidateQuery.where('stage').equals(stage);
    }
    
    let candidates = await candidateQuery.toArray();

    // Apply client-side search (as per assignment) after fetching
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(lowercasedSearch) ||
        c.email.toLowerCase().includes(lowercasedSearch)
      );
    }

    await delay(FAKE_DELAY_MS);
    return HttpResponse.json(candidates);
  }),


  /**
   * Handler for: GET /candidates/:candidateId
   * Fetches a single candidate and their timeline.
   */
  http.get('/candidates/:candidateId', async ({ params }) => {
    const { candidateId } = params;
    
    // 1. Fetch the main candidate profile from Dexie
    const candidate = await db.candidates.get(candidateId);
    
    if (!candidate) {
      return new HttpResponse(null, { status: 404, statusText: 'Candidate Not Found' });
    }

    // 2. Also fetch the timeline events for this candidate
    const timeline = await db.candidateTimeline
      .where('candidateId').equals(candidateId)
      .sortBy('timestamp');
    
    await delay(500); // Simulate network latency
    
    // 3. Return the combined data as a single JSON object
    return HttpResponse.json({ ...candidate, timeline });
  }),



  /**
   * Handler for: PATCH /candidates/:candidateId
   * Updates a candidate's details (primarily their stage for the Kanban board).
   */
  http.patch('/candidates/:candidateId', async ({ request, params }) => {
    try {
      simulateRandomError();
      const { candidateId } = params;
      const updates = await request.json(); // e.g., { stage: 'tech' }

      const originalCandidate = await db.candidates.get(candidateId);
      if (!originalCandidate) {
        return new HttpResponse(null, { status: 404, statusText: 'Candidate Not Found' });
      }

      // Log the stage transition to the timeline
      if (updates.stage && updates.stage !== originalCandidate.stage) {
        // If it is, create a new timeline event
        await db.candidateTimeline.add({
          // id will be auto-incremented
          candidateId: candidateId,
          jobId: originalCandidate.appliedJobs[0]?.jobId || null, // Get jobId from the application
          actionType: 'Stage Change',
          details: { 
            fromStage: originalCandidate.stage, 
            toStage: updates.stage 
          },
          actorId: 'hr-admin-1', // Placeholder for the logged-in HR user
          actorName: 'Admin User',
          timestamp: new Date().toISOString(),
        });
      }

      await db.candidates.update(candidateId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await delay(FAKE_DELAY_MS);
      const updatedCandidate = await db.candidates.get(candidateId);
      return HttpResponse.json(updatedCandidate);

    } 
    catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

];