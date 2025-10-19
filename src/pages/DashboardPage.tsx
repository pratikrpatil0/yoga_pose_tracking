import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { getSessionStats, getWeeklyStats, achievements } = useUser();

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>Please log in to view your dashboard</h1>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const stats = getSessionStats();
  const weeklyStats = getWeeklyStats();
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}! 🧘‍♀️</h1>
          <p>Track your progress and continue your yoga journey</p>
        </div>

        <div className="dashboard-grid">
          {/* Quick Stats */}
          <div className="stats-section">
            <h2>Your Progress</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalMinutes}</div>
                <div className="stat-label">Minutes Practiced</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgAccuracy}%</div>
                <div className="stat-label">Avg. Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.caloriesBurned}</div>
                <div className="stat-label">Calories Burned</div>
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="weekly-section">
            <h2>This Week</h2>
            <div className="weekly-progress">
              <div className="progress-item">
                <span>Sessions: {weeklyStats.sessions}/{user.stats.weeklyGoal}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min((weeklyStats.sessions / user.stats.weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-item">
                <span>Minutes: {Math.round(weeklyStats.minutes)}</span>
              </div>
              <div className="progress-item">
                <span>Accuracy: {Math.round(weeklyStats.avgAccuracy)}%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <h2>Quick Start</h2>
            <div className="action-buttons">
              <Link to="/library" className="action-card">
                <div className="action-icon">📚</div>
                <h3>Browse Library</h3>
                <p>Explore yoga sessions and poses</p>
              </Link>
              
              <Link to="/practice/morning-flow" className="action-card">
                <div className="action-icon">🌅</div>
                <h3>Morning Flow</h3>
                <p>Start your day with energy</p>
              </Link>
              
              <Link to="/practice/quick-stretch" className="action-card">
                <div className="action-icon">⚡</div>
                <h3>Quick Stretch</h3>
                <p>Perfect for busy schedules</p>
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h2>Achievements</h2>
            {unlockedAchievements.length > 0 ? (
              <div className="achievements-grid">
                {unlockedAchievements.slice(0, 4).map(achievement => (
                  <div key={achievement.id} className="achievement-card unlocked">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-achievements">
                <p>Complete your first session to unlock achievements!</p>
                <Link to="/library" className="btn btn-primary">
                  Start Practicing
                </Link>
              </div>
            )}
          </div>

          {/* Current Streak */}
          <div className="streak-section">
            <h2>Current Streak</h2>
            <div className="streak-display">
              <div className="streak-number">{user.stats.currentStreak}</div>
              <div className="streak-label">
                {user.stats.currentStreak === 1 ? 'day' : 'days'}
              </div>
              <div className="streak-fire">🔥</div>
            </div>
            <p>Longest streak: {user.stats.longestStreak} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;