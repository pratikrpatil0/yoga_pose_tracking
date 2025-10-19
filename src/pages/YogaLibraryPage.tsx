import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { yogaSessions, yogaPoses } from '../data/yogaData';
import { YogaSession, YogaPose } from '../types';

const YogaLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'poses'>('sessions');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredSessions = yogaSessions.filter(session => {
    const difficultyMatch = difficultyFilter === 'all' || session.difficulty === difficultyFilter;
    const categoryMatch = categoryFilter === 'all' || session.category === categoryFilter;
    return difficultyMatch && categoryMatch;
  });

  const filteredPoses = yogaPoses.filter(pose => {
    return difficultyFilter === 'all' || pose.difficulty === difficultyFilter;
  });

  const categories = Array.from(new Set(yogaSessions.map(session => session.category)));

  return (
    <div className="library-page">
      <div className="container">
        <div className="library-header">
          <h1>Yoga Library</h1>
          <p>Discover sessions and poses tailored to your practice level</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === 'sessions' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions
          </button>
          <button
            className={activeTab === 'poses' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('poses')}
          >
            Individual Poses
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Difficulty:</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {activeTab === 'sessions' && (
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'sessions' ? (
          <div className="sessions-grid">
            {filteredSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="poses-grid">
            {filteredPoses.map(pose => (
              <PoseCard key={pose.id} pose={pose} />
            ))}
          </div>
        )}

        {(activeTab === 'sessions' ? filteredSessions : filteredPoses).length === 0 && (
          <div className="no-results">
            <p>No {activeTab} found with the selected filters.</p>
            <button
              onClick={() => {
                setDifficultyFilter('all');
                setCategoryFilter('all');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SessionCard: React.FC<{ session: YogaSession }> = ({ session }) => {
  return (
    <div className="session-card">
      <div className="session-illustration">
        <div className="session-icon">
          <div className="yoga-pose-icon">🧘‍♀️</div>
        </div>
        <div className="session-duration">{session.duration} min</div>
      </div>
      
      <div className="session-content">
        <div className="session-header">
          <h3>{session.name}</h3>
          <span className={`difficulty-badge difficulty-${session.difficulty}`}>
            {session.difficulty}
          </span>
        </div>
        
        <p className="session-description">{session.description}</p>
        
        <div className="session-meta">
          <span className="session-category">{session.category}</span>
          <span className="pose-count">{session.poses.length} poses</span>
        </div>
        
        <Link
          to={`/practice/${session.id}`}
          className="btn btn-primary btn-full"
        >
          Start Session
        </Link>
      </div>
    </div>
  );
};

const PoseCard: React.FC<{ pose: YogaPose }> = ({ pose }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPoseIcon = (poseName: string) => {
    // Simple icon mapping based on pose name
    if (poseName.toLowerCase().includes('warrior')) return '⚔️';
    if (poseName.toLowerCase().includes('tree')) return '🌳';
    if (poseName.toLowerCase().includes('child')) return '🙏';
    if (poseName.toLowerCase().includes('cat') || poseName.toLowerCase().includes('cow')) return '🐱';
    if (poseName.toLowerCase().includes('dog')) return '🐕';
    if (poseName.toLowerCase().includes('mountain')) return '⛰️';
    if (poseName.toLowerCase().includes('bridge')) return '🌉';
    return '🧘‍♀️'; // Default yoga icon
  };

  return (
    <div className="pose-card">
      <div className="pose-illustration">
        <div className="pose-icon">
          <div className="pose-emoji">{getPoseIcon(pose.name)}</div>
        </div>
        <div className="pose-duration">{pose.duration}s</div>
      </div>
      
      <div className="pose-content">
        <div className="pose-header">
          <h3>{pose.name}</h3>
          <span className={`difficulty-badge difficulty-${pose.difficulty}`}>
            {pose.difficulty}
          </span>
        </div>
        
        <div className="pose-muscles">
          {pose.targetMuscles.slice(0, 2).map(muscle => (
            <span key={muscle} className="muscle-tag">{muscle}</span>
          ))}
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn btn-outline btn-full"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        
        {showDetails && (
          <div className="pose-details">
            <div className="pose-instructions">
              <h4>Instructions:</h4>
              <ul>
                {pose.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
            
            <div className="pose-benefits">
              <h4>Benefits:</h4>
              <ul>
                {pose.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YogaLibraryPage;