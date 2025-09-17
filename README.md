# TalentFlow – A Mini Hiring Platform (Frontend)

TalentFlow is a comprehensive, frontend-only React application designed to simulate a real-world job management board for an HR team. This project was built as a technical assignment to demonstrate advanced frontend development skills, including complex state management, asynchronous API handling, and building a rich, interactive user interface.

The application is built entirely on the frontend, using **Mock Service Worker (MSW)** to simulate a backend API and **Dexie.js (IndexedDB)** for local data persistence. This creates a complete and realistic development environment that functions without a live server.

**Live Deployed Application:** [Your Vercel Deployment Link Here]

## Core Feature: The Jobs Board

This application focuses on delivering a complete, end-to-end workflow for managing job postings.

*   **Dynamic Job Listings:** View jobs in "Active" and "Archived" tabs, with real-time counts for each category.
*   **Full CRUD Functionality:**
    *   **Create:** Add new job postings through a detailed, validated form.
    *   **Read:** View jobs in a clean, card-based grid or on a dedicated, deep-linked detail page.
    *   **Update:** Edit all details of an existing job.
    *   **Delete:** Permanently remove job postings with a confirmation step.
*   **Archive/Unarchive with a Click:** Easily toggle a job's status between `active` and `archived` directly from the main board.
*   **Optimistic Updates:** All state-changing actions (archiving, deleting) are reflected in the UI **instantly**, providing a seamless user experience.
*   **Rollback on Failure:** The application simulates random network errors and correctly rolls back the UI to its original state if an update fails, ensuring data consistency.

## Tech Stack & Architectural Decisions

This project leverages a modern, professional frontend stack to meet the assignment's complex requirements.

*   **Framework:** **React.js** with **Vite** for a fast and modern development experience.
*   **UI Library:** **Material-UI (MUI)** was chosen for its comprehensive set of high-quality, accessible components, which accelerated the development of a complex and professional-looking UI.
*   **State Management:** **TanStack React Query** is used for all "server" state management.
    *   **Reasoning:** React Query is the industry standard for managing asynchronous data. It significantly simplifies data fetching, caching, and state synchronization. Its `useMutation` hook with `onMutate` and `onError` was essential for cleanly implementing the required optimistic updates and rollbacks.
*   **Mock API:** **Mock Service Worker (MSW)** was chosen to simulate the backend.
    *   **Reasoning:** MSW intercepts requests at the network level, meaning the application code (e.g., `fetch('/jobs')`) is identical to how it would be with a real backend. This makes the application "backend-agnostic" and easy to transition to a real API in the future.
*   **Local Persistence:** **Dexie.js** (a wrapper for IndexedDB) was used for the database.
    *   **Reasoning:** Dexie provides a clean, promise-based API and supports the advanced indexes (like multi-entry indexes) needed for future features like tag-based filtering.
*   **Data Modeling:** Data structures were pre-defined using **JSDoc** in a dedicated `types` directory. This provided type safety and autocompletion in a JavaScript environment, improving developer experience and reducing bugs.
*   **Routing:** **React Router v6** is used for all client-side routing.

## Getting Started

### Prerequisites
*   Node.js (v18 or later)
*   npm or yarn

### Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your GitHub Repository Link Here]
    cd talentflow
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`. The database will be automatically seeded with sample job data on the first run.

## Known Issues & Future Improvements

*   **Candidate and Assessment Features:** The UI and logic for the Candidate and Assessment management flows are not yet implemented. The data models and database tables have been designed to support their future development.
*   **Advanced Filtering:** The UI for filtering jobs by tags or searching by title has been designed but is not yet wired up to the mock API.
*   **Drag-and-Drop:** While the assignment mentioned drag-and-drop, a more direct and accessible click-to-archive button was implemented for a cleaner user experience.