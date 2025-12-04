import express from 'express';
import { analyzeStories, getLatestAnalysis } from '../jobs/storyAnalyzer.js';
import { downloadFromS3, getLatestFile } from '../services/s3Service.js';
import { parseFile } from '../services/csvParser.js';

const router = express.Router();

/**
 * GET /api/stories
 * Get all stories from latest file
 */
router.get('/', async (req, res) => {
    try {
        const latestFileName = await getLatestFile('stories');
        const fileBuffer = await downloadFromS3(latestFileName);
        const stories = await parseFile(fileBuffer, latestFileName);

        res.json({
            success: true,
            data: stories,
            sourceFile: latestFileName,
            count: stories.length
        });
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stories/analysis
 * Get latest analysis results
 */
router.get('/analysis', async (req, res) => {
    try {
        const analysis = await getLatestAnalysis();

        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'No analysis found. Run analysis first.'
            });
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Error fetching analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/stories/analyze
 * Trigger manual analysis
 */
router.post('/analyze', async (req, res) => {
    try {
        const analysis = await analyzeStories();

        res.json({
            success: true,
            data: analysis,
            message: 'Analysis completed successfully'
        });
    } catch (error) {
        console.error('Error running analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stories/by-project
 * Get stories grouped by project
 */
router.get('/by-project', async (req, res) => {
    try {
        const latestFileName = await getLatestFile('stories');
        const fileBuffer = await downloadFromS3(latestFileName);
        const stories = await parseFile(fileBuffer, latestFileName);

        const byProject = stories.reduce((acc, story) => {
            const project = story.projectDescription || 'Unassigned';
            if (!acc[project]) {
                acc[project] = [];
            }
            acc[project].push(story);
            return acc;
        }, {});

        res.json({
            success: true,
            data: byProject
        });
    } catch (error) {
        console.error('Error fetching stories by project:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stories/by-epic
 * Get stories grouped by epic
 */
router.get('/by-epic', async (req, res) => {
    try {
        const latestFileName = await getLatestFile('stories');
        const fileBuffer = await downloadFromS3(latestFileName);
        const stories = await parseFile(fileBuffer, latestFileName);

        const byEpic = stories.reduce((acc, story) => {
            const epic = story.epicDescription || 'Unassigned';
            if (!acc[epic]) {
                acc[epic] = [];
            }
            acc[epic].push(story);
            return acc;
        }, {});

        res.json({
            success: true,
            data: byEpic
        });
    } catch (error) {
        console.error('Error fetching stories by epic:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stories/:id
 * Get single story by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const latestFileName = await getLatestFile('stories');
        const fileBuffer = await downloadFromS3(latestFileName);
        const stories = await parseFile(fileBuffer, latestFileName);

        const story = stories.find(s => s.id === id);

        if (!story) {
            return res.status(404).json({
                success: false,
                error: 'Story not found'
            });
        }

        res.json({
            success: true,
            data: story
        });
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
