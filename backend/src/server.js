import app from './app.js';
import { env } from './config/env.js';

process.on('unhandledRejection', (reason) => console.error('Unhandled promise rejection:', reason));

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
