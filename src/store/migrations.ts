import { AppLibraryState, Settings } from '../domain/types';

export const LIBRARY_STORE_VERSION = 1;
export const SETTINGS_STORE_VERSION = 1;

export function migrateLibraryState(persistedState: unknown, version: number): AppLibraryState {
  if (version === 0) {
    // Migration cho các phiên bản cũ hơn v1 nếu có trong tương lai
  }
  return persistedState as AppLibraryState;
}

export function migrateSettingsState(persistedState: unknown, version: number): Settings {
  if (version === 0) {
    // Migration settings nếu có trong tương lai
  }
  return persistedState as Settings;
}
