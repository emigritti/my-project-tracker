import React from 'react';

const StoryCard = ({ story, onClick }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysUntilDue = (dueDate) => {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getProgressPercentage = () => {
        if (!story.duration || story.duration === 0) return 0;
        return Math.min(100, (story.timeSpent / story.duration) * 100);
    };

    const daysUntilDue = getDaysUntilDue(story.dueDate);
    const progressPercentage = getProgressPercentage();
    const remainingHours = Math.max(0, story.duration - story.timeSpent);

    return (
        <div className="story-card" onClick={onClick}>
            <div className="story-header">
                <span className="story-id">{story.id}</span>
                <span className={`badge badge-priority-${story.priority}`}>
                    {story.priority}
                </span>
            </div>

            <h3 className="story-title">{story.description}</h3>

            {story.epicDescription && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Epic: {story.epicDescription}
                </p>
            )}

            <div style={{ marginTop: '1rem' }}>
                <span className="badge badge-status">{story.status}</span>
            </div>

            <div className="story-meta">
                <div className="story-meta-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(story.dueDate)}</span>
                </div>

                {daysUntilDue !== null && (
                    <div className="story-meta-item" style={{
                        color: daysUntilDue < 0 ? '#ff6b6b' : daysUntilDue < 3 ? '#fa709a' : 'var(--text-secondary)'
                    }}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            {daysUntilDue < 0
                                ? `${Math.abs(daysUntilDue)}d overdue`
                                : `${daysUntilDue}d left`}
                        </span>
                    </div>
                )}

                <div className="story-meta-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{story.timeSpent}h / {story.duration}h</span>
                </div>
            </div>

            {story.duration > 0 && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${progressPercentage}%`,
                            background: progressPercentage > 100
                                ? 'var(--danger-gradient)'
                                : 'var(--success-gradient)'
                        }}
                    />
                </div>
            )}

            {remainingHours > 0 && (
                <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                }}>
                    {remainingHours.toFixed(1)}h remaining
                </div>
            )}
        </div>
    );
};

export default StoryCard;
