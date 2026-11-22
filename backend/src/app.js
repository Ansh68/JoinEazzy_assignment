import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
if (!env.isProd) app.use(morgan('dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
