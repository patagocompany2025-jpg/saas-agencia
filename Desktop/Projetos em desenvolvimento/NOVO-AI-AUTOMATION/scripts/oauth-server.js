const express = require("express");
require("dotenv").config();
const app = express();

app.get("/oauth/callback", (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Faltou ?code=");
  console.log("\n=== AUTH CODE RECEBIDO ===\n", code, "\n===========================\n");
  return res.send("✅ Código recebido. Volte ao terminal para trocar pelo token.");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Callback em http://localhost:${PORT}/oauth/callback`);
});
