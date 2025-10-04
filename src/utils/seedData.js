// src/utils/seedData.js

import { db } from '../db';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

const CANDIDATE_STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

// --- Helper Functions to Generate Realistic Data ---

/**
 * Creates a single fake HR Manager.
 * @returns {import('../types').HRManager}
 */
function createHRManager(name, email, password) {
  return {
    id: uuidv4(),
    name,
    email,
    password, // In a real app, this would be hashed
    role: 'manager',
    avatarUrl: faker.image.avatar(),
    assignedJobs: [],
    personalDetails: {
      phone: faker.phone.number(),
      gender: faker.person.sex(),
      city: faker.location.city(),
      dateOfBirth: faker.date.birthdate().toISOString(),
    },
    workExperience: [],
    createdAt: faker.date.past().toISOString(),
  };
}


/**
 * Creates a single fake Job.
 * @returns {import('../types').Job}
 */
function createJob(order) {
  const title = faker.person.jobTitle();
  return {
    id: uuidv4(),
    title,
    slug: faker.helpers.slugify(title).toLowerCase(),
    description: faker.lorem.paragraphs(3),
    company: {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      avatarUrl: faker.image.avatar(),
    },
    industry: faker.person.jobArea(),
    jobType: faker.helpers.arrayElement(['Full-Time', 'Internship', 'Contract']),
    salary: {
      min: faker.number.int({ min: 60000, max: 100000 }),
      max: faker.number.int({ min: 110000, max: 180000 }),
      currency: 'USD',
      period: 'Annual',
    },
    status: faker.helpers.arrayElement(['active', 'archived']),
    location: faker.location.city(),
    workplaceType: faker.helpers.arrayElement(['On-site', 'Remote', 'Hybrid']),
    tags: faker.helpers.arrayElements(['React', 'Node.js', 'Remote', 'TypeScript', 'Agile'], { min: 1, max: 4 }),
    order,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
}
// src/utils/seedData.js

/**
 * Creates a single fake Candidate.
 * @param {string} jobId
 * @param {string} status
 * @returns {import('../types').Candidate}
 */
function createCandidate(jobId, status) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  const randomStage = faker.helpers.arrayElement(CANDIDATE_STAGES);
  
  const appliedJobs = [{ jobId, status, appliedOn: faker.date.recent().toISOString() }];
  const appliedJobIds = appliedJobs.map(app => app.jobId);
  
  const notes = [];
  if (faker.datatype.boolean(0.3)) { // 30% chance of having a note
    notes.push({
      id: uuidv4(),
      content: faker.lorem.sentence(),
      authorId: 'hr-admin-1', // Placeholder
      authorName: 'Admin User',
      createdAt: faker.date.recent().toISOString(),
    });
  }

  return {
    id: uuidv4(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }),
    password: 'password123',
    role: 'candidate',
    avatarUrl: faker.image.avatar(),
    stage: randomStage,
    personalDetails: { /* ... */ },
    education: [],
    workExperience: [],
    projects: [],
    skills: faker.helpers.arrayElements(['JavaScript', 'HTML', 'CSS', 'REST APIs', 'Git'], { min: 2, max: 4 }),
    appliedJobs: appliedJobs,
    appliedJobIds: appliedJobIds, 
    achievements: [],
    resumeUrl: '',
    notes: notes,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
}

/**
 * --- The Main Seeding Function ---
 * Clears and populates the database with fresh data.
 */
export async function seedDatabase() {
  try {
    console.log('--- DATABASE SEEDING STARTED ---');
    
    // Use a transaction for performance and data integrity
    await db.transaction('rw', db.hrManagers, db.jobs, db.candidates, db.candidateTimeline, async () => {
      // 1. Clear all existing data
      await Promise.all([
        db.hrManagers.clear(),
        db.jobs.clear(),
        db.candidates.clear(),
        db.candidateTimeline.clear(),
      ]);
      console.log('Cleared all tables.');

      // 2. Create HR Managers
      const managers = [
        createHRManager('Admin User', 'admin@talentflow.com', 'admin123'),
        createHRManager('Jane Doe', 'jane@talentflow.com', 'jane123'),
      ];
      await db.hrManagers.bulkAdd(managers);
      console.log(`Created ${managers.length} HR managers. Login with 'admin@talentflow.com' and 'admin123'.`);

      // 3. Create 25 Jobs
      const jobs = [];
      for (let i = 0; i < 25; i++) {
        jobs.push(createJob(i + 1));
      }
      await db.jobs.bulkAdd(jobs);
      console.log('Created 25 jobs.');

      // 4. Create 1000 Candidates and initial timeline events
      const candidates = [];
      const timelineEvents = [];
      const jobIds = jobs.map(j => j.id);
      const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

      for (let i = 0; i < 1000; i++) {
        const randomJobId = faker.helpers.arrayElement(jobIds);
        const randomStage = faker.helpers.arrayElement(stages);
        const candidate = createCandidate(randomJobId, randomStage);
        candidates.push(candidate);
        
        // Create an "Applied" event for their timeline
        timelineEvents.push({
          candidateId: candidate.id,
          jobId: randomJobId,
          actionType: 'Applied',
          details: { note: 'Candidate applied via external job board.' },
          actorId: managers[0].id,
          actorName: managers[0].name,
          timestamp: candidate.createdAt,
        });
      }
      await db.candidates.bulkAdd(candidates);
      await db.candidateTimeline.bulkAdd(timelineEvents);
      console.log('Created 1000 candidates with initial timeline events.');
    });

    console.log('--- ✅ DATABASE SEEDING COMPLETE ---');
    // alert('Database has been successfully seeded!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    alert('Error seeding database. Check the console for details.');
  }
}