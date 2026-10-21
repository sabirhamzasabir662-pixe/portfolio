const https = require('https');

// In-memory cache with 1-hour Time-To-Live (TTL)
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
let repoCache = {
  data: null,
  timestamp: 0,
  username: null
};

/**
 * Fetches public repositories from GitHub API with 1-hour caching
 * @returns {Promise<Object>}
 */
async function fetchUserRepos() {
  const username = process.env.GITHUB_USERNAME || 'sabirhamzasabir662-pixe';
  const token = process.env.GITHUB_TOKEN;
  const profileUrl = `https://github.com/${username}`;

  // Check valid cache
  const now = Date.now();
  if (
    repoCache.data &&
    repoCache.username === username &&
    now - repoCache.timestamp < CACHE_DURATION_MS
  ) {
    return {
      ...repoCache.data,
      cached: true,
      cachedAt: new Date(repoCache.timestamp).toISOString()
    };
  }

  const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`;

  const headers = {
    'User-Agent': 'Hamza-Portfolio-App/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (token && token.trim() && token !== 'your_optional_github_token_here') {
    headers['Authorization'] = `token ${token.trim()}`;
  }

  try {
    const rawData = await httpsGetJson(endpoint, headers);

    if (!Array.isArray(rawData)) {
      throw new Error(rawData.message || 'Unexpected response format from GitHub');
    }

    // Skip forked repos by default
    const publicOwnRepos = rawData.filter((r) => !r.fork);

    // Format repo cards
    const repos = publicOwnRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || 'No description provided.',
      language: repo.language || 'Code',
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      html_url: repo.html_url,
      homepage: repo.homepage || null
    }));

    // Calculate language frequencies for top languages summary
    const languageCounts = {};
    repos.forEach((r) => {
      const lang = r.language || 'Other';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const payload = {
      success: true,
      username,
      profileUrl,
      summary: {
        totalPublicRepos: repos.length,
        topLanguages
      },
      repos
    };

    // Store in cache
    repoCache = {
      data: payload,
      timestamp: now,
      username
    };

    return {
      ...payload,
      cached: false
    };

  } catch (error) {
    console.warn(`[!] GitHub API notice (${error.message}). Returning graceful fallback.`);
    return {
      success: false,
      username,
      profileUrl,
      error: error.message || 'Unable to load repositories',
      summary: {
        totalPublicRepos: 0,
        topLanguages: []
      },
      repos: []
    };
  }
}

/**
 * Native Node.js HTTPS GET helper
 */
function httpsGetJson(url, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON received from GitHub API'));
          }
        } else {
          try {
            const errObj = JSON.parse(data);
            reject(new Error(errObj.message || `GitHub API error (Status: ${res.statusCode})`));
          } catch {
            reject(new Error(`GitHub API HTTP ${res.statusCode}`));
          }
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('GitHub API request timed out'));
    });

    req.end();
  });
}

module.exports = {
  fetchUserRepos
};
