require("dotenv").config();
const axios = require("axios");

const CODE = process.argv[2];
if (!CODE) {
  console.error("Uso: node scripts/exchange-code.js <AUTH_CODE>");
  process.exit(1);
}

(async () => {
  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: CODE,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });

    const { data } = await axios.post(process.env.TOKEN_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 20000,
    });

    const fs = require("fs");
    const payload = {
      provider: process.env.PROVIDER_NAME || "CONTA_AZUL",
      obtained_at: Date.now(),
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
    fs.writeFileSync("tokens.json", JSON.stringify(payload, null, 2));
    console.log("\n✅ tokens salvos em tokens.json\n", payload);
  } catch (err) {
    console.error("❌ Falha na troca do code:", err.response?.data || err.message);
    process.exit(1);
  }
})();
