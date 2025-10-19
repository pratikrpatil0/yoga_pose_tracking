// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration: number; // in minutes
  notifications: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  favoriteSession: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

// Yoga Pose and Session Types
export interface YogaPose {
  id: string;
  name: string;
  instructions: string[];
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  imageUrl: string;
  duration: number; // in seconds
  metValue: number; // for calorie calculation
}

export interface YogaSession {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  poses: YogaPose[];
  imageUrl: string;
  category: string;
}

// Session Data and Tracking
export interface SessionData {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  poses: PoseData[];
  totalScore: number;
  caloriesBurned: number;
  completed: boolean;
}

export interface PoseData {
  poseId: string;
  startTime: Date;
  endTime?: Date;
  accuracy: number;
  feedback: PoseFeedback[];
  duration: number; // in seconds
}

// AI Feedback and Analysis
export interface PoseFeedback {
  timestamp: Date;
  accuracy: number;
  suggestions: string[];
  landmarks: any[]; // MediaPipe landmarks
}

export interface HealthMetrics {
  heartRate?: number;
  stressLevel?: number;
  flexibility: number;
  balance: number;
  strength: number;
}

// Gamification and Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'session' | 'streak' | 'pose' | 'time';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Progress and Analytics
export interface WeeklyProgress {
  week: string;
  sessions: number;
  minutes: number;
  calories: number;
  avgAccuracy: number;
}

export interface ProgressAnalytics {
  weeklyData: WeeklyProgress[];
  monthlyGoals: {
    sessions: number;
    minutes: number;
    completed: { sessions: number; minutes: number };
  };
  improvementAreas: string[];
  achievements: Achievement[];
}