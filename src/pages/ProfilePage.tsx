import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { UserPreferences } from '../types';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { getSessionStats, achievements } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferences: user?.preferences || {
      difficulty: 'beginner' as const,
      sessionDuration: 20,
      notifications: true,
      soundEnabled: true,
      hapticFeedback: true,
    },
  });

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <h1>Please log in to view your profile</h1>
        </div>
      </div>
    );
  }

  const stats = getSessionStats();
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      email: formData.email,
      preferences: formData.preferences,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
    setIsEditing(false);
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [key]: value,
      },
    });
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`} 
              alt={user.name}
              className="avatar-image"
            />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="member-since">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="profile-grid">
          {/* Personal Information */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button onClick={handleSave} className="btn btn-primary">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="profile-section">
            <h2>Preferences</h2>
            <div className="preferences-form">
              <div className="form-group">
                <label>Preferred Difficulty</label>
                <select
                  value={formData.preferences.difficulty}
                  onChange={(e) => updatePreference('difficulty', e.target.value)}
                  className="form-select"
                  disabled={!isEditing}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Session Duration</label>
                <select
                  value={formData.preferences.sessionDuration}
                  onChange={(e) => updatePreference('sessionDuration', Number(e.target.value))}
                  className="form-select"
                  disabled={!isEditing}
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications}
                    onChange={(e) => updatePreference('notifications', e.target.checked)}
                    disabled={!isEditing}
                  />
                  Enable notifications
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preferences.soundEnabled}
                    onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                    disabled={!isEditing}
                  />
                  Enable sound feedback
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preferences.hapticFeedback}
                    onChange={(e) => updatePreference('hapticFeedback', e.target.checked)}
                    disabled={!isEditing}
                  />
                  Enable haptic feedback
                </label>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-section">
            <h2>Your Statistics</h2>
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
                <div className="stat-value">{user.stats.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{user.stats.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
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

          {/* Achievements */}
          <div className="profile-section">
            <h2>Achievements</h2>
            {unlockedAchievements.length > 0 ? (
              <div className="achievements-grid">
                {unlockedAchievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card unlocked">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    {achievement.unlockedAt && (
                      <div className="unlock-date">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-achievements">
                <p>Start practicing to unlock achievements!</p>
              </div>
            )}

            {achievements.length > unlockedAchievements.length && (
              <div className="locked-achievements">
                <h3>Locked Achievements</h3>
                <div className="achievements-grid">
                  {achievements
                    .filter(a => !a.unlocked)
                    .map(achievement => (
                      <div key={achievement.id} className="achievement-card locked">
                        <div className="achievement-icon">🔒</div>
                        <h4>???</h4>
                        <p>Complete more sessions to unlock</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Goals */}
          <div className="profile-section">
            <h2>Weekly Goal</h2>
            <div className="goal-section">
              <div className="goal-display">
                <div className="goal-progress">
                  <div className="goal-number">{user.stats.weeklyProgress}</div>
                  <div className="goal-separator">/</div>
                  <div className="goal-target">{user.stats.weeklyGoal}</div>
                </div>
                <div className="goal-label">Sessions this week</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min((user.stats.weeklyProgress / user.stats.weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {user.stats.weeklyProgress >= user.stats.weeklyGoal && (
                <div className="goal-achieved">
                  🎉 Weekly goal achieved!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;