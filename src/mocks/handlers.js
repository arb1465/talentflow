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
  
  http.get('/jobs/list', async () => {
    console.log('[MSW] Matched GET /jobs/list'); // Add this for definitive proof
    const allJobs = await db.jobs.toArray();
    const jobList = allJobs.map(job => ({ id: job.id, title: job.title, company: job.company }));
    await delay(300);
    return HttpResponse.json(jobList);
  }),

  // =================================================================
  // == your CANDIDATE handlers below...
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


  
  /**
   * Handler for: POST /candidates/:candidateId/notes
   * Adds a new note to a candidate.
   */
  http.post('/candidates/:candidateId/notes', async ({ request, params }) => {
    try {
      simulateRandomError();
      const { candidateId } = params;
      const { content, authorId, authorName } = await request.json();

      if (!content) {
        return HttpResponse.json({ error: 'Note content cannot be empty.' }, { status: 400 });
      }

      const candidate = await db.candidates.get(candidateId);
      if (!candidate) {
        return HttpResponse.json({ error: 'Candidate not found.' }, { status: 404 });
      }

      const newNote = {
        id: uuidv4(),
        content,
        authorId,
        authorName,
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(candidate.notes || []), newNote];

      await db.candidates.update(candidateId, { notes: updatedNotes });

      await delay(FAKE_DELAY_MS);
      return HttpResponse.json(newNote, { status: 201 });

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  
  // =================================================================
  // ==  your ASSESSMENT handlers below...
  // =================================================================

  
  /**
   * Handler for: GET /assessments
   * Fetches a list of all assessments, enriched with job details.
   */
  http.get('/assessments', async () => {
    try {
      // 1. Get all assessments from the database
      const allAssessments = await db.assessments.toArray();
      
      // 2. Enhance each assessment with details from its corresponding job
      const enrichedAssessments = await Promise.all(
        allAssessments.map(async (assessment) => {
          const job = await db.jobs.get(assessment.jobId);
          return {
            ...assessment,
            jobRole: job ? job.title : 'N/A',
            companyName: job ? job.company.name : 'N/A',
          };
        })
      );

      await delay(FAKE_DELAY_MS);
      return HttpResponse.json(enrichedAssessments);

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),


  http.get('/assessments/:jobId', async ({ params }) => {
    const { jobId } = params;
    
    // Find the assessment where the jobId matches. Since we have one per job, we use .first()
    const assessment = await db.assessments.where('jobId').equals(jobId).first();
    
    await delay(FAKE_DELAY_MS);

    if (assessment) {
      return HttpResponse.json(assessment);
    }
    
    // If no assessment exists for this job, return a 404.
    // This tells the UI it needs to create a new one.
    return new HttpResponse(null, { status: 404, statusText: 'Assessment Not Found' });
  }),


  /**
   * Handler for: PUT /assessments/:jobId
   * Creates or updates the assessment for a specific job.
   * 'PUT' is used here because we are replacing the entire assessment document.
   */
  http.put('/assessments/:jobId', async ({ request, params }) => {
    try {
      simulateRandomError();
      const { jobId } = params;
      const updatedAssessmentData = await request.json();

      await db.assessments.put({
        ...updatedAssessmentData,
        jobId: jobId, // Ensure the jobId is set correctly
        updatedAt: new Date().toISOString(),
      });
      
      await delay(FAKE_DELAY_MS);
      const savedAssessment = await db.assessments.where({ jobId: jobId }).first();
      
      return HttpResponse.json(savedAssessment, { status: 200 });

    } 
    catch (error) {
      
      console.error("[MSW] Error in PUT /assessments/:jobId:", error);
      
      return new HttpResponse(
        JSON.stringify({ error: error.message || 'A random server error occurred!' }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }),

  
  /**
   * Handler for: DELETE /assessments/:jobId
   * Deletes an assessment associated with a specific job.
   */
  
  http.delete('/assessments/:jobId', async ({ params }) => {
    try {
      simulateRandomError();
      const { jobId } = params;

      // 1. First, find the assessment using the 'jobId' index.
      const assessmentToDelete = await db.assessments.where({ jobId: jobId }).first();

      if (!assessmentToDelete) {
        return HttpResponse.json({ error: 'Assessment for this job not found.' }, { status: 404 });
      }

      // 2. Then, use the document's actual primary key ('id') to delete it.
      await db.assessments.delete(assessmentToDelete.id);
      

      await delay(FAKE_DELAY_MS);
      return new HttpResponse(null, { status: 204 });

    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),
];