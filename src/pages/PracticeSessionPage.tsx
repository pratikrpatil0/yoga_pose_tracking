import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { yogaSessions } from '../data/yogaData';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { SessionData, PoseData } from '../types';
import PoseDetectionCamera from '../components/PoseDetectionCamera';

const PracticeSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { addSession } = useUser();
  const navigate = useNavigate();
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [poseStartTime, setPoseStartTime] = useState<Date | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const session = yogaSessions.find(s => s.id === sessionId);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!session) {
      navigate('/library');
      return;
    }
  }, [user, session, navigate]);

  const startSession = () => {
    if (!user || !session) return;

    const newSessionData: SessionData = {
      id: `session-${Date.now()}`,
      userId: user.id,
      sessionId: session.id,
      startTime: new Date(),
      poses: [],
      totalScore: 0,
      caloriesBurned: 0,
      completed: false,
    };

    setSessionData(newSessionData);
    setSessionStarted(true);
    startPose();
  };

  const startPose = () => {
    setPoseStartTime(new Date());
    setShowCamera(true);
  };

  const completePose = () => {
    if (!sessionData || !poseStartTime || !session) return;

    const currentPose = session.poses[currentPoseIndex];
    const endTime = new Date();
    const duration = (endTime.getTime() - poseStartTime.getTime()) / 1000;
    
    // Mock accuracy score for demo
    const accuracy = Math.floor(Math.random() * 30) + 70; // 70-100%

    const poseData: PoseData = {
      poseId: currentPose.id,
      startTime: poseStartTime,
      endTime,
      accuracy,
      feedback: [],
      duration,
    };

    const updatedSessionData = {
      ...sessionData,
      poses: [...sessionData.poses, poseData],
    };

    setSessionData(updatedSessionData);
    setShowCamera(false);

    if (currentPoseIndex < session.poses.length - 1) {
      setCurrentPoseIndex(currentPoseIndex + 1);
      setTimeout(() => {
        startPose();
      }, 2000); // 2 second break between poses
    } else {
      completeSession(updatedSessionData);
    }
  };

  const completeSession = (finalSessionData: SessionData) => {
    if (!user || !session) return;

    const endTime = new Date();
    const totalDuration = (endTime.getTime() - finalSessionData.startTime.getTime()) / (1000 * 60);
    const avgAccuracy = finalSessionData.poses.reduce((sum, pose) => sum + pose.accuracy, 0) / finalSessionData.poses.length;
    
    // Calculate calories based on duration and MET values
    const caloriesBurned = Math.round(totalDuration * 3.5 * 70 / 60); // Rough estimate

    const completedSession: SessionData = {
      ...finalSessionData,
      endTime,
      totalScore: Math.round(avgAccuracy),
      caloriesBurned,
      completed: true,
    };

    addSession(completedSession);
    setSessionData(completedSession);
    setSessionStarted(false);
  };

  const skipPose = () => {
    completePose(); // Same logic but with lower accuracy
  };

  if (!session) {
    return (
      <div className="practice-page">
        <div className="container">
          <h1>Session not found</h1>
          <button onClick={() => navigate('/library')} className="btn btn-primary">
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="practice-page">
        <div className="container">
          <h1>Please log in to practice</h1>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <div className="container">
        {!sessionStarted ? (
          <SessionPreview 
            session={session} 
            onStart={startSession}
            onBack={() => navigate('/library')}
          />
        ) : sessionData?.completed ? (
          <SessionComplete 
            session={session}
            sessionData={sessionData}
            onDashboard={() => navigate('/dashboard')}
            onLibrary={() => navigate('/library')}
          />
        ) : (
          <ActivePractice
            session={session}
            currentPoseIndex={currentPoseIndex}
            showCamera={showCamera}
            onComplete={completePose}
            onSkip={skipPose}
          />
        )}
      </div>
    </div>
  );
};

const SessionPreview: React.FC<{
  session: any;
  onStart: () => void;
  onBack: () => void;
}> = ({ session, onStart, onBack }) => {
  return (
    <div className="session-preview">
      <button onClick={onBack} className="back-button">
        ← Back to Library
      </button>
      
      <div className="preview-content">
        <div className="preview-illustration">
          <div className="session-preview-icon">
            <div className="large-yoga-icon">🧘‍♀️</div>
            <div className="preview-category">{session.category}</div>
          </div>
        </div>
        
        <div className="preview-details">
          <h1>{session.name}</h1>
          <p className="session-description">{session.description}</p>
          
          <div className="session-info">
            <div className="info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{session.duration} minutes</span>
            </div>
            <div className="info-item">
              <span className="info-label">Difficulty:</span>
              <span className={`difficulty-badge difficulty-${session.difficulty}`}>
                {session.difficulty}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Poses:</span>
              <span className="info-value">{session.poses.length} poses</span>
            </div>
          </div>
          
          <div className="pose-list">
            <h3>Poses in this session:</h3>
            {session.poses.map((pose: any, index: number) => (
              <div key={pose.id} className="pose-item">
                <span className="pose-number">{index + 1}</span>
                <span className="pose-name">{pose.name}</span>
                <span className="pose-duration">{pose.duration}s</span>
              </div>
            ))}
          </div>
          
          <button onClick={onStart} className="btn btn-primary btn-large">
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivePractice: React.FC<{
  session: any;
  currentPoseIndex: number;
  showCamera: boolean;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ session, currentPoseIndex, showCamera, onComplete, onSkip }) => {
  const currentPose = session.poses[currentPoseIndex];
  const [timeLeft, setTimeLeft] = useState(currentPose.duration);

  useEffect(() => {
    if (showCamera && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete();
    }
  }, [timeLeft, showCamera, onComplete]);

  return (
    <div className="active-practice">
      <div className="practice-header">
        <h2>{session.name}</h2>
        <div className="progress-info">
          <span>Pose {currentPoseIndex + 1} of {session.poses.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentPoseIndex + 1) / session.poses.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="practice-content">
        <div className="pose-info">
          <h3>{currentPose.name}</h3>
          <div className="timer">
            {showCamera ? (
              <span className="time-left">{timeLeft}s</span>
            ) : (
              <span className="preparing">Get Ready...</span>
            )}
          </div>
        </div>

        {showCamera ? (
          <div className="camera-container">
            <PoseDetectionCamera 
              showFeedback={true}
              onPoseDetected={(results) => {
                // Handle pose detection results here
                // You can use this to calculate accuracy, give feedback, etc.
                console.log('Pose detected:', results);
              }}
            />
          </div>
        ) : (
          <div className="pose-instructions">
            <div className="instruction-illustration">
              <div className="pose-demo-icon">
                <div className="demo-emoji">🧘‍♀️</div>
                <div className="pose-name-display">{currentPose.name}</div>
              </div>
            </div>
            <div className="instructions">
              <h4>Instructions:</h4>
              <ul>
                {currentPose.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="practice-controls">
          {showCamera ? (
            <>
              <button onClick={onSkip} className="btn btn-outline">
                Skip Pose
              </button>
              <button onClick={onComplete} className="btn btn-primary">
                Complete Early
              </button>
            </>
          ) : (
            <div className="preparing-message">
              <p>Preparing next pose...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionComplete: React.FC<{
  session: any;
  sessionData: SessionData;
  onDashboard: () => void;
  onLibrary: () => void;
}> = ({ session, sessionData, onDashboard, onLibrary }) => {
  const avgAccuracy = Math.round(
    sessionData.poses.reduce((sum, pose) => sum + pose.accuracy, 0) / sessionData.poses.length
  );

  return (
    <div className="session-complete">
      <div className="completion-header">
        <div className="completion-icon">🎉</div>
        <h1>Session Complete!</h1>
        <p>Great job completing {session.name}</p>
      </div>

      <div className="session-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-value">{sessionData.poses.length}</span>
            <span className="stat-label">Poses Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{avgAccuracy}%</span>
            <span className="stat-label">Avg. Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{sessionData.caloriesBurned}</span>
            <span className="stat-label">Calories Burned</span>
          </div>
        </div>

        <div className="pose-breakdown">
          <h3>Pose Performance:</h3>
          {sessionData.poses.map((pose, index) => {
            const poseInfo = session.poses.find((p: any) => p.id === pose.poseId);
            return (
              <div key={pose.poseId} className="pose-result">
                <span className="pose-name">{poseInfo?.name}</span>
                <span className="pose-score">{Math.round(pose.accuracy)}%</span>
                <div className="accuracy-bar">
                  <div 
                    className="accuracy-fill" 
                    style={{ width: `${pose.accuracy}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="completion-actions">
        <button onClick={onLibrary} className="btn btn-outline">
          Browse More Sessions
        </button>
        <button onClick={onDashboard} className="btn btn-primary">
          View Dashboard
        </button>
      </div>
    </div>
  );
};

export default PracticeSessionPage;