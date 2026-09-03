(function () {
  var GATE_USER = "f3exatas";
  var GATE_PASS = "exatas2026";
  var AUTH_KEY = "f3_auth_ok";
  var USER_KEY = "f3_user";

  // Cole aqui o Client ID criado no Google Cloud Console (Credentials > OAuth client ID > Web application).
  var GOOGLE_CLIENT_ID = "940839767965-tipond9snpkqeubb55rahh8p21c5bqko.apps.googleusercontent.com";
  var ALLOWED_GOOGLE_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

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
    ".f3gate-field label{display:block;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;color:rgba(244,246,251,0.55);margin-bottom:6px;}" +
    ".f3gate-field input{width:100%;padding:13px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:#f4f6fb;color:#263959;font-family:'Lato',sans-serif;font-size:15px;outline:none;}" +
    ".f3gate-field input:focus{border-color:#f38d33;}" +
    ".f3gate-error{font-size:13px;color:#f38d33;margin:-4px 0 14px;min-height:16px;}" +
    ".f3gate-submit{width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(160deg,#f38d33,#d9701c);color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;cursor:pointer;}" +
    ".f3gate-submit:hover{opacity:0.92;}" +
    ".f3gate-submit-ghost{background:none;border:1px solid rgba(255,255,255,0.14);color:#f4f6fb;margin-top:10px;}" +
    ".f3gate-links{margin-top:18px;display:flex;align-items:center;justify-content:center;gap:10px;}" +
    ".f3gate-links button{background:none;border:none;padding:0;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;color:#8a93a8;cursor:pointer;}" +
    ".f3gate-links button:hover{color:#f38d33;}" +
    ".f3gate-links-sep{color:rgba(244,246,251,0.25);font-size:12px;}" +
    ".f3gate-hint-msg{display:none;font-size:12px;color:rgba(244,246,251,0.55);margin-top:12px;}" +
    ".f3gate-hint-msg.is-visible{display:block;}" +
    ".f3acc-toggle{position:fixed;top:14px;right:16px;z-index:99997;width:42px;height:42px;border-radius:12px;background:rgba(19,26,44,0.92);border:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,0.3);}" +
    ".f3acc-toggle span{display:block;width:18px;height:2px;background:#f4f6fb;border-radius:2px;}" +
    ".f3acc-backdrop{position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.5);opacity:0;pointer-events:none;transition:opacity 0.25s ease;}" +
    ".f3acc-backdrop.is-open{opacity:1;pointer-events:auto;}" +
    ".f3acc-drawer{position:fixed;top:0;right:0;height:100%;width:280px;max-width:85vw;background:#131a2c;border-left:1px solid rgba(255,255,255,0.08);z-index:99999;transform:translateX(100%);transition:transform 0.3s ease;padding:24px 20px;display:flex;flex-direction:column;font-family:'Lato',sans-serif;box-shadow:-16px 0 32px rgba(0,0,0,0.3);}" +
    ".f3acc-drawer.is-open{transform:translateX(0);}" +
    ".f3acc-drawer-close{align-self:flex-end;background:none;border:none;color:rgba(244,246,251,0.5);font-size:22px;line-height:1;cursor:pointer;margin-bottom:12px;}" +
    ".f3acc-drawer-close:hover{color:#f4f6fb;}" +
    ".f3acc-profile{display:flex;flex-direction:column;align-items:center;text-align:center;padding-bottom:20px;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.08);}" +
    ".f3acc-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover;background:#f38d33;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-size:22px;font-weight:700;margin-bottom:12px;}" +
    ".f3acc-profile-name{font-family:'Montserrat',sans-serif;font-size:15px;font-weight:700;color:#f4f6fb;}" +
    ".f3acc-profile-email{font-size:12px;color:rgba(244,246,251,0.5);margin-top:2px;}" +
    ".f3acc-drawer nav{display:flex;flex-direction:column;gap:4px;}" +
    ".f3acc-drawer nav button{width:100%;text-align:left;background:none;border:none;padding:11px 12px;border-radius:10px;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:600;color:#f4f6fb;cursor:pointer;}" +
    ".f3acc-drawer nav button:hover{background:rgba(255,255,255,0.06);}" +
    ".f3acc-drawer nav button.f3acc-logout{color:#f38d33;}";
  document.head.appendChild(style);

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

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null") || {};
    } catch (e) {
      return {};
    }
  }

  function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function initials(name) {
    return (name || "F3")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (p) {
        return p.charAt(0).toUpperCase();
      })
      .join("");
  }

  // ===== Menu lateral de conta (ícone de três barras + drawer) =====
  function renderAccountWidget() {
    var user = getUser();

    var toggle = document.createElement("div");
    toggle.className = "f3acc-toggle";
    toggle.id = "f3acc-toggle";
    toggle.innerHTML = "<span></span><span></span><span></span>";
    document.body.appendChild(toggle);

    var backdrop = document.createElement("div");
    backdrop.className = "f3acc-backdrop";
    backdrop.id = "f3acc-backdrop";
    document.body.appendChild(backdrop);

    var drawer = document.createElement("div");
    drawer.className = "f3acc-drawer";
    drawer.id = "f3acc-drawer";
    drawer.innerHTML =
      '<button type="button" class="f3acc-drawer-close" id="f3acc-drawer-close">&times;</button>' +
      '<div class="f3acc-profile">' +
      (user.picture
        ? '<img class="f3acc-avatar" src="' + user.picture + '" alt="">'
        : '<span class="f3acc-avatar">' + initials(user.name) + "</span>") +
      '<div class="f3acc-profile-name">' + (user.name || "Usuário F3Exatas") + "</div>" +
      '<div class="f3acc-profile-email">' + (user.email || "") + "</div>" +
      "</div>" +
      "<nav>" +
      '<button type="button" id="f3acc-edit-btn">Editar dados</button>' +
      '<button type="button" class="f3acc-logout" id="f3acc-logout-btn">Sair da conta</button>' +
      "</nav>";
    document.body.appendChild(drawer);

    function openDrawer() {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
    }
    function closeDrawer() {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
    }

    toggle.addEventListener("click", openDrawer);
    backdrop.addEventListener("click", closeDrawer);
    document.getElementById("f3acc-drawer-close").addEventListener("click", closeDrawer);

    document.getElementById("f3acc-logout-btn").addEventListener("click", function () {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      location.reload();
    });

    document.getElementById("f3acc-edit-btn").addEventListener("click", function () {
      closeDrawer();
      openEditModal();
    });
  }

  function openEditModal() {
    var user = getUser();
    var overlay = document.createElement("div");
    overlay.className = "f3gate-overlay";
    overlay.style.zIndex = "999999";
    overlay.innerHTML =
      '<div class="f3gate-card">' +
      '<div class="f3gate-title">Editar dados</div>' +
      '<div class="f3gate-subtitle">Essas informações ficam salvas só neste navegador.</div>' +
      '<form id="f3acc-edit-form">' +
      '<div class="f3gate-field"><label>Nome</label><input id="f3acc-name" type="text" value="' + (user.name || "").replace(/"/g, "&quot;") + '"></div>' +
      '<div class="f3gate-field"><label>Número</label><input id="f3acc-phone" type="tel" placeholder="(00) 00000-0000" value="' + (user.phone || "").replace(/"/g, "&quot;") + '"></div>' +
      '<div class="f3gate-field"><label>E-mail</label><input id="f3acc-email" type="email" value="' + (user.email || "").replace(/"/g, "&quot;") + '"></div>' +
      '<button type="submit" class="f3gate-submit">Salvar</button>' +
      '<button type="button" class="f3gate-submit f3gate-submit-ghost" id="f3acc-cancel-btn">Cancelar</button>' +
      "</form>" +
      "</div>";
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
    document.getElementById("f3acc-cancel-btn").addEventListener("click", function () {
      overlay.remove();
    });
    document.getElementById("f3acc-edit-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var updated = {
        name: document.getElementById("f3acc-name").value.trim(),
        phone: document.getElementById("f3acc-phone").value.trim(),
        email: document.getElementById("f3acc-email").value.trim(),
        picture: user.picture || "",
      };
      saveUser(updated);
      overlay.remove();
      ["f3acc-toggle", "f3acc-backdrop", "f3acc-drawer"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.remove();
      });
      renderAccountWidget();
    });
  }

  if (localStorage.getItem(AUTH_KEY) === "1") {
    renderAccountWidget();
    return;
  }

  // ===== Gate de login =====
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

  function unlock(user) {
    localStorage.setItem(AUTH_KEY, "1");
    saveUser(user || { name: "Usuário F3Exatas", email: "", phone: "", picture: "" });
    document.documentElement.style.overflow = "";
    overlay.remove();
    renderAccountWidget();
  }

  function handleGoogleCredential(response) {
    var payload = decodeJwtPayload(response.credential);
    var email = (payload.email || "").toLowerCase();
    if (ALLOWED_GOOGLE_EMAILS.indexOf(email) !== -1) {
      unlock({ name: payload.name || "", email: email, phone: "", picture: payload.picture || "" });
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
      unlock({ name: "Usuário F3Exatas", email: "", phone: "", picture: "" });
    } else {
      document.getElementById("f3gate-error").textContent = "Usuário ou senha incorretos.";
    }
  });
})();
