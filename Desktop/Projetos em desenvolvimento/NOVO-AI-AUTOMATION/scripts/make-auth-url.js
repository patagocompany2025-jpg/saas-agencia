require("dotenv").config();

function buildAuthUrl() {
  if (!process.env.AUTH_URL) {
    console.error("Defina AUTH_URL no .env");
    process.exit(1);
  }
  const u = new URL(process.env.AUTH_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", process.env.CLIENT_ID);
  u.searchParams.set("redirect_uri", process.env.REDIRECT_URI);
  if (process.env.SCOPES) u.searchParams.set("scope", process.env.SCOPES);
  // Some providers may need extra params; manter flexível:
  if (process.env.EXTRA_AUTH_PARAMS) {
    const pairs = process.env.EXTRA_AUTH_PARAMS.split("&");
    pairs.forEach(p => {
      const [k, v] = p.split("=");
      if (k && v) u.searchParams.set(k, v);
    });
  }
  console.log("ENV ATIVO:",
    { AUTH_URL: process.env.AUTH_URL,
      CLIENT_ID: (process.env.CLIENT_ID||"").slice(0,4)+"…"+(process.env.CLIENT_ID||"").slice(-4),
      REDIRECT_URI: process.env.REDIRECT_URI,
      SCOPES: process.env.SCOPES
  });
  console.log("\nAbra no navegador esta URL:\n\n" + u.toString() + "\n");
}
buildAuthUrl();
