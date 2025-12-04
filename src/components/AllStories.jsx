import React from 'react';
import StoryCard from './StoryCard';

const AllStories = ({ stories }) => {
    const [filter, setFilter] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('dueDate');

    if (!stories || stories.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">No Stories Found</h3>
                <p className="empty-text">Upload a file to see your stories</p>
            </div>
        );
    }

    // Filter stories
    const filteredStories = stories.filter(story => {
        if (filter === 'all') return true;
        if (filter === 'active') {
            return ['To Do', 'In progress', 'In test', 'In deploy', 'Reopen'].includes(story.status);
        }
        if (filter === 'high') return story.priority === 'high';
        if (filter === 'medium') return story.priority === 'medium';
        if (filter === 'low') return story.priority === 'low';
        return story.status === filter;
    });

    // Sort stories
    const sortedStories = [...filteredStories].sort((a, b) => {
        if (sortBy === 'dueDate') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (sortBy === 'progress') {
            const progressA = a.duration > 0 ? (a.timeSpent / a.duration) : 0;
            const progressB = b.duration > 0 ? (b.timeSpent / b.duration) : 0;
            return progressB - progressA;
        }
        return 0;
    });

    // Group by project
    const projectGroups = sortedStories.reduce((acc, story) => {
        const project = story.projectDescription || 'Unassigned';
        if (!acc[project]) {
            acc[project] = [];
        }
        acc[project].push(story);
        return acc;
    }, {});

    return (
        <div>
            {/* Filters and Sort */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                        }}>
                            Filter by Status/Priority
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                minWidth: '200px'
                            }}
                        >
                            <option value="all">All Stories</option>
                            <option value="active">Active Only</option>
                            <option value="To Do">To Do</option>
                            <option value="In progress">In Progress</option>
                            <option value="In test">In Test</option>
                            <option value="In deploy">In Deploy</option>
                            <option value="Closed">Closed</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                        }}>
                            Sort by
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                minWidth: '200px'
                            }}
                        >
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="progress">Progress</option>
                        </select>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                            fontWeight: 600
                        }}>
                            Total Stories
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            background: 'var(--primary-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {filteredStories.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stories by Project */}
            {Object.entries(projectGroups).map(([project, projectStories]) => (
                <div key={project} className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-header">
                        <h2 className="card-title">
                            {project} ({projectStories.length})
                        </h2>
                    </div>
                    <div className="grid grid-3">
                        {projectStories.map((story) => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllStories;
