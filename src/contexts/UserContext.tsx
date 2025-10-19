import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionData, WeeklyProgress, Achievement } from '../types';
import { useAuth } from './AuthContext';

interface UserContextType {
  sessions: SessionData[];
  weeklyProgress: WeeklyProgress[];
  achievements: Achievement[];
  addSession: (session: SessionData) => void;
  updateSession: (sessionId: string, updates: Partial<SessionData>) => void;
  getSessionStats: () => {
    totalSessions: number;
    totalMinutes: number;
    avgAccuracy: number;
    caloriesBurned: number;
  };
  getWeeklyStats: () => WeeklyProgress;
  unlockAchievement: (achievementId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const savedSessions = localStorage.getItem(`yogaApp_sessions_${user.id}`);
      const savedProgress = localStorage.getItem(`yogaApp_progress_${user.id}`);
      const savedAchievements = localStorage.getItem(`yogaApp_achievements_${user.id}`);

      if (savedSessions) {
        try {
          const parsedSessions = JSON.parse(savedSessions);
          // Convert date strings back to Date objects
          const sessionsWithDates = parsedSessions.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
            poses: session.poses.map((pose: any) => ({
              ...pose,
              startTime: new Date(pose.startTime),
              endTime: pose.endTime ? new Date(pose.endTime) : undefined,
              feedback: pose.feedback.map((feedback: any) => ({
                ...feedback,
                timestamp: new Date(feedback.timestamp),
              })),
            })),
          }));
          setSessions(sessionsWithDates);
        } catch (error) {
          console.error('Error parsing saved sessions:', error);
        }
      }

      if (savedProgress) {
        try {
          setWeeklyProgress(JSON.parse(savedProgress));
        } catch (error) {
          console.error('Error parsing saved progress:', error);
        }
      }

      if (savedAchievements) {
        try {
          const parsedAchievements = JSON.parse(savedAchievements);
          const achievementsWithDates = parsedAchievements.map((achievement: any) => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
          }));
          setAchievements(achievementsWithDates);
        } catch (error) {
          console.error('Error parsing saved achievements:', error);
        }
      } else {
        // Initialize default achievements
        initializeAchievements();
      }
    } else {
      // Clear data when user logs out
      setSessions([]);
      setWeeklyProgress([]);
      setAchievements([]);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user && sessions.length > 0) {
      localStorage.setItem(`yogaApp_sessions_${user.id}`, JSON.stringify(sessions));
    }
  }, [user, sessions]);

  useEffect(() => {
    if (user && weeklyProgress.length > 0) {
      localStorage.setItem(`yogaApp_progress_${user.id}`, JSON.stringify(weeklyProgress));
    }
  }, [user, weeklyProgress]);

  useEffect(() => {
    if (user && achievements.length > 0) {
      localStorage.setItem(`yogaApp_achievements_${user.id}`, JSON.stringify(achievements));
    }
  }, [user, achievements]);

  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-session',
        name: 'First Steps',
        description: 'Complete your first yoga session',
        icon: '🧘',
        unlocked: false,
        category: 'session',
      },
      {
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Practice yoga for 7 days in a row',
        icon: '🔥',
        unlocked: false,
        category: 'streak',
      },
      {
        id: 'perfect-pose',
        name: 'Perfect Form',
        description: 'Achieve 95% accuracy in a pose',
        icon: '⭐',
        unlocked: false,
        category: 'pose',
      },
      {
        id: 'hundred-minutes',
        name: 'Century Club',
        description: 'Practice for 100 minutes total',
        icon: '💯',
        unlocked: false,
        category: 'time',
      },
    ];
    setAchievements(defaultAchievements);
  };

  const addSession = (session: SessionData) => {
    setSessions(prev => [...prev, session]);
    updateWeeklyProgress(session);
    checkAchievements(session);
  };

  const updateSession = (sessionId: string, updates: Partial<SessionData>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    );
  };

  const updateWeeklyProgress = (session: SessionData) => {
    if (!session.endTime) return;

    const weekStart = getWeekStart(session.startTime);
    const weekKey = weekStart.toISOString().split('T')[0];
    const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60); // minutes
    
    setWeeklyProgress(prev => {
      const existingWeek = prev.find(w => w.week === weekKey);
      if (existingWeek) {
        return prev.map(w =>
          w.week === weekKey
            ? {
                ...w,
                sessions: w.sessions + 1,
                minutes: w.minutes + duration,
                calories: w.calories + session.caloriesBurned,
                avgAccuracy: (w.avgAccuracy * w.sessions + session.totalScore) / (w.sessions + 1),
              }
            : w
        );
      } else {
        return [
          ...prev,
          {
            week: weekKey,
            sessions: 1,
            minutes: duration,
            calories: session.caloriesBurned,
            avgAccuracy: session.totalScore,
          },
        ];
      }
    });
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const checkAchievements = (session: SessionData) => {
    setAchievements(prev => {
      const updated = [...prev];
      
      // First session achievement
      if (!updated.find(a => a.id === 'first-session')?.unlocked && sessions.length === 0) {
        const achievement = updated.find(a => a.id === 'first-session');
        if (achievement) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
        }
      }
      
      // Perfect pose achievement
      if (!updated.find(a => a.id === 'perfect-pose')?.unlocked && session.totalScore >= 95) {
        const achievement = updated.find(a => a.id === 'perfect-pose');
        if (achievement) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
        }
      }
      
      return updated;
    });
  };

  const getSessionStats = () => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => {
      if (session.endTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);
    const avgAccuracy = sessions.length > 0
      ? sessions.reduce((sum, session) => sum + session.totalScore, 0) / sessions.length
      : 0;
    const caloriesBurned = sessions.reduce((sum, session) => sum + session.caloriesBurned, 0);

    return {
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      avgAccuracy: Math.round(avgAccuracy),
      caloriesBurned: Math.round(caloriesBurned),
    };
  };

  const getWeeklyStats = (): WeeklyProgress => {
    const thisWeek = getWeekStart(new Date()).toISOString().split('T')[0];
    return weeklyProgress.find(w => w.week === thisWeek) || {
      week: thisWeek,
      sessions: 0,
      minutes: 0,
      calories: 0,
      avgAccuracy: 0,
    };
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev =>
      prev.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    );
  };

  const value: UserContextType = {
    sessions,
    weeklyProgress,
    achievements,
    addSession,
    updateSession,
    getSessionStats,
    getWeeklyStats,
    unlockAchievement,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};