import { YogaPose } from '../types';

// Haptic feedback patterns
export const HapticPatterns = {
  success: 100,      // Short success vibration
  gentle: 50,        // Gentle feedback
  warning: [100, 50, 100], // Warning pattern
  error: [200, 100, 200, 100, 200] // Error pattern
};

// Audio feedback frequencies
export const AudioFrequencies = {
  success: 800,      // High pleasant tone
  gentle: 600,       // Medium tone
  warning: 400,      // Lower warning tone
  error: 300         // Low error tone
};

// Calculate pose accuracy based on landmarks
export const calculatePoseAccuracy = (landmarks: any[], targetPose: YogaPose): number => {
  if (!landmarks || landmarks.length === 0) return 0;
  
  // Key landmarks for pose detection
  const keyLandmarks = [
    11, 12, // Shoulders
    13, 14, // Elbows
    15, 16, // Wrists
    23, 24, // Hips
    25, 26, // Knees
    27, 28  // Ankles
  ];
  
  let visibleLandmarks = 0;
  let totalScore = 0;
  
  // Check visibility and quality of key landmarks
  keyLandmarks.forEach(index => {
    if (landmarks[index] && landmarks[index].visibility > 0.5) {
      visibleLandmarks++;
      // Score based on visibility and position stability
      totalScore += landmarks[index].visibility * 100;
    }
  });
  
  if (visibleLandmarks === 0) return 0;
  
  const baseScore = totalScore / keyLandmarks.length;
  
  // Apply pose-specific scoring
  let poseMultiplier = 1;
  const poseName = targetPose.name.toLowerCase();
  
  if (poseName.includes('mountain')) {
    poseMultiplier = calculateMountainPoseAccuracy(landmarks);
  } else if (poseName.includes('tree')) {
    poseMultiplier = calculateTreePoseAccuracy(landmarks);
  } else if (poseName.includes('warrior')) {
    poseMultiplier = calculateWarriorPoseAccuracy(landmarks);
  } else if (poseName.includes('downward')) {
    poseMultiplier = calculateDownwardDogAccuracy(landmarks);
  } else if (poseName.includes('triangle')) {
    poseMultiplier = calculateTrianglePoseAccuracy(landmarks);
  }
  
  return Math.min(baseScore * poseMultiplier, 100);
};

// Pose-specific accuracy calculations
const calculateMountainPoseAccuracy = (landmarks: any[]): number => {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 1;
  
  // Check if shoulders are level
  const shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderScore = 1 + (1 - Math.min(shoulderAlignment * 10, 1)) * 0.3;
  
  // Check if hips are level
  const hipAlignment = Math.abs(leftHip.y - rightHip.y);
  const hipScore = 1 + (1 - Math.min(hipAlignment * 10, 1)) * 0.2;
  
  return (shoulderScore + hipScore) / 2;
};

const calculateTreePoseAccuracy = (landmarks: any[]): number => {
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  
  if (!leftAnkle || !rightAnkle || !leftKnee || !rightKnee) return 1;
  
  // Check balance (one foot should be raised)
  const ankleHeightDiff = Math.abs(leftAnkle.y - rightAnkle.y);
  const balanceScore = 1 + Math.min(ankleHeightDiff * 2, 1) * 0.5;
  
  return balanceScore;
};

const calculateWarriorPoseAccuracy = (landmarks: any[]): number => {
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  
  if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return 1;
  
  // Check if front knee is bent (warrior pose characteristic)
  const leftKneeAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]); // Hip-Knee-Ankle
  const rightKneeAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
  
  // One knee should be more bent than the other
  const kneeAngleDiff = Math.abs(leftKneeAngle - rightKneeAngle);
  const angleScore = 1 + Math.min(kneeAngleDiff / 45, 1) * 0.4; // Max 40% bonus
  
  return angleScore;
};

const calculateDownwardDogAccuracy = (landmarks: any[]): number => {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftWrist || !rightWrist) return 1;
  
  // Check if hips are higher than shoulders (inverted V shape)
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  
  if (avgHipY < avgShoulderY) { // Hips should be higher (lower y value)
    const inversionScore = 1 + 0.3; // 30% bonus for correct inversion
    return inversionScore;
  }
  
  return 1;
};

const calculateTrianglePoseAccuracy = (landmarks: any[]): number => {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  
  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return 1;
  
  // Check if arms are extended in opposite directions
  const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
  const wristDistance = Math.abs(leftWrist.x - rightWrist.x);
  
  if (wristDistance > shoulderDistance * 1.5) { // Arms extended
    const extensionScore = 1 + 0.3; // 30% bonus for arm extension
    return extensionScore;
  }
  
  return 1;
};

// Calculate angle between three points
const calculateAngle = (point1: any, point2: any, point3: any): number => {
  const a = Math.sqrt(Math.pow(point2.x - point3.x, 2) + Math.pow(point2.y - point3.y, 2));
  const b = Math.sqrt(Math.pow(point1.x - point3.x, 2) + Math.pow(point1.y - point3.y, 2));
  const c = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
  
  const angle = Math.acos((a * a + c * c - b * b) / (2 * a * c));
  return angle * (180 / Math.PI); // Convert to degrees
};

// Calculate calories burned based on MET values and duration
export const calculateCaloriesBurned = (pose: YogaPose, durationMinutes: number, userWeight: number = 70): number => {
  // Calories = MET × weight (kg) × time (hours)
  const hours = durationMinutes / 60;
  return Math.round(pose.metValue * userWeight * hours);
};

// Generate pose-specific feedback
export const generatePoseFeedback = (accuracy: number, poseName: string): string[] => {
  const suggestions: string[] = [];
  
  if (accuracy < 50) {
    suggestions.push("Check your pose alignment with the instructions");
    suggestions.push("Make sure you're clearly visible in the camera");
  } else if (accuracy < 75) {
    suggestions.push("Almost there! Fine-tune your position");
  } else {
    suggestions.push("Great pose! Hold it steady");
  }
  
  // Add pose-specific suggestions
  const name = poseName.toLowerCase();
  if (name.includes('mountain')) {
    if (accuracy < 80) {
      suggestions.push("Keep your shoulders level and relaxed");
      suggestions.push("Stand tall with feet hip-width apart");
    }
  } else if (name.includes('tree')) {
    if (accuracy < 80) {
      suggestions.push("Find a focal point to help with balance");
      suggestions.push("Press your foot firmly into your standing leg");
    }
  } else if (name.includes('warrior')) {
    if (accuracy < 80) {
      suggestions.push("Keep your front knee over your ankle");
      suggestions.push("Extend your arms strongly");
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};