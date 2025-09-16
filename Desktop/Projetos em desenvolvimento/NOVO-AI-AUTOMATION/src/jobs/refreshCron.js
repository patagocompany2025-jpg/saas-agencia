const cron = require("node-cron");
const { refreshIfNeeded } = require("../lib/tokenManager");

function startRefreshJob() {
  cron.schedule("*/5 * * * *", async () => {
    try { await refreshIfNeeded(); } 
    catch (e) { console.error("CRON refresh error:", e.message); }
  });
  console.log("⏱️ Cron de renovação iniciado (5/5 min).");
}
module.exports = { startRefreshJob };
