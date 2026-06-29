const express = require('express');
const analyzeRoutes = require('./analyzeRoutes');

const router = express.Router();

router.use(analyzeRoutes);

module.exports = router;
