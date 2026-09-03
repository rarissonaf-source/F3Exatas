"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";

const GATE_USER = "f3exatas";
const GATE_PASS = "exatas2026";
const AUTH_KEY = "f3_auth_ok";
const USER_KEY = "f3_user";

// Cole aqui o Client ID criado no Google Cloud Console (Credentials > OAuth client ID > Web application).
const GOOGLE_CLIENT_ID = "940839767965-tipond9snpkqeubb55rahh8p21c5bqko.apps.googleusercontent.com";
const ALLOWED_GOOGLE_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

type F3User = {
  name: string;
  email: string;
  phone: string;
  picture: string;
};

const EMPTY_USER: F3User = { name: "Usuário F3Exatas", email: "", phone: "", picture: "" };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function decodeJwtPayload(token: string): { email?: string; name?: string; picture?: string } {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(json);
}

function initials(name: string): string {
  return (name || "F3")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function loadUser(): F3User {
  try {
    return { ...EMPTY_USER, ...JSON.parse(localStorage.getItem(USER_KEY) || "{}") };
  } catch {
    return EMPTY_USER;
  }
}

export function AuthGate() {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [account, setAccount] = useState<F3User>(EMPTY_USER);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnlocked(localStorage.getItem(AUTH_KEY) === "1");
    setAccount(loadUser());
    setChecked(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = checked && !unlocked ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [checked, unlocked]);

  useEffect(() => {
    if (!checked || unlocked || !GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = decodeJwtPayload(response.credential);
          const email = (payload.email || "").toLowerCase();
          if (ALLOWED_GOOGLE_EMAILS.includes(email)) {
            unlock({ name: payload.name || "", email, phone: "", picture: payload.picture || "" });
          } else {
            setError("E-mail não autorizado. Fale com a F3Exatas para liberar seu acesso.");
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        locale: "pt_BR",
        width: 300,
      });
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [checked, unlocked]);

  function unlock(newUser: F3User) {
    localStorage.setItem(AUTH_KEY, "1");
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAccount(newUser);
    setUnlocked(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user.trim() === GATE_USER && pass === GATE_PASS) {
      unlock(EMPTY_USER);
    } else {
      setError("Usuário ou senha incorretos.");
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    location.reload();
  }

  if (!checked) return null;

  if (unlocked) {
    return (
      <>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          className="fixed right-4 top-3.5 z-[99997] flex h-[42px] w-[42px] flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-[#131a2cea] shadow-lg"
        >
          <span className="block h-0.5 w-[18px] rounded bg-white" />
          <span className="block h-0.5 w-[18px] rounded bg-white" />
          <span className="block h-0.5 w-[18px] rounded bg-white" />
        </button>

        <div
          onClick={() => setDrawerOpen(false)}
          className={`fixed inset-0 z-[99998] bg-black/50 transition-opacity duration-200 ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <div
          className={`fixed right-0 top-0 z-[99999] flex h-full w-[280px] max-w-[85vw] flex-col border-l border-white/10 bg-[#131a2c] p-6 shadow-2xl transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="mb-3 self-end text-2xl leading-none text-white/50 hover:text-white"
          >
            &times;
          </button>
          <div className="mb-4 flex flex-col items-center border-b border-white/10 pb-5 text-center">
            {account.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={account.picture} alt="" className="mb-3 h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange font-heading text-xl font-bold text-white">
                {initials(account.name)}
              </span>
            )}
            <div className="font-heading text-sm font-bold text-white">{account.name || "Usuário F3Exatas"}</div>
            <div className="mt-0.5 text-xs text-white/50">{account.email}</div>
          </div>
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                setEditOpen(true);
              }}
              className="rounded-lg px-3 py-2.5 text-left font-heading text-sm font-semibold text-white hover:bg-white/5"
            >
              Editar dados
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left font-heading text-sm font-semibold text-brand-orange hover:bg-white/5"
            >
              Sair da conta
            </button>
          </nav>
        </div>

        {editOpen && (
          <EditModal
            account={account}
            onCancel={() => setEditOpen(false)}
            onSave={(updated) => {
              localStorage.setItem(USER_KEY, JSON.stringify(updated));
              setAccount(updated);
              setEditOpen(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-brand-navy-dark p-6">
      <div className="w-full max-w-sm rounded-[22px] border border-white/10 bg-[#131a2c] p-10 text-center shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/brand/f3-logo.jpg`}
          alt="F3Exatas"
          className="mx-auto mb-4 h-16 w-16 rounded-full object-cover"
        />
        <h1 className="mb-2 font-heading text-xl font-extrabold text-white">
          F3Exatas
        </h1>
        <p className="mb-5 text-sm leading-relaxed text-white/60">
          Entre com seu usuário e senha para continuar.
        </p>
        {GOOGLE_CLIENT_ID && (
          <>
            <div ref={googleBtnRef} className="mb-5 flex min-h-10 justify-center" />
            <div className="mb-5 flex items-center gap-2.5 text-xs text-white/40">
              <span className="h-px flex-1 bg-white/10" />
              ou
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}
        <form onSubmit={handleSubmit} className="text-left">
          <div className="mb-3.5">
            <input
              type="text"
              placeholder="Usuário"
              autoComplete="username"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#f4f6fb] px-4 py-3 text-sm text-brand-navy outline-none focus:border-brand-orange"
            />
          </div>
          <div className="mb-3.5">
            <input
              type="password"
              placeholder="Senha"
              autoComplete="current-password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#f4f6fb] px-4 py-3 text-sm text-brand-navy outline-none focus:border-brand-orange"
            />
          </div>
          <div className="mb-3.5 min-h-4 text-xs text-brand-orange">{error}</div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark py-3.5 font-heading text-sm font-bold text-white hover:opacity-90"
          >
            Entrar
          </button>
        </form>
        <div className="mt-4.5 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setHint("Fale com a F3Exatas pra recuperar o acesso.")}
            className="font-heading text-xs font-bold text-[#8a93a8] hover:text-brand-orange"
          >
            Esqueceu a senha?
          </button>
          <span className="text-xs text-white/25">&middot;</span>
          <button
            type="button"
            onClick={() => setHint("Fale com a F3Exatas pra solicitar sua conta.")}
            className="font-heading text-xs font-bold text-[#8a93a8] hover:text-brand-orange"
          >
            Criar conta
          </button>
        </div>
        {hint && <p className="mt-3 text-xs text-white/50">{hint}</p>}
      </div>
    </div>
  );
}

function EditModal({
  account,
  onCancel,
  onSave,
}: {
  account: F3User;
  onCancel: () => void;
  onSave: (updated: F3User) => void;
}) {
  const [name, setName] = useState(account.name);
  const [phone, setPhone] = useState(account.phone);
  const [email, setEmail] = useState(account.email);

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-brand-navy-dark p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-[22px] border border-white/10 bg-[#131a2c] p-10 text-center shadow-2xl">
        <h1 className="mb-2 font-heading text-xl font-extrabold text-white">Editar dados</h1>
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Essas informações ficam salvas só neste navegador.
        </p>
        <form
          className="text-left"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ name: name.trim(), phone: phone.trim(), email: email.trim(), picture: account.picture });
          }}
        >
          <div className="mb-3.5">
            <label className="mb-1.5 block font-heading text-xs font-bold text-white/55">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#f4f6fb] px-4 py-3 text-sm text-brand-navy outline-none focus:border-brand-orange"
            />
          </div>
          <div className="mb-3.5">
            <label className="mb-1.5 block font-heading text-xs font-bold text-white/55">Número</label>
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#f4f6fb] px-4 py-3 text-sm text-brand-navy outline-none focus:border-brand-orange"
            />
          </div>
          <div className="mb-3.5">
            <label className="mb-1.5 block font-heading text-xs font-bold text-white/55">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#f4f6fb] px-4 py-3 text-sm text-brand-navy outline-none focus:border-brand-orange"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark py-3.5 font-heading text-sm font-bold text-white hover:opacity-90"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-2.5 w-full rounded-xl border border-white/15 py-3.5 font-heading text-sm font-bold text-white"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
