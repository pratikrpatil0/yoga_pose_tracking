const keypointMap = {
  nose: 0,
  left_eye: 1,
  right_eye: 2,
  left_ear: 3,
  right_ear: 4,
  left_shoulder: 5,
  right_shoulder: 6,
  left_elbow: 7,
  right_elbow: 8,
  left_wrist: 9,
  right_wrist: 10,
  left_hip: 11,
  right_hip: 12,
  left_knee: 13,
  right_knee: 14,
  left_ankle: 15,
  right_ankle: 16,
};

export const calculatePoseAccuracy = (detectedKeypoints, targetKeypoints, poseName) => {
  if (!detectedKeypoints || detectedKeypoints.length === 0) {
    return { accuracy: 0, feedback: 'No person detected in frame' };
  }

  const minConfidence = 0.2;
  
  // Check if key body parts are visible
  const leftShoulder = detectedKeypoints[keypointMap.left_shoulder];
  const rightShoulder = detectedKeypoints[keypointMap.right_shoulder];
  const leftHip = detectedKeypoints[keypointMap.left_hip];
  const rightHip = detectedKeypoints[keypointMap.right_hip];
  const leftKnee = detectedKeypoints[keypointMap.left_knee];
  const rightKnee = detectedKeypoints[keypointMap.right_knee];
  const leftElbow = detectedKeypoints[keypointMap.left_elbow];
  const rightElbow = detectedKeypoints[keypointMap.right_elbow];

  // Count visible important keypoints
  const importantKeypoints = [
    leftShoulder, rightShoulder, leftHip, rightHip,
    leftKnee, rightKnee, leftElbow, rightElbow
  ];

  const visibleCount = importantKeypoints.filter(kp => kp && kp.score > minConfidence).length;

  // If less than 4 keypoints visible, person is not in frame properly
  if (visibleCount < 4) {
    return { 
      accuracy: 0, 
      feedback: `Step into camera view. Only ${visibleCount} of 8 key points detected.` 
    };
  }

  // If less than 6 keypoints, partial detection
  if (visibleCount < 6) {
    return { 
      accuracy: Math.min(25, visibleCount * 5), 
      feedback: 'Move closer or adjust position. Partial body detected.' 
    };
  }

  // Calculate pose-specific accuracy
  let accuracy = 0;
  let specificFeedback = '';

  switch(poseName.toLowerCase()) {
    case 'mountain pose':
      accuracy = calculateMountainPose(detectedKeypoints);
      specificFeedback = getMountainPoseFeedback(accuracy, detectedKeypoints);
      break;
    case 'tree pose':
      accuracy = calculateTreePose(detectedKeypoints);
      specificFeedback = getTreePoseFeedback(accuracy, detectedKeypoints);
      break;
    case 'warrior pose':
      accuracy = calculateWarriorPose(detectedKeypoints);
      specificFeedback = getWarriorPoseFeedback(accuracy, detectedKeypoints);
      break;
    case 'downward dog':
      accuracy = calculateDownwardDog(detectedKeypoints);
      specificFeedback = getDownwardDogFeedback(accuracy, detectedKeypoints);
      break;
    case 'plank pose':
      accuracy = calculatePlankPose(detectedKeypoints);
      specificFeedback = getPlankPoseFeedback(accuracy, detectedKeypoints);
      break;
    default:
      accuracy = calculateGenericPose(detectedKeypoints);
      specificFeedback = getGenericFeedback(accuracy);
  }

  return { accuracy, feedback: specificFeedback };
};

// Mountain Pose: Standing straight with arms by sides
const calculateMountainPose = (keypoints) => {
  const leftShoulder = keypoints[keypointMap.left_shoulder];
  const rightShoulder = keypoints[keypointMap.right_shoulder];
  const leftHip = keypoints[keypointMap.left_hip];
  const rightHip = keypoints[keypointMap.right_hip];
  const leftKnee = keypoints[keypointMap.left_knee];
  const rightKnee = keypoints[keypointMap.right_knee];
  const leftAnkle = keypoints[keypointMap.left_ankle];
  const rightAnkle = keypoints[keypointMap.right_ankle];

  let score = 0;
  let checks = 0;

  // Check if standing (shoulders above hips above knees above ankles)
  if (leftShoulder && leftHip && leftKnee && leftAnkle) {
    if (leftShoulder.y < leftHip.y && leftHip.y < leftKnee.y && leftKnee.y < leftAnkle.y) {
      score += 30;
    }
    checks++;
  }

  // Check body alignment (vertical)
  if (leftShoulder && leftHip && rightShoulder && rightHip) {
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const alignment = Math.abs(shoulderMidX - hipMidX);
    const bodyWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    
    if (alignment < bodyWidth * 0.3) {
      score += 40;
    } else if (alignment < bodyWidth * 0.5) {
      score += 25;
    } else {
      score += 10;
    }
    checks++;
  }

  // Check feet position (close together)
  if (leftAnkle && rightAnkle) {
    const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    
    if (feetDistance < shoulderWidth * 0.5) {
      score += 30;
    } else if (feetDistance < shoulderWidth) {
      score += 15;
    }
    checks++;
  }

  return checks > 0 ? Math.min(100, (score / checks) * (checks / 3)) : 0;
};

const getMountainPoseFeedback = (accuracy, keypoints) => {
  if (accuracy >= 85) return "Perfect Mountain Pose! Stand tall and breathe.";
  if (accuracy >= 70) return "Good Mountain Pose! Keep your body aligned.";
  if (accuracy >= 50) return "Stand straighter. Align shoulders over hips.";
  if (accuracy >= 30) return "Feet closer together. Stand more upright.";
  return "Start Mountain Pose: Stand straight with feet together.";
};

// Tree Pose: One leg bent, balanced on other leg
const calculateTreePose = (keypoints) => {
  const leftHip = keypoints[keypointMap.left_hip];
  const rightHip = keypoints[keypointMap.right_hip];
  const leftKnee = keypoints[keypointMap.left_knee];
  const rightKnee = keypoints[keypointMap.right_knee];
  const leftAnkle = keypoints[keypointMap.left_ankle];
  const rightAnkle = keypoints[keypointMap.right_ankle];

  let score = 0;

  // Check if one knee is raised (tree pose position)
  if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
    const leftKneeRaised = leftKnee.y < leftHip?.y;
    const rightKneeRaised = rightKnee.y < rightHip?.y;
    
    if (leftKneeRaised || rightKneeRaised) {
      score += 50;
      
      // Check if one foot is on ground (standing leg)
      const leftFootGrounded = leftAnkle.y > (leftKnee.y + 50);
      const rightFootGrounded = rightAnkle.y > (rightKnee.y + 50);
      
      if ((leftKneeRaised && rightFootGrounded) || (rightKneeRaised && leftFootGrounded)) {
        score += 40;
      } else {
        score += 20;
      }
    } else {
      score += 10;
    }
  }

  // Check balance (hips level)
  if (leftHip && rightHip) {
    const hipLevelDiff = Math.abs(leftHip.y - rightHip.y);
    if (hipLevelDiff < 20) {
      score += 10;
    }
  }

  return Math.min(100, score);
};

const getTreePoseFeedback = (accuracy, keypoints) => {
  if (accuracy >= 85) return "Excellent Tree Pose! Hold your balance.";
  if (accuracy >= 70) return "Good Tree Pose! Keep your hips level.";
  if (accuracy >= 40) return "Raise one knee higher. Balance on one leg.";
  return "Start Tree Pose: Lift one foot and place on opposite thigh.";
};

// Warrior Pose: Arms extended, legs in lunge position
const calculateWarriorPose = (keypoints) => {
  const leftShoulder = keypoints[keypointMap.left_shoulder];
  const rightShoulder = keypoints[keypointMap.right_shoulder];
  const leftWrist = keypoints[keypointMap.left_wrist];
  const rightWrist = keypoints[keypointMap.right_wrist];
  const leftKnee = keypoints[keypointMap.left_knee];
  const rightKnee = keypoints[keypointMap.right_knee];
  const leftAnkle = keypoints[keypointMap.left_ankle];
  const rightAnkle = keypoints[keypointMap.right_ankle];

  let score = 0;

  // Check arms extended
  if (leftShoulder && rightShoulder && leftWrist && rightWrist) {
    const armSpan = Math.abs(leftWrist.x - rightWrist.x);
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    
    if (armSpan > shoulderWidth * 2) {
      score += 50;
    } else if (armSpan > shoulderWidth * 1.5) {
      score += 30;
    } else {
      score += 10;
    }
  }

  // Check leg stance (feet apart)
  if (leftAnkle && rightAnkle) {
    const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);
    const shoulderWidth = Math.abs(leftShoulder?.x - rightShoulder?.x) || 100;
    
    if (feetDistance > shoulderWidth * 1.5) {
      score += 50;
    } else if (feetDistance > shoulderWidth) {
      score += 30;
    } else {
      score += 10;
    }
  }

  return Math.min(100, score);
};

const getWarriorPoseFeedback = (accuracy, keypoints) => {
  if (accuracy >= 85) return "Perfect Warrior Pose! Strong and steady.";
  if (accuracy >= 70) return "Great Warrior! Extend arms wider.";
  if (accuracy >= 50) return "Spread your legs wider. Extend arms out.";
  return "Start Warrior Pose: Spread legs, extend arms to sides.";
};

// Downward Dog: Inverted V shape
const calculateDownwardDog = (keypoints) => {
  const leftShoulder = keypoints[keypointMap.left_shoulder];
  const rightShoulder = keypoints[keypointMap.right_shoulder];
  const leftHip = keypoints[keypointMap.left_hip];
  const rightHip = keypoints[keypointMap.right_hip];
  const leftWrist = keypoints[keypointMap.left_wrist];
  const rightWrist = keypoints[keypointMap.right_wrist];

  let score = 0;

  // Check if hips are highest point (inverted V)
  if (leftHip && leftShoulder && leftWrist) {
    if (leftHip.y < leftShoulder.y && leftHip.y < leftWrist.y) {
      score += 50;
    } else if (leftHip.y < leftShoulder.y || leftHip.y < leftWrist.y) {
      score += 25;
    }
  }

  // Check arms and legs extended
  if (leftShoulder && leftWrist && leftHip) {
    const armLength = Math.sqrt(Math.pow(leftWrist.x - leftShoulder.x, 2) + Math.pow(leftWrist.y - leftShoulder.y, 2));
    const torsoLength = Math.sqrt(Math.pow(leftHip.x - leftShoulder.x, 2) + Math.pow(leftHip.y - leftShoulder.y, 2));
    
    if (armLength > torsoLength * 0.8) {
      score += 50;
    } else {
      score += 25;
    }
  }

  return Math.min(100, score);
};

const getDownwardDogFeedback = (accuracy, keypoints) => {
  if (accuracy >= 85) return "Perfect Downward Dog! Hips high, arms straight.";
  if (accuracy >= 70) return "Good form! Lift hips higher.";
  if (accuracy >= 40) return "Push hips up to form inverted V shape.";
  return "Start Downward Dog: Hands and feet on ground, hips up.";
};

// Plank Pose: Body straight and horizontal
const calculatePlankPose = (keypoints) => {
  const leftShoulder = keypoints[keypointMap.left_shoulder];
  const rightShoulder = keypoints[keypointMap.right_shoulder];
  const leftHip = keypoints[keypointMap.left_hip];
  const rightHip = keypoints[keypointMap.right_hip];
  const leftAnkle = keypoints[keypointMap.left_ankle];
  const rightAnkle = keypoints[keypointMap.right_ankle];

  let score = 0;

  // Check if body is horizontal (shoulders, hips, ankles aligned)
  if (leftShoulder && leftHip && leftAnkle) {
    const shoulderHipDiff = Math.abs(leftShoulder.y - leftHip.y);
    const hipAnkleDiff = Math.abs(leftHip.y - leftAnkle.y);
    
    if (shoulderHipDiff < 50 && hipAnkleDiff < 50) {
      score += 70;
    } else if (shoulderHipDiff < 100 && hipAnkleDiff < 100) {
      score += 40;
    } else {
      score += 20;
    }
  }

  // Check if body is not sagging
  if (leftShoulder && leftHip && leftAnkle) {
    const hipSag = leftHip.y - ((leftShoulder.y + leftAnkle.y) / 2);
    if (Math.abs(hipSag) < 30) {
      score += 30;
    } else if (Math.abs(hipSag) < 60) {
      score += 15;
    }
  }

  return Math.min(100, score);
};

const getPlankPoseFeedback = (accuracy, keypoints) => {
  if (accuracy >= 85) return "Perfect Plank! Body straight and strong.";
  if (accuracy >= 70) return "Good Plank! Keep core tight.";
  if (accuracy >= 40) return "Straighten your body. Don't let hips sag.";
  return "Start Plank: Straight line from head to heels.";
};

// Generic pose calculation
const calculateGenericPose = (keypoints) => {
  const minConfidence = 0.3;
  let totalConfidence = 0;
  let count = 0;

  keypoints.forEach(kp => {
    if (kp.score > minConfidence) {
      totalConfidence += kp.score;
      count++;
    }
  });

  return count > 0 ? (totalConfidence / count) * 100 : 0;
};

const getGenericFeedback = (accuracy) => {
  if (accuracy >= 85) return "Excellent pose! Keep holding.";
  if (accuracy >= 70) return "Good form! Minor adjustments.";
  if (accuracy >= 50) return "Adjust your position slightly.";
  if (accuracy >= 30) return "Try to match the pose better.";
  return "Start the pose and hold the position.";
};

export const calculateAngle = (point1, point2, point3) => {
  const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};
