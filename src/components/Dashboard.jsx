import React from 'react';

const Dashboard = ({ analysis }) => {
    if (!analysis || !analysis.analysis) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3 className="empty-title">No Analysis Available</h3>
                <p className="empty-text">Upload a stories file to see the analysis</p>
            </div>
        );
    }

    const { summary, overdue, atRisk, needToStart, inProgress } = analysis.analysis;

    return (
        <div>
            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{summary.totalActive}</div>
                    <div className="stat-label">Active Stories</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value" style={{
                        background: 'var(--danger-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {summary.overdueCount}
                    </div>
                    <div className="stat-label">Overdue</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value" style={{
                        background: 'var(--warning-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {summary.atRiskCount}
                    </div>
                    <div className="stat-label">At Risk</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value" style={{
                        background: 'var(--success-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {summary.inProgressCount}
                    </div>
                    <div className="stat-label">In Progress</div>
                </div>
            </div>

            {/* Overdue Stories */}
            {overdue && overdue.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ color: '#ff6b6b' }}>
                            🚨 Overdue Stories ({overdue.length})
                        </h2>
                    </div>
                    <div className="grid grid-2">
                        {overdue.slice(0, 6).map((story) => (
                            <div key={story.id} className="story-card" style={{ borderColor: 'rgba(255, 107, 107, 0.3)' }}>
                                <div className="story-header">
                                    <span className="story-id">{story.id}</span>
                                    <span className={`badge badge-priority-${story.priority}`}>
                                        {story.priority}
                                    </span>
                                </div>
                                <h3 className="story-title">{story.description}</h3>
                                <div className="story-meta">
                                    <div className="story-meta-item" style={{ color: '#ff6b6b' }}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{story.daysOverdue}d overdue</span>
                                    </div>
                                    <div className="story-meta-item">
                                        <span>{story.remainingHours.toFixed(1)}h remaining</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* At Risk Stories */}
            {atRisk && atRisk.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ color: '#fa709a' }}>
                            ⚠️ At Risk Stories ({atRisk.length})
                        </h2>
                    </div>
                    <div className="grid grid-2">
                        {atRisk.slice(0, 6).map((story) => (
                            <div key={story.id} className="story-card" style={{ borderColor: 'rgba(250, 112, 154, 0.3)' }}>
                                <div className="story-header">
                                    <span className="story-id">{story.id}</span>
                                    <span className={`badge badge-priority-${story.priority}`}>
                                        {story.priority}
                                    </span>
                                </div>
                                <h3 className="story-title">{story.description}</h3>
                                <div className="story-meta">
                                    <div className="story-meta-item" style={{ color: '#fa709a' }}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{story.daysUntilDue}d left</span>
                                    </div>
                                    <div className="story-meta-item">
                                        <span>{story.remainingHours.toFixed(1)}h needed</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Need to Start */}
            {needToStart && needToStart.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ color: '#4facfe' }}>
                            🎯 Top Priority to Start ({needToStart.length})
                        </h2>
                    </div>
                    <div className="grid grid-3">
                        {needToStart.slice(0, 9).map((story) => (
                            <div key={story.id} className="story-card">
                                <div className="story-header">
                                    <span className="story-id">{story.id}</span>
                                    <span className={`badge badge-priority-${story.priority}`}>
                                        {story.priority}
                                    </span>
                                </div>
                                <h3 className="story-title">{story.description}</h3>
                                <div className="story-meta">
                                    <div className="story-meta-item">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span>Urgency: {story.urgencyScore.toFixed(1)}</span>
                                    </div>
                                    <div className="story-meta-item">
                                        <span>{story.daysUntilDue}d until due</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* In Progress */}
            {inProgress && inProgress.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            🔄 In Progress ({inProgress.length})
                        </h2>
                    </div>
                    <div className="grid grid-2">
                        {inProgress.slice(0, 6).map((story) => (
                            <div key={story.id} className="story-card">
                                <div className="story-header">
                                    <span className="story-id">{story.id}</span>
                                    <span className={`badge badge-priority-${story.priority}`}>
                                        {story.priority}
                                    </span>
                                </div>
                                <h3 className="story-title">{story.description}</h3>
                                <div className="story-meta">
                                    <div className="story-meta-item">
                                        <span>{story.progressPercentage}% complete</span>
                                    </div>
                                    <div className="story-meta-item">
                                        <span>{story.remainingHours.toFixed(1)}h left</span>
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${story.progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
