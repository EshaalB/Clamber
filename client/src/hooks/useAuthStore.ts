/**
 * useAuthStore
 * Manages global authentication state with Zustand.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  onboardingCompleted: boolean;
  year?: number;
  major?: string;
  targetGPA?: number;
  streak?: number;
  lastWellnessUpdate?: string | Date;
  settings?: {
    soundEnabled?: boolean;
    volume?: number;
    notifications?: {
      taskReminders?: boolean;
      burnoutAlerts?: boolean;
      deadlineWarnings?: boolean;
      weeklySummary?: boolean;
      gradeMilestones?: boolean;
      scheduleReminders?: boolean;
    };
    advisorAccess?: {
      consentEnabled?: boolean;
      advisorEmail?: string;
    };
    prayerTimes?: {
      mode?: 'auto' | 'manual';
      location?: string;
      fajr?: string;
      dhuhr?: string;
      asr?: string;
      maghrib?: string;
      isha?: string;
    };
    blockedTimePeriods?: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      label?: string;
    }>;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Also store tokens separately for apiClient interceptor
        localStorage.setItem('clamber-tokens', JSON.stringify({ accessToken, refreshToken }));
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      logout: () => {
        localStorage.removeItem('clamber-tokens');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    { name: 'clamber-auth' }
  )
);
