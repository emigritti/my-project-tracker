import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name of the file
 * @param {string} contentType - MIME type
 * @returns {Promise<object>} Upload result
 */
export const uploadToS3 = async (fileBuffer, fileName, contentType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType
    };

    try {
        const result = await s3.upload(params).promise();
        console.log('File uploaded successfully:', result.Location);
        return result;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};

/**
 * Download file from S3
 * @param {string} fileName - Name of the file to download
 * @returns {Promise<Buffer>} File buffer
 */
export const downloadFromS3 = async (fileName) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName
    };

    try {
        const result = await s3.getObject(params).promise();
        return result.Body;
    } catch (error) {
        console.error('Error downloading from S3:', error);
        throw error;
    }
};

/**
 * Get latest file from S3 bucket
 * @param {string} prefix - File prefix/pattern
 * @returns {Promise<string>} Latest file key
 */
export const getLatestFile = async (prefix = 'stories') => {
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: prefix
    };

    try {
        const result = await s3.listObjectsV2(params).promise();

        if (!result.Contents || result.Contents.length === 0) {
            throw new Error('No files found in S3 bucket');
        }

        // Sort by LastModified date and get the latest
        const sortedFiles = result.Contents.sort((a, b) =>
            new Date(b.LastModified) - new Date(a.LastModified)
        );

        return sortedFiles[0].Key;
    } catch (error) {
        console.error('Error getting latest file from S3:', error);
        throw error;
    }
};

/**
 * List all files in bucket
 * @returns {Promise<Array>} List of files
 */
export const listFiles = async () => {
    const params = {
        Bucket: BUCKET_NAME
    };

    try {
        const result = await s3.listObjectsV2(params).promise();
        return result.Contents || [];
    } catch (error) {
        console.error('Error listing files from S3:', error);
        throw error;
    }
};

export default {
    uploadToS3,
    downloadFromS3,
    getLatestFile,
    listFiles
};
