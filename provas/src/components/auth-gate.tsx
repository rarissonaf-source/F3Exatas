"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/base-path";

const GATE_USER = "f3exatas";
const GATE_PASS = "exatas2026";
const STORAGE_KEY = "f3_auth_ok";

// Cole aqui o Client ID criado no Google Cloud Console (Credentials > OAuth client ID > Web application).
const GOOGLE_CLIENT_ID = "940839767965-tipond9snpkqeubb55rahh8p21c5bqko.apps.googleusercontent.com";
const ALLOWED_GOOGLE_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

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

function decodeJwtPayload(token: string): { email?: string } {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(json);
}

export function AuthGate() {
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
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
            localStorage.setItem(STORAGE_KEY, "1");
            setUnlocked(true);
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

  if (!checked || unlocked) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user.trim() === GATE_USER && pass === GATE_PASS) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError("Usuário ou senha incorretos.");
    }
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
