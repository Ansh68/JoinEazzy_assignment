import { lazy } from 'react';

// Charts are loaded on demand, so recharts isn't downloaded until an admin opens a page that shows one.
export const CompletionBarChart = lazy(() => import('./CompletionBarChart'));
export const SubmissionDonut = lazy(() => import('./SubmissionDonut'));
