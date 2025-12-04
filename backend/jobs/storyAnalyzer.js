import { downloadFromS3, getLatestFile } from '../services/s3Service.js';
import { parseFile } from '../services/csvParser.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Calculate remaining hours for a story
 * @param {Object} story - Story object
 * @returns {number} Remaining hours
 */
const getRemainingHours = (story) => {
    return Math.max(0, story.duration - story.timeSpent);
};

/**
 * Calculate days until due date
 * @param {string} dueDate - Due date ISO string
 * @returns {number} Days until due
 */
const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return Infinity;

    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Check if story is at risk of missing deadline
 * @param {Object} story - Story object
 * @returns {boolean} True if at risk
 */
const isAtRisk = (story) => {
    const remainingHours = getRemainingHours(story);
    const daysUntilDue = getDaysUntilDue(story.dueDate);

    // Assuming 8 working hours per day
    const workingHoursPerDay = 8;
    const daysNeeded = Math.ceil(remainingHours / workingHoursPerDay);

    // Story is at risk if days needed >= days until due
    return daysNeeded >= daysUntilDue && daysUntilDue > 0;
};

/**
 * Calculate urgency score for prioritization
 * Higher score = more urgent
 * @param {Object} story - Story object
 * @returns {number} Urgency score
 */
const calculateUrgencyScore = (story) => {
    const remainingHours = getRemainingHours(story);
    const daysUntilDue = getDaysUntilDue(story.dueDate);

    // Priority weights
    const priorityWeights = {
        high: 3,
        medium: 2,
        low: 1
    };

    const priorityWeight = priorityWeights[story.priority] || 1;

    // Status weights (lower = more urgent to start)
    const statusWeights = {
        'To Do': 1,
        'Reopen': 1.2,
        'In progress': 0.5,
        'In test': 0.3,
        'In deploy': 0.1,
        'Closed': 0,
        'Rejected': 0,
        "Won't do": 0
    };

    const statusWeight = statusWeights[story.status] || 1;

    // Calculate urgency
    // Formula: (priority * status weight * remaining hours) / days until due
    // Higher value = more urgent
    if (daysUntilDue <= 0) {
        return priorityWeight * statusWeight * 1000; // Overdue stories get max urgency
    }

    const urgency = (priorityWeight * statusWeight * remainingHours) / Math.max(daysUntilDue, 0.1);

    return urgency;
};

/**
 * Categorize stories based on analysis
 * @param {Array} stories - Array of story objects
 * @returns {Object} Categorized stories
 */
const categorizeStories = (stories) => {
    const activeStatuses = ['To Do', 'In progress', 'In test', 'In deploy', 'Reopen'];

    const activeStories = stories.filter(story =>
        activeStatuses.includes(story.status)
    );

    const overdue = activeStories.filter(story =>
        getDaysUntilDue(story.dueDate) < 0
    );

    const atRisk = activeStories.filter(story =>
        !overdue.includes(story) && isAtRisk(story)
    );

    const needToStart = activeStories
        .filter(story =>
            story.status === 'To Do' &&
            !overdue.includes(story) &&
            !atRisk.includes(story)
        )
        .map(story => ({
            ...story,
            urgencyScore: calculateUrgencyScore(story),
            daysUntilDue: getDaysUntilDue(story.dueDate),
            remainingHours: getRemainingHours(story)
        }))
        .sort((a, b) => b.urgencyScore - a.urgencyScore)
        .slice(0, 10); // Top 10 stories to start

    const inProgress = activeStories.filter(story =>
        ['In progress', 'In test', 'In deploy'].includes(story.status)
    );

    return {
        overdue: overdue.map(story => ({
            ...story,
            urgencyScore: calculateUrgencyScore(story),
            daysOverdue: Math.abs(getDaysUntilDue(story.dueDate)),
            remainingHours: getRemainingHours(story)
        })).sort((a, b) => b.urgencyScore - a.urgencyScore),

        atRisk: atRisk.map(story => ({
            ...story,
            urgencyScore: calculateUrgencyScore(story),
            daysUntilDue: getDaysUntilDue(story.dueDate),
            remainingHours: getRemainingHours(story)
        })).sort((a, b) => b.urgencyScore - a.urgencyScore),

        needToStart,

        inProgress: inProgress.map(story => ({
            ...story,
            daysUntilDue: getDaysUntilDue(story.dueDate),
            remainingHours: getRemainingHours(story),
            progressPercentage: ((story.timeSpent / story.duration) * 100).toFixed(1)
        })),

        summary: {
            totalActive: activeStories.length,
            overdueCount: overdue.length,
            atRiskCount: atRisk.length,
            inProgressCount: inProgress.length,
            toDoCount: activeStories.filter(s => s.status === 'To Do').length
        }
    };
};

/**
 * Main analysis function
 * Fetches latest file from S3, parses it, and analyzes stories
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeStories = async () => {
    try {
        console.log('Starting story analysis...');

        // Get latest file from S3
        const latestFileName = await getLatestFile('stories');
        console.log(`Latest file: ${latestFileName}`);

        // Download file
        const fileBuffer = await downloadFromS3(latestFileName);

        // Parse file
        const stories = await parseFile(fileBuffer, latestFileName);
        console.log(`Parsed ${stories.length} stories`);

        // Analyze and categorize
        const analysis = categorizeStories(stories);

        // Save analysis results locally
        const resultsDir = path.join(process.cwd(), 'analysis-results');
        await fs.mkdir(resultsDir, { recursive: true });

        const timestamp = new Date().toISOString().split('T')[0];
        const resultsFile = path.join(resultsDir, `analysis-${timestamp}.json`);

        await fs.writeFile(
            resultsFile,
            JSON.stringify({
                timestamp: new Date().toISOString(),
                sourceFile: latestFileName,
                analysis
            }, null, 2)
        );

        console.log(`Analysis saved to: ${resultsFile}`);
        console.log('Summary:', analysis.summary);

        return analysis;
    } catch (error) {
        console.error('Error during story analysis:', error);
        throw error;
    }
};

/**
 * Get latest analysis results
 * @returns {Promise<Object>} Latest analysis
 */
export const getLatestAnalysis = async () => {
    try {
        const resultsDir = path.join(process.cwd(), 'analysis-results');
        const files = await fs.readdir(resultsDir);

        if (files.length === 0) {
            return null;
        }

        // Get most recent file
        const latestFile = files
            .filter(f => f.startsWith('analysis-'))
            .sort()
            .reverse()[0];

        const filePath = path.join(resultsDir, latestFile);
        const content = await fs.readFile(filePath, 'utf-8');

        return JSON.parse(content);
    } catch (error) {
        console.error('Error getting latest analysis:', error);
        return null;
    }
};

export default {
    analyzeStories,
    getLatestAnalysis,
    categorizeStories
};
