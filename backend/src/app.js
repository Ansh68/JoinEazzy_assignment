import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';

const app = express();

// Behind Render's proxy, trust one hop so rate limiting sees each visitor's real IP.
if (env.isProd) app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrls }));
app.use(express.json({ limit: '10kb' }));
if (!env.isProd) app.use(morgan('dev'));

app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

export default app;
