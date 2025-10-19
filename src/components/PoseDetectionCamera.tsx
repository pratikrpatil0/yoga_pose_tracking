import React, { useRef, useEffect, useState } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

interface PoseDetectionCameraProps {
  onPoseDetected?: (results: Results) => void;
  showFeedback?: boolean;
}

const PoseDetectionCamera: React.FC<PoseDetectionCameraProps> = ({ 
  onPoseDetected,
  showFeedback = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [poseAccuracy, setPoseAccuracy] = useState<number>(0);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;

        // Initialize MediaPipe Pose
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        // Initialize Camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && poseRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        cameraRef.current = camera;
        await camera.start();
        setIsLoading(false);

      } catch (err) {
        console.error('Error initializing pose detection:', err);
        setError('Failed to initialize camera. Please check permissions.');
        setIsLoading(false);
      }
    };

    initializePoseDetection();

    // Cleanup
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResults = (results: Results) => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw the video frame
    if (results.image) {
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Draw pose landmarks and connections if detected
    if (results.poseLandmarks) {
      // Draw connections (skeleton)
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });

      // Draw landmarks (body nodes/keypoints)
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
        radius: 6,
        fillColor: '#00FFFF'
      });

      // Calculate pose accuracy (mock calculation based on pose visibility)
      const visibleLandmarks = results.poseLandmarks.filter(
        (landmark) => landmark.visibility && landmark.visibility > 0.5
      );
      const accuracy = Math.round((visibleLandmarks.length / results.poseLandmarks.length) * 100);
      setPoseAccuracy(accuracy);

      // Call callback if provided
      if (onPoseDetected) {
        onPoseDetected(results);
      }
    }

    canvasCtx.restore();
  };

  return (
    <div className="pose-detection-camera">
      <div className="camera-wrapper">
        {isLoading && (
          <div className="camera-loading">
            <div className="loader-spinner"></div>
            <p>Initializing camera and pose detection...</p>
          </div>
        )}
        
        {error && (
          <div className="camera-error">
            <p>⚠️ {error}</p>
            <p className="error-hint">Please allow camera access in your browser settings.</p>
          </div>
        )}

        <video
          ref={videoRef}
          className="camera-video"
          style={{ display: 'none' }}
          playsInline
        />
        
        <canvas
          ref={canvasRef}
          className="camera-canvas"
          width={640}
          height={480}
        />

        {showFeedback && !isLoading && !error && (
          <div className="pose-overlay">
            <div className="pose-stats">
              <div className="stat-item">
                <span className="stat-label">Detection:</span>
                <span className={`stat-value ${poseAccuracy > 70 ? 'good' : 'poor'}`}>
                  {poseAccuracy}%
                </span>
              </div>
            </div>

            <div className="pose-hints">
              {poseAccuracy < 50 && (
                <div className="hint warning">
                  🚨 Position yourself fully in frame
                </div>
              )}
              {poseAccuracy >= 50 && poseAccuracy < 80 && (
                <div className="hint info">
                  ℹ️ Adjust your position for better tracking
                </div>
              )}
              {poseAccuracy >= 80 && (
                <div className="hint success">
                  ✅ Perfect! Keep this position
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="camera-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#00FFFF' }}></span>
          <span>Body Keypoints</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#00FF00' }}></span>
          <span>Skeleton Connections</span>
        </div>
      </div>
    </div>
  );
};

export default PoseDetectionCamera;
