const { dbAll, dbGet, dbRun } = require('../config/db');

/**
 * GET /api/projects
 * Returns all portfolio projects ordered by order_index
 */
async function getProjects(req, res) {
  try {
    const rows = await dbAll('SELECT * FROM projects ORDER BY order_index ASC, id ASC');
    
    // Parse JSON fields safely
    const formatted = rows.map((project) => ({
      ...project,
      highlights: safeJsonParse(project.highlights, []),
      tags: safeJsonParse(project.tags, [])
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[-] Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve projects' });
  }
}

/**
 * GET /api/projects/:id
 */
async function getProjectById(req, res) {
  try {
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({
      success: true,
      data: {
        ...project,
        highlights: safeJsonParse(project.highlights, []),
        tags: safeJsonParse(project.tags, [])
      }
    });
  } catch (error) {
    console.error('[-] Error fetching project by id:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve project' });
  }
}

/**
 * POST /api/projects
 * Allows adding new projects dynamically without touching code
 */
async function createProject(req, res) {
  try {
    const { title, client, category, sector, description, highlights, tags, featured = 1, order_index = 0 } = req.body;

    if (!title || !client || !description) {
      return res.status(400).json({
        success: false,
        error: 'title, client, and description are required fields.'
      });
    }

    const highlightsJson = Array.isArray(highlights) ? JSON.stringify(highlights) : JSON.stringify([]);
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);

    const result = await dbRun(`
      INSERT INTO projects (title, client, category, sector, description, highlights, tags, featured, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, client, category || 'Web Application', sector || 'Enterprise', description, highlightsJson, tagsJson, featured, order_index]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      projectId: result.id
    });
  } catch (error) {
    console.error('[-] Error creating project:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
}

function safeJsonParse(jsonString, fallback) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject
};
