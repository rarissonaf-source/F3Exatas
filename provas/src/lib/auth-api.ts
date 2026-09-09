import { BASE_PATH } from "./base-path";

const AUTH_API_BASE = `${BASE_PATH}/api/auth`;

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  password: string;
}

interface AuthResult {
  ok: boolean;
  token?: string;
  name?: string;
  email?: string;
  phone?: string;
  error?: string;
}

async function postJson(path: string, body: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(`${AUTH_API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, error: "Não foi possível conectar. Tente novamente." };
  }
}

export function signup(payload: SignupPayload) {
  return postJson("/signup", payload);
}

export function login(email: string, password: string) {
  return postJson("/login", { email, password });
}

export function apiLogout(token: string) {
  return postJson("/logout", { token });
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(`${AUTH_API_BASE}/me?token=${encodeURIComponent(token)}`);
    return res.ok;
  } catch {
    return false;
  }
}

export const BR_STATES: [string, string][] = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"],
  ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"],
  ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"], ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SP", "São Paulo"],
  ["SE", "Sergipe"], ["TO", "Tocantins"],
];

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  let out = "";
  if (digits.length > 0) out += "(" + digits.slice(0, 2);
  if (digits.length >= 2) out += ") ";
  const rest = digits.slice(2);
  if (rest.length > 4 && digits.length <= 10) {
    out += rest.slice(0, 4) + "-" + rest.slice(4, 8);
  } else if (rest.length > 4) {
    out += rest.slice(0, 5) + "-" + rest.slice(5, 9);
  } else {
    out += rest;
  }
  return out;
}

export async function fetchCitiesForState(uf: string): Promise<string[]> {
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((m: { nome: string }) => m.nome) : [];
  } catch {
    return [];
  }
}
