import { create } from 'zustand';
import { persist } from 'zustand/middleware';
 

interface UserProfile {
  name: string;
  title: string;
  avatar?: string;
}

interface SettingsState {
  theme: 'light' | 'dark';
  accentColor: string;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  user: UserProfile;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      accentColor: '#fbcfe8', // Pastel Pink
      fontSize: 'base',
      user: {
        name: 'Eshaal Rehmatullah',
        title: 'FAST NUCES, 3rd year BSCS',
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      setAccentColor: (color) => {
        set({ accentColor: color });
        document.documentElement.style.setProperty('--active-accent', color);
      },
      setFontSize: (fontSize) => set({ fontSize }),
      updateUser: (newUser) =>
        set((state) => ({ user: { ...state.user, ...newUser } })),
    }),
    {
      name: 'clamber-settings',
    }
  )
);
