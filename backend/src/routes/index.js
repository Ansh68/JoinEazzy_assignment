import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// Feature routes get mounted here as they're built:
// router.use('/auth', authRoutes);

export default router;
