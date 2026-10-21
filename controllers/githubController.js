const { fetchUserRepos } = require('../services/githubService');

/**
 * GET /api/github/repos
 * Returns user public repositories, stats, and top languages cached for 1 hour
 */
async function getGithubRepos(req, res) {
  try {
    const data = await fetchUserRepos();
    res.json(data);
  } catch (error) {
    console.error('[-] Error in getGithubRepos controller:', error);
    const username = process.env.GITHUB_USERNAME || 'sabirhamza';
    res.status(500).json({
      success: false,
      username,
      profileUrl: `https://github.com/${username}`,
      error: 'Failed to retrieve GitHub repositories',
      repos: []
    });
  }
}

module.exports = {
  getGithubRepos
};
