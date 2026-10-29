const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const shortEl = document.getElementById("short");
const openEl = document.getElementById("open");
const submitBtn = document.getElementById("submit");
const copyBtn = document.getElementById("copy");

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
  resultEl.hidden = true;
  urlInput.classList.add("invalid");
}

function clearState() {
  errorEl.hidden = true;
  resultEl.hidden = true;
  urlInput.classList.remove("invalid");
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.classList.toggle("loading", loading);
}

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearState();

  const value = urlInput.value.trim();
  if (!isValidUrl(value)) {
    return showError("La URL no es válida. Debe comenzar con http:// o https://");
  }

  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original_url: value }),
    });
    if (res.status === 422) return showError("El servidor rechazó la URL por no ser válida.");
    if (!res.ok) return showError(`El servidor respondió con un error (${res.status}).`);

    const data = await res.json();
    shortEl.value = data.short_url;
    openEl.href = data.short_url;
    resultEl.hidden = false;
  } catch {
    showError("No se pudo conectar con el backend. Verifica que esté en línea e inténtalo de nuevo.");
  } finally {
    setLoading(false);
  }
});

urlInput.addEventListener("input", () => urlInput.classList.remove("invalid"));

copyBtn.addEventListener("click", async () => {
  shortEl.select();
  try {
    await navigator.clipboard.writeText(shortEl.value);
  } catch {
    document.execCommand("copy"); // respaldo: el sitio de S3 es HTTP
  }
  copyBtn.textContent = "¡Copiado!";
  copyBtn.classList.add("copied");
  setTimeout(() => {
    copyBtn.textContent = "Copiar";
    copyBtn.classList.remove("copied");
  }, 1600);
});
