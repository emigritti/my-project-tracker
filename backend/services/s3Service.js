import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
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
    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: contentType
            }
        });

        const result = await upload.done();
        console.log('File uploaded successfully:', result.Location);
        return result;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};

/**
 * Helper to convert stream to buffer
 * @param {ReadableStream} stream 
 * @returns {Promise<Buffer>}
 */
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
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
        const command = new GetObjectCommand(params);
        const result = await s3Client.send(command);
        return await streamToBuffer(result.Body);
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
        const command = new ListObjectsV2Command(params);
        const result = await s3Client.send(command);

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
        const command = new ListObjectsV2Command(params);
        const result = await s3Client.send(command);
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
