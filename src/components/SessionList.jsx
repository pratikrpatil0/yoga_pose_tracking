import React from 'react';
import { useNavigate } from 'react-router-dom';
import { yogaSessions } from '../data/yogaSessions';
import './SessionList.css';

const SessionList = () => {
  const navigate = useNavigate();

  const handleStartSession = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="session-list-container">
      <h2>Yoga Sessions</h2>
      <div className="sessions-grid">
        {yogaSessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-icon">🧘‍♀️</div>
            <h3>{session.name}</h3>
            <p className="session-description">{session.description}</p>
            <div className="session-poses">
              <strong>Poses:</strong>
              <ul>
                {session.poses.map((pose, index) => (
                  <li key={index}>
                    {pose.name} ({pose.duration}s)
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="start-button"
              onClick={() => handleStartSession(session.id)}
            >
              Start Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionList;
