import app from './app.js';
import { env } from './config/env.js';

process.on('unhandledRejection', (reason) => console.error('Unhandled promise rejection:', reason));

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

const server = app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));

// Render sends SIGTERM on every deploy: finish in-flight requests, then exit.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  // Don't hang forever if a connection refuses to close.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
