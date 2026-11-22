const router = require('express').Router();

router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// Feature routers are mounted here as each module is built:
// router.use('/auth', require('./modules/auth/auth.routes'));

module.exports = router;
