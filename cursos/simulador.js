const COURSES = {
  "ifma-matematica": "Matemática para o Técnico Integrado do IFMA",
  "halliday-fisica": "Física com Halliday — Resolução e Revisão",
};

const SESSION_KEY = "f3cursos_sim_session";

let pendingCode = null;
let pendingSession = null;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidCPF(raw) {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
  let check1 = 11 - (sum % 11);
  if (check1 >= 10) check1 = 0;
  if (check1 !== parseInt(cpf[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
  let check2 = 11 - (sum % 11);
  if (check2 >= 10) check2 = 0;
  return check2 === parseInt(cpf[10], 10);
}

function maskCPF(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  let out = digits;
  if (digits.length > 9) out = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  else if (digits.length > 6) out = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  else if (digits.length > 3) out = `${digits.slice(0, 3)}.${digits.slice(3)}`;
  return out;
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function showStep(id) {
  document.querySelectorAll(".checkout-step").forEach((el) => {
    el.hidden = el.id !== id;
  });
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function renderAccess(session) {
  document.getElementById("access-title").textContent = COURSES[session.courseId] || "Seu curso";
  document.getElementById("access-subtitle").textContent =
    `Matrícula confirmada para ${session.name} (${session.email}). Você já pode acompanhar as aulas por aqui.`;
  showStep("step-access");
}

function startCodeStep(session) {
  pendingSession = session;
  pendingCode = generateCode();
  document.getElementById("code-email-target").textContent = session.email;
  document.getElementById("test-code-display").textContent = pendingCode;
  document.getElementById("code-input").value = "";
  document.getElementById("code-error").textContent = "";
  showStep("step-code");
}

function initPurchaseForm() {
  const form = document.getElementById("purchase-form");
  const emailInput = document.getElementById("email-input");
  const cpfInput = document.getElementById("cpf-input");
  const emailError = document.getElementById("email-error");
  const cpfError = document.getElementById("cpf-error");

  cpfInput.addEventListener("input", () => {
    cpfInput.value = maskCPF(cpfInput.value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    emailError.textContent = "";
    cpfError.textContent = "";
    emailInput.classList.remove("field-invalid");
    cpfInput.classList.remove("field-invalid");

    const name = document.getElementById("name-input").value.trim();
    const email = emailInput.value.trim();
    const cpf = cpfInput.value.trim();
    const courseId = document.getElementById("course-select").value;

    let valid = true;
    if (!isValidEmail(email)) {
      emailError.textContent = "Digite um e-mail válido.";
      emailInput.classList.add("field-invalid");
      valid = false;
    }
    if (!isValidCPF(cpf)) {
      cpfError.textContent = "CPF inválido. Confira os números digitados.";
      cpfInput.classList.add("field-invalid");
      valid = false;
    }
    if (!name) {
      valid = false;
    }
    if (!valid) return;

    startCodeStep({ name, email, cpf, courseId, verifiedAt: null });
  });
}

function initCodeForm() {
  const form = document.getElementById("code-form");
  const codeInput = document.getElementById("code-input");
  const codeError = document.getElementById("code-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    codeError.textContent = "";
    codeInput.classList.remove("field-invalid");

    if (codeInput.value.trim() !== pendingCode) {
      codeError.textContent = "Código incorreto. Confira o valor mostrado acima (modo teste).";
      codeInput.classList.add("field-invalid");
      return;
    }

    const session = { ...pendingSession, verifiedAt: Date.now() };
    saveSession(session);
    renderAccess(session);
  });

  document.getElementById("resend-code-btn").addEventListener("click", () => {
    if (!pendingSession) return;
    startCodeStep(pendingSession);
  });

  document.getElementById("back-to-purchase-btn").addEventListener("click", () => {
    pendingSession = null;
    pendingCode = null;
    showStep("step-purchase");
  });
}

function initAccessStep() {
  document.getElementById("new-device-btn").addEventListener("click", () => {
    const session = loadSession();
    if (!session) return;
    clearSession();
    startCodeStep({ ...session, verifiedAt: null });
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    clearSession();
    pendingSession = null;
    pendingCode = null;
    document.getElementById("purchase-form").reset();
    showStep("step-purchase");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPurchaseForm();
  initCodeForm();
  initAccessStep();

  const existing = loadSession();
  if (existing && existing.verifiedAt) {
    renderAccess(existing);
  } else {
    showStep("step-purchase");
  }
});
