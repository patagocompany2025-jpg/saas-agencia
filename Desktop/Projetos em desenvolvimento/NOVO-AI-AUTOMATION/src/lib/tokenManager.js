const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const TOKENS_FILE = "tokens.json";
const SAFETY_WINDOW_MS = 5 * 60 * 1000; // renova 5min antes

function loadTokens() {
  if (!fs.existsSync(TOKENS_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8"));
}
function saveTokens(obj) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(obj, null, 2));
}

async function refreshIfNeeded() {
  let t = loadTokens();
  if (!t || !t.access_token || !t.refresh_token) {
    throw new Error("Sem tokens válidos. Gere primeiro com scripts/exchange-code.js");
  }
  const obtainedAt = t.obtained_at || Date.now();
  const expiresInMs = (t.expires_in || 3600) * 1000;
  const expiresAt = obtainedAt + expiresInMs;

  const mustRefresh = Date.now() > (expiresAt - SAFETY_WINDOW_MS);
  if (!mustRefresh) return t.access_token;

  try {
    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: t.refresh_token,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });
    const { data } = await axios.post(process.env.TOKEN_URL, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 20000,
    });

    t.access_token = data.access_token;
    if (data.refresh_token) t.refresh_token = data.refresh_token;
    t.expires_in = data.expires_in || t.expires_in;
    t.obtained_at = Date.now();
    saveTokens(t);
    console.log("🔄 Access token renovado.");
    return t.access_token;
  } catch (e) {
    const msg = e?.response?.data || e.message;
    console.error("❌ Erro ao renovar token:", msg);
    throw new Error("invalid_grant ou erro de refresh. Gere novo refresh_token (refaça autorização).");
  }
}

async function getAccessToken() {
  return refreshIfNeeded();
}

module.exports = { getAccessToken, refreshIfNeeded };
