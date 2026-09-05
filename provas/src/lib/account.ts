import { BASE_PATH } from "./base-path";

export const AUTH_KEY = "f3_auth_ok";
export const CURRENT_KEY = "f3_current_account";
export const PROFILE_CACHE_KEY = "f3_profile_cache";
export const LEGACY_USER_KEY = "f3_user";
export const SHARED_ACCOUNT = "_shared";

export interface F3Profile {
  name: string;
  email: string;
  phone: string;
  picture: string;
}

export const EMPTY_PROFILE: F3Profile = { name: "Usuário F3Exatas", email: "", phone: "", picture: "" };

function loadCache(): Record<string, F3Profile> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveCache(key: string, profile: F3Profile) {
  if (typeof window === "undefined") return;
  const cache = loadCache();
  cache[key] = profile;
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
}

export function getCurrentAccountKey(): string {
  if (typeof window === "undefined") return SHARED_ACCOUNT;

  const key = localStorage.getItem(CURRENT_KEY);
  if (key) return key;

  // Migração de sessões antigas que guardavam a conta em f3_user.
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_USER_KEY) || "null");
    if (legacy?.email) {
      localStorage.setItem(CURRENT_KEY, legacy.email);
      return legacy.email;
    }
  } catch {
    /* ignora */
  }

  localStorage.setItem(CURRENT_KEY, SHARED_ACCOUNT);
  return SHARED_ACCOUNT;
}

/** Devolve o último perfil conhecido (cache local), pra pintar a tela sem esperar a rede. */
export function getCachedProfile(): F3Profile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  return loadCache()[getCurrentAccountKey()] ?? EMPTY_PROFILE;
}

/** Busca o perfil no servidor (fonte de verdade, compartilhada entre dispositivos). */
export async function fetchCurrentProfile(): Promise<F3Profile> {
  const key = getCurrentAccountKey();
  try {
    const res = await fetch(`${BASE_PATH}/api/profile?accountKey=${encodeURIComponent(key)}`);
    const data = await res.json();
    const profile: F3Profile = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      picture: data.picture || "",
    };
    saveCache(key, profile);
    return profile;
  } catch {
    return getCachedProfile();
  }
}

export async function updateCurrentProfile(updated: F3Profile): Promise<F3Profile> {
  const key = getCurrentAccountKey();
  saveCache(key, updated);
  try {
    const res = await fetch(`${BASE_PATH}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountKey: key, ...updated }),
    });
    const data = await res.json();
    const profile: F3Profile = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      picture: data.picture || "",
    };
    saveCache(key, profile);
    return profile;
  } catch {
    return updated;
  }
}

export function isAuthed(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === "1";
}

/**
 * Libera o acesso e resolve o perfil da conta: se já existir perfil salvo no
 * servidor, usa ele; senão, semeia com os dados informados (ex.: nome/foto do Google).
 */
export async function unlockAccount(accountKey: string, seedProfile: F3Profile): Promise<F3Profile> {
  localStorage.setItem(CURRENT_KEY, accountKey);
  localStorage.setItem(AUTH_KEY, "1");

  const existing = await fetchCurrentProfile();
  if (existing.name || existing.email || existing.phone || existing.picture) {
    return existing;
  }
  return updateCurrentProfile(seedProfile);
}

export function logoutAccount() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(CURRENT_KEY);
}
