import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../domain/types';
import { SETTINGS_STORE_VERSION, migrateSettingsState } from './migrations';

export interface SettingsActions {
  setTemplateMode: (mode: 'fixed' | 'random') => void;
  setFixedTemplateId: (id: string) => void;
  setShuffleOnOpen: (val: boolean) => void;
  setNoRepeat: (val: boolean) => void;
  setShowAuthor: (val: boolean) => void;
  setFavoritesBoost: (val: boolean) => void;
  setAppearance: (val: 'system' | 'light' | 'dark') => void;
  setExportAlbumName: (val: string) => void;
  resetSettings: () => void;
}

export type SettingsStore = Settings & SettingsActions;

export const DEFAULT_SETTINGS: Settings = {
  templateMode: 'fixed',
  fixedTemplateId: 'tpl-center',
  shuffleOnOpen: true,
  noRepeat: true,
  showAuthor: true,
  favoritesBoost: false,
  appearance: 'system',
  exportAlbumName: 'Quote Wallpaper',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTemplateMode: (mode) => set({ templateMode: mode }),
      setFixedTemplateId: (id) => set({ fixedTemplateId: id }),
      setShuffleOnOpen: (val) => set({ shuffleOnOpen: val }),
      setNoRepeat: (val) => set({ noRepeat: val }),
      setShowAuthor: (val) => set({ showAuthor: val }),
      setFavoritesBoost: (val) => set({ favoritesBoost: val }),
      setAppearance: (val) => set({ appearance: val }),
      setExportAlbumName: (val) => set({ exportAlbumName: val.trim() || 'Quote Wallpaper' }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'qw_settings_store',
      version: SETTINGS_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState, version) => migrateSettingsState(persistedState, version),
    },
  ),
);
