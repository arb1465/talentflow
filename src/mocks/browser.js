import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

// Setup the worker with our handlers
export const worker = setupWorker(...handlers);

// Start the worker
export const startMSW = async () => {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
    console.log('MSW enabled');
  }
};
