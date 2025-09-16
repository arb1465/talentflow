/**
 * @typedef {import('./CandidateNote.js').CandidateNote} CandidateNote
 */
/**
 * @typedef {object} AppliedJob
 * @property {number} jobId - The ID of the job they applied to.
 * @property {string} status - The candidate's specific status for this job.
 * @property {string} appliedOn - ISO date string of when they applied.
 */

/**
 * @typedef {Object} Candidate
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {'candidate'} role
 * @property {'applied'|'screen'|'tech'|'offer'|'hired'|'rejected'} stage
 * @property {string} password - In a real app, this would be hashed.
 * @property {string} avatarUrl
 * @property {{dateOfBirth: string, gender: string, city: string, phone: string}} personalDetails
 * @property {Array<{college: string, degree: string, course: string, startYear: number, endYear: number, marks: string}>} education
 * @property {Array<{company: string, role: string, duration: string, description: string, locationType: string}>} workExperience
 * @property {Array<{name: string, description: string, technologies: string[], link?: string, associatedWith?: string}>} projects
 * @property {string[]} skills
 * @property {AppliedJob[]} appliedJobs
 * @property {string[]} appliedJobIds
 * @property {string[]} achievements
 * @property {string} resumeUrl
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {CandidateNote[]} notes
 */

export {};