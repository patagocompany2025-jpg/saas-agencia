const axios = require("axios");
const { getAccessToken } = require("./tokenManager");

async function apiGet(url, cfg = {}) {
  const token = await getAccessToken();
  return axios.get(url, { ...cfg, headers: { ...(cfg.headers||{}), Authorization: `Bearer ${token}` }});
}
async function apiPost(url, data, cfg = {}) {
  const token = await getAccessToken();
  return axios.post(url, data, { ...cfg, headers: { ...(cfg.headers||{}), Authorization: `Bearer ${token}` }});
}
module.exports = { apiGet, apiPost };
