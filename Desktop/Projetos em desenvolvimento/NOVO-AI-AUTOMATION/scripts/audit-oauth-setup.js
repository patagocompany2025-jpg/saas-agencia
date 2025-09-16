const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const http = require("http");

const REQ_FILES = [
  "scripts/oauth-server.js",
  "scripts/make-auth-url.js",
  "scripts/exchange-code.js",
  "src/lib/tokenManager.js",
  "src/jobs/refreshCron.js",
  "src/lib/apiClient.js",
  "server.js"
];

const REQUIRED_SCRIPTS = ["dev:env","prod:env","oauth:callback","oauth:url","oauth:exchange","start"];

const AUTH_URL_EXPECTED = "https://auth.contaazul.com/oauth2/authorize";
const TOKEN_URL_EXPECTED = "https://auth.contaazul.com/oauth2/token";

function mask(v){
  if(!v) return "(vazio)";
  const s = String(v);
  if(s.length <= 8) return "*".repeat(s.length);
  return s.slice(0,4) + "…" + s.slice(-4);
}

function parseEnv(file){
  const out = {};
  if(!fs.existsSync(file)) return out;
  const txt = fs.readFileSync(file,"utf8");
  for(const line of txt.split(/\r?\n/)){
    if(!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if(m){
      let val = m[2].trim();
      if((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1,-1);
      }
      out[m[1]] = val;
    }
  }
  return out;
}

function inGit(){
  try{ cp.execSync("git rev-parse --is-inside-work-tree",{stdio:"ignore"}); return true; }catch{return false;}
}

function isTracked(p){
  try{ const o = cp.execSync(`git ls-files -- ${p}`).toString().trim(); return o.length>0; }catch{return false;}
}

function trackedFiles(){
  try{ return cp.execSync("git ls-files").toString().trim().split(/\r?\n/).filter(Boolean);}catch{return[];}
}

function findSecretLeaks(files){
  const hits = [];
  const re = /(client_secret|refresh_token|access_token)\s*[:=]\s*([^\s'"]{12,})/i;
  for(const f of files){
    if(/(^|\/)\.env($|\.|\/)/.test(f)) continue;
    if(f.endsWith("tokens.json")) continue;
    if(f.includes("node_modules/")) continue;
    let txt;
    try{
      if(fs.statSync(f).size > 1024*1024) continue; // pula arquivos >1MB
      txt = fs.readFileSync(f,"utf8");
    }catch{ continue; }
    const lines = txt.split(/\r?\n/);
    lines.forEach((ln,idx)=>{
      const m = ln.match(re);
      if(m){
        hits.push({file:f, line: idx+1, key:m[1]});
      }
    });
  }
  return hits;
}

function log(ok,msg){ console.log((ok?"✅":"❌")+" "+msg); return ok; }

(async ()=>{
  const report = { ok:true, checks:[], fixes:[] };

  // 1) .gitignore
  const gi = fs.existsSync(".gitignore") ? fs.readFileSync(".gitignore","utf8") : "";
  const giHasEnv = /\.env\*/.test(gi) || /\.env\b/.test(gi);
  const giHasTokens = /tokens\.json/.test(gi);
  const giHasNode = /node_modules/.test(gi);

  report.checks.push({item:".gitignore .env*", ok: log(giHasEnv,".gitignore contém regra para .env / .env*")});
  report.checks.push({item:".gitignore tokens.json", ok: log(giHasTokens,".gitignore contém tokens.json")});
  report.checks.push({item:".gitignore node_modules", ok: log(giHasNode,".gitignore contém node_modules")});
  if(!(giHasEnv && giHasTokens)) report.ok=false, report.fixes.push("Adicione ao .gitignore: .env*, tokens.json");

  // 2) .env.dev / .env.prod
  const envDev = parseEnv(".env.dev");
  const envProd = parseEnv(".env.prod");
  report.checks.push({item:".env.dev existe", ok: log(fs.existsSync(".env.dev"),".env.dev encontrado")});
  report.checks.push({item:".env.prod existe", ok: log(fs.existsSync(".env.prod"),".env.prod encontrado")});

  function checkEnv(name, env){
    const prefix = `[${name}]`;
    const okAuth = env.AUTH_URL === AUTH_URL_EXPECTED;
    const okToken = env.TOKEN_URL === TOKEN_URL_EXPECTED;
    const okScopes = typeof env.SCOPES === "string" && /openid/.test(env.SCOPES) && /profile/.test(env.SCOPES);
    const okClient = !!(env.CLIENT_ID && env.CLIENT_SECRET);
    const okRedirect = name==="dev"
      ? (env.REDIRECT_URI||"").includes("localhost") || (env.REDIRECT_URI||"").includes("ngrok")
      : (env.REDIRECT_URI||"").startsWith("https://");

    log(okAuth,  `${prefix} AUTH_URL = ${env.AUTH_URL||"(vazio)"}`);
    log(okToken, `${prefix} TOKEN_URL = ${env.TOKEN_URL||"(vazio)"}`);
    log(okScopes,`${prefix} SCOPES = ${env.SCOPES||"(vazio)"}`);
    log(okClient,`${prefix} CLIENT_ID/SECRET = ${mask(env.CLIENT_ID)}/${mask(env.CLIENT_SECRET)}`);
    log(okRedirect,`${prefix} REDIRECT_URI = ${env.REDIRECT_URI||"(vazio)"}`);

    if(!(okAuth && okToken && okScopes && okClient && okRedirect)) {
      report.ok=false;
      report.fixes.push(`${prefix} Corrija ENV: AUTH_URL=${AUTH_URL_EXPECTED}, TOKEN_URL=${TOKEN_URL_EXPECTED}, SCOPES deve conter 'openid profile', CLIENTS preenchidos, REDIRECT_URI adequado (${name==="dev"?"localhost/ngrok":"https://seu-dominio"})`);
    }
  }
  if(fs.existsSync(".env.dev")) checkEnv("dev", envDev);
  if(fs.existsSync(".env.prod")) checkEnv("prod", envProd);

  // 3) arquivos obrigatórios
  for(const f of REQ_FILES){
    const ok = fs.existsSync(f);
    report.checks.push({item:`file:${f}`, ok: log(ok, `Arquivo presente: ${f}`)});
    if(!ok){ report.ok=false; report.fixes.push(`Criar arquivo ausente: ${f}`); }
  }

  // 4) package.json scripts
  let pkg={scripts:{}};
  try{ pkg = JSON.parse(fs.readFileSync("package.json","utf8")); }catch{}
  for(const s of REQUIRED_SCRIPTS){
    const ok = !!pkg.scripts?.[s];
    report.checks.push({item:`script:${s}`, ok: log(ok, `package.json possui script: ${s}`)});
    if(!ok){ report.ok=false; report.fixes.push(`Adicionar script '${s}' no package.json`); }
  }

  // 5) /health/oauth presente?
  let serverContains = false;
  try{
    const txt = fs.readFileSync("server.js","utf8");
    serverContains = /\/health\/oauth/.test(txt);
  }catch{}
  report.checks.push({item:"rota /health/oauth", ok: log(serverContains,"server.js expõe /health/oauth")});
  if(!serverContains){ report.ok=false; report.fixes.push("Adicionar rota GET /health/oauth no server.js"); }

  // 6) cron ativo?
  let cronPresent = false;
  try{
    const txt = fs.readFileSync("src/jobs/refreshCron.js","utf8");
    cronPresent = /node-cron|cron\.schedule/.test(txt);
  }catch{}
  report.checks.push({item:"cron de refresh", ok: log(cronPresent,"Cron de renovação presente")});
  if(!cronPresent){ report.ok=false; report.fixes.push("Adicionar job cron para renovar tokens (node-cron)"); }

  // 7) segredos rastreados no git?
  if(inGit()){
    const tracked = trackedFiles();
    const envTracked = [".env",".env.dev",".env.prod","tokens.json"].filter(isTracked);
    const leaks = findSecretLeaks(tracked);
    const okEnvNotTracked = envTracked.length===0;
    const okNoLeaks = leaks.length===0;

    report.checks.push({item:"env/tokens não rastreados", ok: log(okEnvNotTracked, "Nenhum .env/tokens.json está versionado no git")});
    if(!okEnvNotTracked){
      report.ok=false;
      report.fixes.push("Remover dos commits: .env, .env.dev, .env.prod e tokens.json (git rm --cached <arquivo>)");
      console.log("   Arquivos rastreados:", envTracked.join(", "));
    }

    report.checks.push({item:"sem segredos em arquivos rastreados", ok: log(okNoLeaks, "Nenhuma ocorrência de client_secret/refresh_token/access_token em arquivos versionados")});
    if(!okNoLeaks){
      report.ok=false;
      console.log("   Ocorrências:");
      leaks.slice(0,50).forEach(h=> console.log(`   - ${h.file}:${h.line} → ${h.key}`));
      report.fixes.push("Remover segredos hardcoded de arquivos versionados; usar .env / tokens.json");
    }
  } else {
    console.log("ℹ️ Repositório git não detectado. Pulei checagens de versionamento.");
  }

  // 8) opcional: tentar pingar /health/oauth se rodando
  const port = Number(process.env.APP_PORT || 5000);
  await new Promise(res=>{
    const req = http.get({host:"localhost", port, path:"/health/oauth", timeout:1000}, r=>{
      const ok = r.statusCode===200;
      report.checks.push({item:"HTTP /health/oauth", ok: log(ok, `HTTP GET http://localhost:${port}/health/oauth ${ok?"OK":"NOK"}`)});
      res();
    });
    req.on("error", ()=>res());
  });

  // Resultado
  const summary = report.ok ? "✅ AUDITORIA: OK (sem bloqueios)" : "⚠️ AUDITORIA: Há itens para corrigir";
  console.log("\n" + summary);
  if(report.fixes.length){
    console.log("\nSugestões de correção:");
    [...new Set(report.fixes)].forEach((f,i)=>console.log(` ${i+1}) ${f}`));
  }

  fs.writeFileSync("audit-oauth-report.json", JSON.stringify(report,null,2));
  console.log('\nRelatório salvo em audit-oauth-report.json');
})();
