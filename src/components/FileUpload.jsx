import React, { useState } from 'react';

const FileUpload = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = async (file) => {
        // Validate file type
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(fileExtension)) {
            setMessage({ type: 'error', text: 'Invalid file type. Please upload CSV or Excel files only.' });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `File uploaded successfully! ${data.data.storiesCount} stories processed.`
                });

                if (onUploadSuccess) {
                    onUploadSuccess(data);
                }
            } else {
                setMessage({ type: 'error', text: data.error || 'Upload failed' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Failed to upload file. Please check if the server is running.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Upload Stories File</h2>
            </div>

            {message && (
                <div className={`alert alert-${message.type}`}>
                    {message.type === 'success' ? '✓' : '⚠'} {message.text}
                </div>
            )}

            <div
                className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
            >
                <div className="upload-icon">
                    {isUploading ? (
                        <div className="spinner" style={{ width: '48px', height: '48px' }} />
                    ) : (
                        '📁'
                    )}
                </div>
                <div className="upload-text">
                    {isUploading ? 'Uploading...' : 'Drop your file here or click to browse'}
                </div>
                <div className="upload-hint">
                    Supported formats: CSV, XLSX, XLS (Max 10MB)
                </div>
                <input
                    id="file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <p><strong>Required columns:</strong></p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>id, description, epic description, project description</li>
                    <li>due date, duration, time spent, status, priority</li>
                </ul>
            </div>
        </div>
    );
};

export default FileUpload;
