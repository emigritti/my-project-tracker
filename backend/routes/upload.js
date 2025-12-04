import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../services/s3Service.js';
import { parseFile } from '../services/csvParser.js';
import { analyzeStories } from '../jobs/storyAnalyzer.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.csv', '.xlsx', '.xls'];
        const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
        }
    }
});

/**
 * POST /api/upload
 * Upload CSV/Excel file to S3 and trigger analysis
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Validate file by parsing it first
        const stories = await parseFile(req.file.buffer, req.file.originalname);

        if (!stories || stories.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'File contains no valid stories'
            });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = req.file.originalname.slice(req.file.originalname.lastIndexOf('.'));
        const fileName = `stories-${timestamp}${extension}`;

        // Upload to S3
        const uploadResult = await uploadToS3(
            req.file.buffer,
            fileName,
            req.file.mimetype
        );

        // Trigger analysis
        const analysis = await analyzeStories();

        res.json({
            success: true,
            message: 'File uploaded and analyzed successfully',
            data: {
                fileName,
                fileUrl: uploadResult.Location,
                storiesCount: stories.length,
                analysis: analysis.summary
            }
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/upload/validate
 * Validate file without uploading
 */
router.post('/validate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const stories = await parseFile(req.file.buffer, req.file.originalname);

        // Validate required fields
        const errors = [];
        stories.forEach((story, index) => {
            if (!story.id) {
                errors.push(`Row ${index + 1}: Missing ID`);
            }
            if (!story.description) {
                errors.push(`Row ${index + 1}: Missing description`);
            }
            if (!story.dueDate) {
                errors.push(`Row ${index + 1}: Missing or invalid due date`);
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: errors.slice(0, 10) // Return first 10 errors
            });
        }

        res.json({
            success: true,
            message: 'File is valid',
            data: {
                storiesCount: stories.length,
                sample: stories.slice(0, 3) // Return first 3 stories as sample
            }
        });
    } catch (error) {
        console.error('Error validating file:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
