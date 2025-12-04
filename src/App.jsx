import { useState, useEffect } from 'react';
import './index.css';
import Dashboard from './components/Dashboard';
import AllStories from './components/AllStories';
import FileUpload from './components/FileUpload';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysis, setAnalysis] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchAnalysis();
    fetchStories();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/analysis`);
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
        setLastUpdate(new Date(data.data.timestamp));
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories`);
      const data = await response.json();

      if (data.success) {
        setStories(data.data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleUploadSuccess = async () => {
    setLoading(true);
    await fetchAnalysis();
    await fetchStories();
    setLoading(false);
    setActiveTab('dashboard');
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stories/analyze`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        await fetchAnalysis();
        await fetchStories();
      }
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';

    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              Processing...
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">Project Tracker</h1>
            <p style={{
              color: 'var(--text-secondary)',
              marginTop: '0.5rem',
              fontSize: '0.95rem'
            }}>
              Track and analyze your project stories
            </p>
          </div>

          <div className="header-actions">
            {lastUpdate && (
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'right'
              }}>
                <div>Last update</div>
                <div style={{
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginTop: '0.25rem'
                }}>
                  {formatLastUpdate()}
                </div>
              </div>
            )}

            <button
              className="btn btn-secondary"
              onClick={handleRunAnalysis}
              disabled={loading || !stories.length}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          📋 All Stories
        </button>
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload
        </button>
      </div>

      {/* Content */}
      <main>
        {activeTab === 'dashboard' && <Dashboard analysis={analysis} />}
        {activeTab === 'stories' && <AllStories stories={stories} />}
        {activeTab === 'upload' && <FileUpload onUploadSuccess={handleUploadSuccess} />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '4rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>Project Tracker v1.0 - Built with React & Node.js</p>
        <p style={{ marginTop: '0.5rem' }}>
          Automated daily analysis at 6:00 AM
        </p>
      </footer>
    </div>
  );
}

export default App;
