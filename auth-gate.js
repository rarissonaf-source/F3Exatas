(function () {
  var GATE_USER = "f3exatas";
  var GATE_PASS = "exatas2026";
  var STORAGE_KEY = "f3_auth_ok";

  // Cole aqui o Client ID criado no Google Cloud Console (Credentials > OAuth client ID > Web application).
  var GOOGLE_CLIENT_ID = "940839767965-tipond9snpkqeubb55rahh8p21c5bqko.apps.googleusercontent.com";
  var ALLOWED_GOOGLE_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

  if (localStorage.getItem(STORAGE_KEY) === "1") return;

  var script = document.currentScript;
  var base = (script && script.getAttribute("data-base")) || "";

  var style = document.createElement("style");
  style.textContent =
    ".f3gate-overlay{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px;" +
    "background:radial-gradient(ellipse 900px 520px at 12% 8%,rgba(243,141,51,0.10),transparent 60%),radial-gradient(ellipse 800px 600px at 88% 38%,rgba(77,106,160,0.16),transparent 60%),#0a0e1a;" +
    "font-family:'Lato',sans-serif;}" +
    ".f3gate-card{width:100%;max-width:380px;background:#131a2c;border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:40px 32px;box-shadow:0 24px 44px rgba(0,0,0,0.4);text-align:center;}" +
    ".f3gate-logo{width:64px;height:64px;object-fit:contain;filter:brightness(0) invert(1);margin-bottom:18px;}" +
    ".f3gate-title{font-family:'Montserrat',sans-serif;font-weight:800;font-size:22px;color:#f4f6fb;margin-bottom:8px;}" +
    ".f3gate-subtitle{font-size:14px;color:rgba(244,246,251,0.66);margin-bottom:22px;line-height:1.5;}" +
    ".f3gate-google{display:flex;justify-content:center;margin-bottom:20px;min-height:40px;}" +
    ".f3gate-divider{display:flex;align-items:center;gap:10px;margin-bottom:20px;font-size:12px;color:rgba(244,246,251,0.4);}" +
    ".f3gate-divider::before,.f3gate-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.1);}" +
    ".f3gate-field{margin-bottom:14px;text-align:left;}" +
    ".f3gate-field input{width:100%;padding:13px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:#f4f6fb;color:#263959;font-family:'Lato',sans-serif;font-size:15px;outline:none;}" +
    ".f3gate-field input:focus{border-color:#f38d33;}" +
    ".f3gate-error{font-size:13px;color:#f38d33;margin:-4px 0 14px;min-height:16px;}" +
    ".f3gate-submit{width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(160deg,#f38d33,#d9701c);color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;cursor:pointer;}" +
    ".f3gate-submit:hover{opacity:0.92;}" +
    ".f3gate-links{margin-top:18px;display:flex;align-items:center;justify-content:center;gap:10px;}" +
    ".f3gate-links button{background:none;border:none;padding:0;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;color:#8a93a8;cursor:pointer;}" +
    ".f3gate-links button:hover{color:#f38d33;}" +
    ".f3gate-links-sep{color:rgba(244,246,251,0.25);font-size:12px;}" +
    ".f3gate-hint-msg{display:none;font-size:12px;color:rgba(244,246,251,0.55);margin-top:12px;}" +
    ".f3gate-hint-msg.is-visible{display:block;}";
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.className = "f3gate-overlay";
  overlay.innerHTML =
    '<div class="f3gate-card">' +
    '<img class="f3gate-logo" src="' + base + 'assets/logo-f3.png" alt="F3Exatas">' +
    '<div class="f3gate-title">F3Exatas</div>' +
    '<div class="f3gate-subtitle">Entre com seu usuário e senha para continuar.</div>' +
    '<div class="f3gate-google" id="f3gate-google"></div>' +
    '<div class="f3gate-divider">ou</div>' +
    '<form id="f3gate-form">' +
    '<div class="f3gate-field"><input id="f3gate-user" type="text" placeholder="Usuário" autocomplete="username" required></div>' +
    '<div class="f3gate-field"><input id="f3gate-pass" type="password" placeholder="Senha" autocomplete="current-password" required></div>' +
    '<div class="f3gate-error" id="f3gate-error"></div>' +
    '<button type="submit" class="f3gate-submit">Entrar</button>' +
    '</form>' +
    '<div class="f3gate-links">' +
    '<button type="button" id="f3gate-forgot-btn">Esqueceu a senha?</button>' +
    '<span class="f3gate-links-sep">&middot;</span>' +
    '<button type="button" id="f3gate-create-btn">Criar conta</button>' +
    '</div>' +
    '<div class="f3gate-hint-msg" id="f3gate-hint-msg"></div>' +
    '</div>';

  document.documentElement.style.overflow = "hidden";
  document.body.appendChild(overlay);

  var hintMsg = document.getElementById("f3gate-hint-msg");
  function showHint(text) {
    hintMsg.textContent = text;
    hintMsg.classList.add("is-visible");
  }

  function unlock() {
    localStorage.setItem(STORAGE_KEY, "1");
    document.documentElement.style.overflow = "";
    overlay.remove();
  }

  function decodeJwtPayload(token) {
    var base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    var json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  }

  function handleGoogleCredential(response) {
    var payload = decodeJwtPayload(response.credential);
    var email = (payload.email || "").toLowerCase();
    if (ALLOWED_GOOGLE_EMAILS.indexOf(email) !== -1) {
      unlock();
    } else {
      document.getElementById("f3gate-error").textContent = "E-mail não autorizado. Fale com a F3Exatas para liberar seu acesso.";
    }
  }

  if (GOOGLE_CLIENT_ID) {
    var gsiScript = document.createElement("script");
    gsiScript.src = "https://accounts.google.com/gsi/client";
    gsiScript.async = true;
    gsiScript.onload = function () {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(document.getElementById("f3gate-google"), {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        locale: "pt_BR",
        width: 300,
      });
    };
    document.head.appendChild(gsiScript);
  } else {
    document.getElementById("f3gate-google").style.display = "none";
    document.querySelector(".f3gate-divider").style.display = "none";
  }

  document.getElementById("f3gate-forgot-btn").addEventListener("click", function () {
    showHint("Fale com a F3Exatas pra recuperar o acesso.");
  });

  document.getElementById("f3gate-create-btn").addEventListener("click", function () {
    showHint("Fale com a F3Exatas pra solicitar sua conta.");
  });

  document.getElementById("f3gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var user = document.getElementById("f3gate-user").value.trim();
    var pass = document.getElementById("f3gate-pass").value;
    if (user === GATE_USER && pass === GATE_PASS) {
      unlock();
    } else {
      document.getElementById("f3gate-error").textContent = "Usuário ou senha incorretos.";
    }
  });
})();
