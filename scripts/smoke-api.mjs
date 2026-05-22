const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:8787/api';

const checks = [
  ['health', '/health'],
  ['database', '/health/db'],
  ['mobile home', '/mobile/home'],
  ['mobile shops', '/mobile/shops?page=1&perPage=5'],
  ['mobile clinics', '/mobile/clinics?page=1&perPage=5'],
  ['mobile news', '/mobile/news?page=1&perPage=5'],
];

let failed = false;

for (const [name, path] of checks) {
  const response = await fetch(`${baseUrl}${path}`);
  const json = await response.json();
  if (!response.ok || json.ok !== true) {
    failed = true;
    console.error(`FAIL ${name}:`, JSON.stringify(json));
  } else {
    console.log(`OK ${name}`);
  }
}

if (failed) {
  process.exit(1);
}
