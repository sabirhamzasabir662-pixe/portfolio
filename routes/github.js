const express = require('express');
const router = express.Router();
const { getGithubRepos } = require('../controllers/githubController');

// GET /api/github/repos
router.get('/repos', getGithubRepos);

module.exports = router;
