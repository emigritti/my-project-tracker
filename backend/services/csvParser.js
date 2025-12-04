import csv from 'csv-parser';
import { Readable } from 'stream';
import XLSX from 'xlsx';

/**
 * Parse CSV buffer to JSON
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} Parsed stories
 */
export const parseCSV = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(buffer);

        stream
            .pipe(csv())
            .on('data', (data) => results.push(normalizeStory(data)))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

/**
 * Parse Excel buffer to JSON
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} Parsed stories
 */
export const parseExcel = (buffer) => {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        return jsonData.map(normalizeStory);
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw error;
    }
};

/**
 * Normalize story data to consistent format
 * @param {Object} data - Raw story data
 * @returns {Object} Normalized story
 */
const normalizeStory = (data) => {
    return {
        id: data.id || data.ID || data.Id,
        description: data.description || data.Description || '',
        epicDescription: data.epicDescription || data.epic_description || data['Epic Description'] || '',
        projectDescription: data.projectDescription || data.project_description || data['Project Description'] || '',
        dueDate: parseDate(data.dueDate || data.due_date || data['Due Date']),
        duration: parseFloat(data.duration || data.Duration || 0),
        timeSpent: parseFloat(data.timeSpent || data.time_spent || data['Time Spent'] || 0),
        status: normalizeStatus(data.status || data.Status || 'To Do'),
        priority: normalizePriority(data.priority || data.Priority || 'medium')
    };
};

/**
 * Parse date string to ISO format
 * @param {string} dateStr - Date string
 * @returns {string} ISO date string
 */
const parseDate = (dateStr) => {
    if (!dateStr) return null;

    try {
        // Handle Excel serial date numbers
        if (typeof dateStr === 'number') {
            const date = XLSX.SSF.parse_date_code(dateStr);
            return new Date(date.y, date.m - 1, date.d).toISOString();
        }

        // Handle string dates
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (error) {
        console.error('Error parsing date:', dateStr, error);
        return null;
    }
};

/**
 * Normalize status values
 * @param {string} status - Raw status
 * @returns {string} Normalized status
 */
const normalizeStatus = (status) => {
    const statusMap = {
        'todo': 'To Do',
        'to do': 'To Do',
        'wontdo': "Won't do",
        "won't do": "Won't do",
        'inprogress': 'In progress',
        'in progress': 'In progress',
        'intest': 'In test',
        'in test': 'In test',
        'indeploy': 'In deploy',
        'in deploy': 'In deploy',
        'closed': 'Closed',
        'rejected': 'Rejected',
        'reopen': 'Reopen'
    };

    const normalized = statusMap[status.toLowerCase()];
    return normalized || status;
};

/**
 * Normalize priority values
 * @param {string} priority - Raw priority
 * @returns {string} Normalized priority
 */
const normalizePriority = (priority) => {
    const priorityMap = {
        'h': 'high',
        'high': 'high',
        'm': 'medium',
        'med': 'medium',
        'medium': 'medium',
        'l': 'low',
        'low': 'low'
    };

    const normalized = priorityMap[priority.toLowerCase()];
    return normalized || 'medium';
};

/**
 * Parse file based on extension
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - File name with extension
 * @returns {Promise<Array>} Parsed stories
 */
export const parseFile = async (buffer, fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();

    if (extension === 'csv') {
        return await parseCSV(buffer);
    } else if (['xlsx', 'xls'].includes(extension)) {
        return parseExcel(buffer);
    } else {
        throw new Error(`Unsupported file format: ${extension}`);
    }
};

export default {
    parseCSV,
    parseExcel,
    parseFile
};
