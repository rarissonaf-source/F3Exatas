export const AUTH_KEY = "f3_auth_ok";
export const CURRENT_KEY = "f3_current_account";
export const PROFILES_KEY = "f3_profiles";
export const LEGACY_USER_KEY = "f3_user";
export const SHARED_ACCOUNT = "_shared";

export interface F3Profile {
  name: string;
  email: string;
  phone: string;
  picture: string;
}

export const EMPTY_PROFILE: F3Profile = { name: "Usuário F3Exatas", email: "", phone: "", picture: "" };

function loadProfiles(): Record<string, F3Profile> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveProfiles(profiles: Record<string, F3Profile>) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function ensureProfile(key: string, seed: F3Profile): F3Profile {
  const profiles = loadProfiles();
  if (!profiles[key]) {
    profiles[key] = seed;
    saveProfiles(profiles);
  }
  return profiles[key];
}

export function getCurrentAccountKey(): string {
  if (typeof window === "undefined") return SHARED_ACCOUNT;

  const key = localStorage.getItem(CURRENT_KEY);
  if (key) return key;

  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_USER_KEY) || "null");
    if (legacy) {
      const migratedKey = legacy.email || SHARED_ACCOUNT;
      ensureProfile(migratedKey, legacy);
      localStorage.setItem(CURRENT_KEY, migratedKey);
      return migratedKey;
    }
  } catch {
    /* ignora */
  }

  localStorage.setItem(CURRENT_KEY, SHARED_ACCOUNT);
  return SHARED_ACCOUNT;
}

export function getCurrentProfile(): F3Profile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  const key = getCurrentAccountKey();
  return ensureProfile(key, EMPTY_PROFILE);
}

export function updateCurrentProfile(updated: F3Profile) {
  const key = getCurrentAccountKey();
  const profiles = loadProfiles();
  profiles[key] = updated;
  saveProfiles(profiles);
}

export function isAuthed(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "1";
}

export function unlockAccount(accountKey: string, seedProfile: F3Profile): F3Profile {
  const resolved = ensureProfile(accountKey, seedProfile);
  localStorage.setItem(CURRENT_KEY, accountKey);
  localStorage.setItem(AUTH_KEY, "1");
  return resolved;
}

export function logoutAccount() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(CURRENT_KEY);
}
