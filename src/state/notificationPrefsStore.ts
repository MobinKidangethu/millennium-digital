import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationPrefsState {
  orderUpdates: boolean;
  stockAlerts: boolean;
  promotions: boolean;
  toggle: (key: 'orderUpdates' | 'stockAlerts' | 'promotions') => void;
}

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      orderUpdates: true,
      stockAlerts: true,
      promotions: false,
      toggle: (key) => set((state) => ({ [key]: !state[key] }) as Partial<NotificationPrefsState>),
    }),
    {
      name: 'md.notificationPrefs',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
