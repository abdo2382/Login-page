// Real-time validation + strength indicator

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const confirmEl = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");

const emailMessage = document.getElementById("emailMessage");
const passwordMessage = document.getElementById("passwordMessage");
const confirmMessage = document.getElementById("confirmMessage");

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const formResult = document.getElementById("formResult");

const form = document.getElementById("signupForm");

function validateEmail(email) {
  if (!email) return { ok: false, msg: "Email is required." };
  // reasonably permissive email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ok = re.test(email.trim());
  return { ok, msg: ok ? "Looks good." : "Enter a valid email address." };
}

function scorePassword(pw) {
  let score = 0;
  if (!pw) return { score: 0, text: "Empty" };
  // length
  if (pw.length >= 8) score += 2;
  else if (pw.length >= 6) score += 1;
  // variety
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  // clamp 0..6
  score = Math.max(0, Math.min(6, score));

  let text = "Very weak";
  if (score <= 1) text = "Very weak";
  else if (score === 2) text = "Weak";
  else if (score === 3) text = "Fair";
  else if (score === 4) text = "Good";
  else if (score === 5) text = "Strong";
  else if (score === 6) text = "Very strong";

  return { score, text };
}

function updateStrengthBar(score) {
  // score 0..6 -> percent
  const pct = Math.round((score / 6) * 100);
  strengthBar.style.setProperty("--pct", `${pct}%`);
  // set width via pseudo-element (we'll set style directly)
  const barInner = strengthBar;
  barInner.style.setProperty("--width", `${pct}%`);
  // set pseudo width by manipulating ::after through style injection
  barInner.style.setProperty("position", "relative");
  // We'll create/ensure an inner fill element for reliable control
  let fill = barInner.querySelector(".fill");
  if (!fill) {
    fill = document.createElement("div");
    fill.className = "fill";
    fill.style.height = "100%";
    fill.style.width = "0%";
    fill.style.transition = "width .25s, background .25s";
    fill.style.borderRadius = "99px";
    barInner.appendChild(fill);
  }
  fill.style.width = `${pct}%`;

  // color by pct
  let color = "#e04545"; // danger
  if (pct > 80) color = "#1e9a4a";
  else if (pct > 60) color = "#2db46d";
  else if (pct > 40) color = "#f0ad4e";
  else color = "#e04545";
  fill.style.background = color;
}

function validatePasswordField(pw) {
  if (!pw) return { ok: false, msg: "Password is required." };
  if (pw.length < 6)
    return { ok: false, msg: "Password must be at least 6 characters." };
  // Prefer at least one letter and one number
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
    return {
      ok: false,
      msg: "Use letters and numbers for a stronger password.",
    };
  }
  // otherwise ok — strength is separate
  return { ok: true, msg: "Good password." };
}

function validateConfirm(pw, confirm) {
  if (!confirm) return { ok: false, msg: "Please confirm your password." };
  if (pw !== confirm) return { ok: false, msg: "Passwords do not match." };
  return { ok: true, msg: "Passwords match." };
}

function updateUI() {
  // email
  const e = validateEmail(emailEl.value);
  emailMessage.textContent = e.msg;
  emailMessage.className = "message" + (e.ok ? " ok" : "");

  // password + strength
  const pScore = scorePassword(passwordEl.value);
  updateStrengthBar(pScore.score);
  strengthText.textContent = pScore.text;

  const p = validatePasswordField(passwordEl.value);
  passwordMessage.textContent = p.msg;
  passwordMessage.className = "message" + (p.ok ? " ok" : "");

  // confirm
  const c = validateConfirm(passwordEl.value, confirmEl.value);
  confirmMessage.textContent = c.msg;
  confirmMessage.className = "message" + (c.ok ? " ok" : "");

  // enable submit only if all true and strength is at least fair
  const allGood = e.ok && p.ok && c.ok && pScore.score >= 3;
  submitBtn.disabled = !allGood;
}

emailEl.addEventListener("input", () => {
  updateUI();
});
passwordEl.addEventListener("input", () => {
  updateUI();
});
confirmEl.addEventListener("input", () => {
  updateUI();
});

// initial call
updateUI();

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  // final check
  updateUI();
  if (submitBtn.disabled) {
    formResult.textContent = "Please fix the errors before submitting.";
    formResult.className = "result error";
    return;
  }
  // Simulate success
  formResult.textContent = "Account created successfully (simulated).";
  formResult.className = "result success";
  // Optionally clear the form
  form.reset();
  updateUI();
});
