import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { yogaSessions } from "../data/yogaSessions";
import { calculatePoseAccuracy } from "../utils/poseComparison";
import { speakFeedback, cancelSpeech, activateSpeech, toggleSpeech } from '../utils/speechUtils';
import "./YogaSession.css";

const YogaSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [session, setSession] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [detector, setDetector] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [timer, setTimer] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState("Get ready to start!");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(10);
  const [poseDetected, setPoseDetected] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [poseStats, setPoseStats] = useState([]);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const animationFrameId = useRef(null);
  const lastSpeechTime = useRef(0);
  const isDetecting = useRef(false);
  const accuracyHistory = useRef([]);
  const detectionRunning = useRef(false);
const poseCompletionRef = useRef(false);

  

  useEffect(() => {
    const currentSession = yogaSessions.find((s) => s.id === sessionId);
    if (currentSession) {
      setSession(currentSession);
    } else {
      navigate("/");
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("🔄 Loading TensorFlow.js model...");
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("✅ TensorFlow.js backend ready");

        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        };

        const poseDetector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );

        setDetector(poseDetector);
        setIsModelLoaded(true);
        console.log("✅ MoveNet model loaded successfully");
      } catch (error) {
        console.error("❌ Error loading model:", error);
        setFeedback("Failed to load AI model. Please refresh the page.");
      }
    };

    loadModel();

    return () => {
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

// Pose timer - FIXED to prevent double completion
useEffect(() => {
  if (sessionStarted && session && !isResting && !sessionComplete) {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer + 1;
        const currentPoseDuration = session.poses[currentPoseIndex].duration;

        if (newTimer >= currentPoseDuration) {
          clearInterval(interval);
          // Use setTimeout to ensure it only runs once
          setTimeout(() => handlePoseComplete(), 0);
        }

        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }
}, [sessionStarted, currentPoseIndex, session, isResting, sessionComplete]);


  // Rest timer
  useEffect(() => {
    if (isResting && !sessionComplete) {
      const interval = setInterval(() => {
        setRestTimer((prevTimer) => {
          const newTimer = prevTimer - 1;

          if (newTimer <= 0) {
            clearInterval(interval);
            handleRestComplete();
          }

          return newTimer;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isResting, sessionComplete]);

const handlePoseComplete = () => {
  // Prevent duplicate calls
  if (poseCompletionRef.current) {
    console.log("⚠️ Pose completion already in progress, skipping");
    return;
  }
  
  poseCompletionRef.current = true;
  
  console.log("📊 Completing pose, history length:", accuracyHistory.current.length);
  
  const avgAccuracy =
    accuracyHistory.current.length > 0
      ? accuracyHistory.current.reduce((a, b) => a + b, 0) /
        accuracyHistory.current.length
      : 0;

  const poseData = {
    name: session.poses[currentPoseIndex].name,
    duration: session.poses[currentPoseIndex].duration,
    avgAccuracy: avgAccuracy.toFixed(1),
    maxAccuracy: Math.max(...accuracyHistory.current, 0).toFixed(1),
  };

  console.log("📊 Pose summary:", poseData);

  setPoseStats((prev) => [...prev, poseData]);
  accuracyHistory.current = [];

  if (currentPoseIndex < session.poses.length - 1) {
    // More poses remaining
    setIsResting(true);
    setRestTimer(10);
    setAccuracy(0);
    setPoseDetected(false);
    setFeedback("Great job! Take a rest.");
    speakFeedback("Pose completed! Take a 10 second rest before the next pose.");
    
    // Reset the completion flag after a delay
    setTimeout(() => {
      poseCompletionRef.current = false;
    }, 1000);
  } else {
    // Session complete
    setSessionComplete(true);
    detectionRunning.current = false;
    speakFeedback("Congratulations! You completed all poses! Excellent work!");
  }
};

const handleRestComplete = () => {
  setIsResting(false);
  setCurrentPoseIndex((prev) => prev + 1);
  setTimer(0);
  setAccuracy(0);
  setPoseDetected(false);
  poseCompletionRef.current = false; // Reset completion flag
  
  const nextPose = session.poses[currentPoseIndex + 1];
  setFeedback(`Get into ${nextPose.name} position`);
  speakFeedback(`Starting ${nextPose.name}. Get ready.`);
  lastSpeechTime.current = 0;
  
  setTimeout(() => {
    if (!sessionComplete) {
      console.log("🔄 Restarting detection after rest");
      detectionRunning.current = true;
      animationFrameId.current = requestAnimationFrame(detectPose);
    }
  }, 500);
};


  const setupCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const video = videoRef.current;
    console.log("🎥 Requesting camera access...");
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        facingMode: "user",
      },
      audio: false,
    });

    video.srcObject = stream;

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        console.log("✅ Camera started:", video.videoWidth, "x", video.videoHeight);
        resolve(video);
      };
    });
  };

const detectPose = async () => {
  console.log("🔍 detectPose called, states:", {
    detector: !!detector,
    video: !!videoRef.current,
    canvas: !!canvasRef.current,
    detectionRunning: detectionRunning.current,
    isResting,
    sessionComplete,
    isDetecting: isDetecting.current
  });

  if (!detector) {
    console.warn("⚠️ No detector");
    return;
  }

  if (!videoRef.current || !canvasRef.current) {
    console.warn("⚠️ No video or canvas refs");
    return;
  }

  if (!detectionRunning.current) {
    console.warn("⚠️ Detection not running");
    return;
  }

  if (isResting) {
    console.log("⏸️ Paused for rest");
    return;
  }

  if (sessionComplete) {
    console.log("🏁 Session complete, stopping");
    detectionRunning.current = false;
    return;
  }

  if (isDetecting.current) {
    animationFrameId.current = requestAnimationFrame(detectPose);
    return;
  }

  isDetecting.current = true;

  try {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!video.videoWidth || !video.videoHeight) {
      console.warn("⚠️ Video dimensions are 0");
      isDetecting.current = false;
      animationFrameId.current = requestAnimationFrame(detectPose);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log("📐 Canvas resized to:", canvas.width, "x", canvas.height);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const poses = await detector.estimatePoses(video);

    if (poses.length > 0 && poses[0].keypoints) {
      const pose = poses[0];

      const currentPose = session.poses[currentPoseIndex];
      const result = calculatePoseAccuracy(
        pose.keypoints,
        currentPose.targetKeypoints,
        currentPose.name
      );

      const accuracyScore = result.accuracy;
      const feedbackMessage = result.feedback;

      setAccuracy(accuracyScore);
      setFeedback(feedbackMessage);

      accuracyHistory.current.push(accuracyScore);
      if (accuracyHistory.current.length > 120) {
        accuracyHistory.current.shift();
      }

      const isPoseActive = accuracyScore > 10;
      setPoseDetected(isPoseActive);

      drawPose(pose, ctx, accuracyScore);

      // FIXED AUDIO: Only speak every 6 seconds AND only if speech is enabled
      const now = Date.now();
      if (speechEnabled && now - lastSpeechTime.current > 6000) {
        speakFeedback(feedbackMessage);
        lastSpeechTime.current = now;
      }
    } else {
      setAccuracy(0);
      setPoseDetected(false);
      const msg = "No person detected. Step into camera view.";
      setFeedback(msg);

      // Less frequent for "no detection" message
      const now = Date.now();
      if (speechEnabled && now - lastSpeechTime.current > 8000) {
        speakFeedback(msg);
        lastSpeechTime.current = now;
      }
    }
  } catch (error) {
    console.error("❌ Error in detectPose:", error);
  }

  isDetecting.current = false;

  if (detectionRunning.current && !isResting && !sessionComplete) {
    animationFrameId.current = requestAnimationFrame(detectPose);
  } else {
    console.log("🛑 Stopping detection loop");
    detectionRunning.current = false;
  }
};



  const drawPose = (pose, ctx, accuracyScore) => {
    const keypoints = pose.keypoints;
    const minConfidence = 0.15;

    let color = "#ff0000";
    if (accuracyScore > 70) color = "#00ff00";
    else if (accuracyScore > 50) color = "#ffff00";
    else if (accuracyScore > 25) color = "#ff9900";

    const adjacentKeyPoints = [
      [5, 7], [7, 9], [6, 8], [8, 10], [5, 6],
      [5, 11], [6, 12], [11, 12], [11, 13],
      [13, 15], [12, 14], [14, 16],
    ];

    ctx.lineWidth = 4;
    let drawnLines = 0;
    adjacentKeyPoints.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      if (kp1 && kp2 && kp1.score > minConfidence && kp2.score > minConfidence) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = color;
        ctx.stroke();
        drawnLines++;
      }
    });

    let drawnPoints = 0;
    keypoints.forEach((kp) => {
      if (kp && kp.score > minConfidence) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawnPoints++;
      }
    });

    console.log("🎨 Drew", drawnPoints, "points and", drawnLines, "lines");
  };

const handleStartSession = async () => {
  try {
    console.log("=== 🚀 Starting Session ===");

    activateSpeech();
    await new Promise((r) => setTimeout(r, 200));
    speakFeedback("Starting your yoga session");

    const video = await setupCamera();

    await new Promise((resolve) => {
      const check = () => {
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          console.log("✅ Video FINAL ready:", video.videoWidth, video.videoHeight);
          resolve();
        } else {
          console.log("⏳ Waiting... readyState:", video.readyState, "size:", video.videoWidth, video.videoHeight);
          setTimeout(check, 100);
        }
      };
      check();
    });

    setSessionStarted(true);
    detectionRunning.current = true;
    setFeedback(`Get into ${session.poses[0].name} position`);
    lastSpeechTime.current = Date.now(); // SET INITIAL TIME

    setTimeout(() => {
      console.log("🎬 Starting detectPose loop NOW");
      speakFeedback(`Begin ${session.poses[0].name}`);
      lastSpeechTime.current = Date.now(); // RESET AFTER INITIAL SPEECH
      animationFrameId.current = requestAnimationFrame(detectPose);
    }, 1000);
  } catch (error) {
    console.error("❌ Error:", error);
    alert("Failed to start: " + error.message);
  }
};



  const handleToggleSpeech = () => {
    const enabled = toggleSpeech();
    setSpeechEnabled(enabled);
  };

  const handleEndSession = () => {
    console.log("=== 🛑 Ending Session ===");
    
    detectionRunning.current = false;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    cancelSpeech();
    navigate("/");
  };

  const handleCloseSummary = () => {
    handleEndSession();
  };

  if (!session)
    return (
      <div className="loading-overlay">
        <p>Loading session...</p>
      </div>
    );

  const currentPose = session.poses[currentPoseIndex];
  const progress = (timer / currentPose.duration) * 100;
  const totalPoses = session.poses.length;
  const completedPoses = poseStats.length;
  const overallProgress = (completedPoses / totalPoses) * 100;

  return (
    <div className="yoga-session-container">
      <div className="session-header">
        <h2>{session.name}</h2>
        <div className="session-progress">
          <span>
            Progress: {completedPoses}/{totalPoses} poses
          </span>
          <div className="overall-progress-bar">
            <div
              className="overall-progress-fill"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="speech-toggle-button"
            onClick={handleToggleSpeech}
            style={{
              padding: "10px 15px",
              background: speechEnabled ? "#00cc00" : "#999",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            {speechEnabled ? "🔊 Audio ON" : "🔇 Audio OFF"}
          </button>
          <button className="end-button" onClick={handleEndSession}>
            End Session
          </button>
        </div>
      </div>

      {!sessionStarted && isModelLoaded && (
        <div className="start-overlay">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Ready to Start?</h2>
            <p style={{ color: 'white', marginBottom: '30px', fontSize: '18px' }}>
              This session includes audio feedback
            </p>
            <button className="big-start-button" onClick={handleStartSession}>
              🎥 Start Camera & Begin Session
            </button>
          </div>
        </div>
      )}

      {!isModelLoaded && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading AI Model...</p>
        </div>
      )}

      {isResting && (
        <div className="rest-overlay">
          <div className="rest-content">
            <h2>🧘 Rest Time</h2>
            <div className="rest-timer">{restTimer}s</div>
            <p>
              Prepare for next pose:{" "}
              <strong>{session.poses[currentPoseIndex + 1]?.name}</strong>
            </p>
          </div>
        </div>
      )}

{sessionComplete && (
  <div className="summary-overlay">
    <div className="summary-content">
      <h2>🎉 Session Complete!</h2>
      <p className="summary-subtitle">
        Great work completing {session.name}
      </p>

      <div className="summary-stats-header">
        <p>You completed {poseStats.length} pose{poseStats.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="stats-grid">
        {poseStats.map((stat, index) => (
          <div key={`${stat.name}-${index}`} className="stat-card">
            <h3>
              <span className="stat-number">{index + 1}.</span> {stat.name}
            </h3>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">{stat.duration}s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Accuracy:</span>
                <span className="stat-value" style={{
                  color: parseFloat(stat.avgAccuracy) > 70 ? '#00cc00' : 
                         parseFloat(stat.avgAccuracy) > 50 ? '#ffaa00' : '#ff4444'
                }}>
                  {stat.avgAccuracy}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Accuracy:</span>
                <span className="stat-value" style={{
                  color: parseFloat(stat.maxAccuracy) > 70 ? '#00cc00' : 
                         parseFloat(stat.maxAccuracy) > 50 ? '#ffaa00' : '#ff4444'
                }}>
                  {stat.maxAccuracy}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="summary-close-button"
        onClick={handleCloseSummary}
      >
        Back to Sessions
      </button>
    </div>
  </div>
)}


      <div className="session-content">
        <div className="video-section">
          <div className="video-container">
            <video ref={videoRef} className="video-feed" playsInline />
            <canvas ref={canvasRef} className="pose-canvas" />
            {sessionStarted && !poseDetected && !isResting && (
              <div className="overlay-message">⚠️ {feedback}</div>
            )}
          </div>
        </div>

        <div className="info-section">
          <div className="pose-reference">
            <h3>Target Pose</h3>
            <div className="pose-image-container">
              <div className="pose-illustration">
                {getPoseIllustration(currentPose.name, currentPose.instruction)}
              </div>
            </div>
          </div>

          <div className="pose-info">
            <h3>Current Pose</h3>
            <div className="pose-name">{currentPose.name}</div>
            <div className="pose-counter">
              Pose {currentPoseIndex + 1} of {session.poses.length}
            </div>
          </div>

          <div className="timer-section">
            <h3>Timer</h3>
            <div className="timer-display">
              {timer}s / {currentPose.duration}s
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="accuracy-section">
            <h3>Accuracy</h3>
            <div
              className="accuracy-display"
              style={{
                color:
                  accuracy > 70
                    ? "#00ff00"
                    : accuracy > 50
                    ? "#ffff00"
                    : accuracy > 25
                    ? "#ff9900"
                    : "#ff0000",
              }}
            >
              {accuracy.toFixed(1)}%
            </div>
            <div className="accuracy-bar">
              <div
                className="accuracy-fill"
                style={{
                  width: `${accuracy}%`,
                  backgroundColor:
                    accuracy > 70
                      ? "#00ff00"
                      : accuracy > 50
                      ? "#ffff00"
                      : accuracy > 25
                      ? "#ff9900"
                      : "#ff0000",
                }}
              ></div>
            </div>
            <div className="accuracy-status">
              {poseDetected ? "✅ Pose Active" : "❌ No Pose Detected"}
            </div>
          </div>

          <div className="feedback-section">
            <h3>🔊 Live Feedback</h3>
            <div className="feedback-text">{feedback}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPoseIllustration = (poseName, instruction) => {
  const poseVisuals = {
    "Mountain Pose": {
      emoji: "🧍",
      svg: (
        <svg width="120" height="200" viewBox="0 0 120 200" style={{ margin: '20px auto' }}>
          {/* Head */}
          <circle cx="60" cy="20" r="12" fill="#667eea" />
          {/* Body */}
          <line x1="60" y1="32" x2="60" y2="100" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          {/* Arms */}
          <line x1="60" y1="50" x2="40" y2="80" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="50" x2="80" y2="80" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Legs */}
          <line x1="60" y1="100" x2="50" y2="180" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          <line x1="60" y1="100" x2="70" y2="180" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Stand straight with feet together", "Arms relaxed at sides", "Shoulders back, chest open", "Breathe deeply and hold"]
    },
    "Tree Pose": {
      emoji: "🌳",
      svg: (
        <svg width="120" height="200" viewBox="0 0 120 200" style={{ margin: '20px auto' }}>
          {/* Head */}
          <circle cx="60" cy="20" r="12" fill="#667eea" />
          {/* Body */}
          <line x1="60" y1="32" x2="60" y2="100" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          {/* Arms up in prayer */}
          <line x1="60" y1="40" x2="50" y2="25" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="40" x2="70" y2="25" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Standing leg */}
          <line x1="60" y1="100" x2="60" y2="180" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          {/* Bent leg */}
          <path d="M 60 100 L 40 120 L 50 100" stroke="#667eea" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Balance on one leg", "Place other foot on inner thigh", "Hands in prayer position", "Focus on a point ahead"]
    },
    "Warrior Pose": {
      emoji: "⚔️",
      svg: (
        <svg width="160" height="200" viewBox="0 0 160 200" style={{ margin: '20px auto' }}>
          {/* Head */}
          <circle cx="80" cy="30" r="12" fill="#667eea" />
          {/* Body */}
          <line x1="80" y1="42" x2="80" y2="100" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          {/* Arms extended */}
          <line x1="80" y1="60" x2="20" y2="60" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="80" y1="60" x2="140" y2="60" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Front leg bent */}
          <line x1="80" y1="100" x2="70" y2="150" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          <line x1="70" y1="150" x2="65" y2="180" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          {/* Back leg straight */}
          <line x1="80" y1="100" x2="110" y2="180" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Step one leg back", "Bend front knee 90 degrees", "Extend arms parallel to ground", "Look forward, stay strong"]
    },
    "Downward Dog": {
      emoji: "🐕",
      svg: (
        <svg width="160" height="140" viewBox="0 0 160 140" style={{ margin: '20px auto' }}>
          {/* Head */}
          <circle cx="40" cy="100" r="10" fill="#667eea" />
          {/* Body forming inverted V */}
          <line x1="40" y1="100" x2="80" y2="40" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          <line x1="80" y1="40" x2="120" y2="100" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          {/* Arms */}
          <line x1="40" y1="100" x2="30" y2="120" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="40" y1="100" x2="45" y2="120" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Legs */}
          <line x1="120" y1="100" x2="115" y2="130" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="120" y1="100" x2="125" y2="130" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Hands and feet on ground", "Lift hips high up", "Form inverted V shape", "Straighten arms and legs"]
    },
    "Plank Pose": {
      emoji: "💪",
      svg: (
        <svg width="180" height="100" viewBox="0 0 180 100" style={{ margin: '20px auto' }}>
          {/* Head */}
          <circle cx="150" cy="40" r="10" fill="#667eea" />
          {/* Body horizontal */}
          <line x1="150" y1="45" x2="40" y2="45" stroke="#667eea" strokeWidth="10" strokeLinecap="round" />
          {/* Arms */}
          <line x1="140" y1="45" x2="140" y2="75" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="150" y1="45" x2="150" y2="75" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Legs */}
          <line x1="40" y1="45" x2="35" y2="75" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="50" y1="45" x2="45" y2="75" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Support body on forearms and toes", "Keep body in straight line", "Engage core muscles", "Don't let hips sag"]
    },
    "Forward Bend": {
      emoji: "🙇",
      svg: (
        <svg width="120" height="180" viewBox="0 0 120 180" style={{ margin: '20px auto' }}>
          {/* Head */}
          <circle cx="60" cy="80" r="10" fill="#667eea" />
          {/* Body bent */}
          <path d="M 60 20 Q 60 60 60 90" stroke="#667eea" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* Arms hanging */}
          <line x1="60" y1="80" x2="50" y2="120" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="80" x2="70" y2="120" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Legs */}
          <line x1="60" y1="20" x2="55" y2="5" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
          <line x1="60" y1="20" x2="65" y2="5" stroke="#667eea" strokeWidth="8" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Stand with feet hip-width", "Fold forward from hips", "Let arms hang down", "Relax neck and shoulders"]
    },
    "Cobra Pose": {
      emoji: "🐍",
      svg: (
        <svg width="160" height="120" viewBox="0 0 160 120" style={{ margin: '20px auto' }}>
          {/* Head looking up */}
          <circle cx="140" cy="30" r="10" fill="#667eea" />
          {/* Curved body */}
          <path d="M 20 80 Q 80 90 140 40" stroke="#667eea" strokeWidth="10" fill="none" strokeLinecap="round" />
          {/* Arms pushing up */}
          <line x1="120" y1="45" x2="120" y2="85" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="130" y1="45" x2="130" y2="85" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
        </svg>
      ),
      steps: ["Lie face down", "Place hands under shoulders", "Push up, arch back", "Look up at ceiling"]
    },
    "Child Pose": {
      emoji: "🧘",
      svg: (
        <svg width="140" height="100" viewBox="0 0 140 100" style={{ margin: '20px auto' }}>
          {/* Head down */}
          <circle cx="70" cy="60" r="10" fill="#667eea" />
          {/* Curved back */}
          <path d="M 30 70 Q 70 50 110 70" stroke="#667eea" strokeWidth="10" fill="none" strokeLinecap="round" />
          {/* Arms extended forward */}
          <line x1="30" y1="70" x2="10" y2="80" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          <line x1="110" y1="70" x2="130" y2="80" stroke="#667eea" strokeWidth="6" strokeLinecap="round" />
          {/* Sitting on heels indication */}
          <ellipse cx="70" cy="85" rx="40" ry="10" fill="#667eea" opacity="0.3" />
        </svg>
      ),
      steps: ["Kneel on floor", "Sit back on heels", "Stretch arms forward", "Rest forehead on ground"]
    }
  };

  const poseData = poseVisuals[poseName] || {
    emoji: "🧘‍♀️",
    svg: null,
    steps: ["Follow the instructions", "Hold the pose steady", "Breathe naturally"]
  };

  return (
    <div className="pose-visual-enhanced">
      <div className="pose-emoji-large">{poseData.emoji}</div>
      <div className="pose-svg-container">
        {poseData.svg}
      </div>
      <div className="pose-name-large">{poseName}</div>
      <div className="pose-steps">
        <h4>How to do it:</h4>
        <ol>
          {poseData.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      <p className="pose-instruction-detail">{instruction}</p>
    </div>
  );
};


export default YogaSession;
