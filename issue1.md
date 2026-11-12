# Issue 1 — DNS-based SSRF bypass in the shared user-media URL validator (`shared/user-media-url.ts`)

**Severity:** HIGH (Critical if the worker runtime has access to cloud metadata / internal admin services)
**Affected component:** `shared/user-media-url.ts` (used by `gen.pollinations.ai`, `apps/news-mcp`, `apps/network-mcp`, `apps/ffmpeg-mcp`)
**Status:** confirmed locally (PoC executed in this engagement environment; no live-platform traffic)

## Summary

`validateUserMediaUrl()` is the single policy gate for every caller-supplied media URL that the platform fetches server-side. It refuses:

* non-HTTP(S) schemes,
* URLs with embedded credentials,
* literal IP hosts (any dotted-quad, including `127.0.0.1` and `169.254.169.254`),
* `localhost` / `*.localhost`.

It does **not** resolve the hostname. Any DNS name that maps to a loopback, private (RFC1918), link-local or cloud-metadata address passes the gate, e.g. `127.0.0.1.nip.io`, `localtest.me`, `metadata.google.internal`.

The platform then performs the fetch itself, from inside the worker network, with the worker's own identity — so the attacker does not need direct network access to the target: the platform becomes the proxy.

## Affected call sites (all perform the server-side fetch)

* `gen.pollinations.ai/src/image/params.ts` — `reference_images` / `reference_videos` / `reference_audios` parameters on image generation routes.
* `gen.pollinations.ai/src/routes/audio.ts` — `referenceAudioUrl`.
* `gen.pollinations.ai/src/audio/sonilo.ts` — `referenceVideo`.
* `apps/news-mcp/fetch.js`, `apps/network-mcp/tools/http.js`, `apps/ffmpeg-mcp/worker.js` — MCP tool fetches.

## Impact

* **Internal network reachability / SSRF** against services bound to loopback or RFC1918 addresses of the worker (admin panels, internal APIs, `wrangler dev` control planes, Redis/metadata sidecars).
* **Cloud metadata theft** where the metadata endpoint is reachable by hostname (GCP `metadata.google.internal`, Azure IMDS via a hosts-mapped name) — the metadata token / instance credentials leak to the attacker as the fetched body is returned or fed back into a model context.
* **Blind port scanning** of the internal network through response-timing/error differences.
* Because the fetched body is forwarded into generation/MCP tooling, the response content can be exfiltrated back to the attacker (the PoC below shows body retrieval).

## Reproduction (PoC — local only, harmless)

PoC file: `.newera/cyber/evidence/poc-user-media-url-dns-ssrf.mjs`

```bash
node --experimental-strip-types .newera/cyber/evidence/poc-user-media-url-dns-ssrf.mjs
```

Observed output in this engagement environment:

```
[setup] internal-only service listening on 127.0.0.1:37049
[validate] http://127.0.0.1:37049/internal -> blocked(private)
[validate] http://localhost:37049/internal -> blocked(private)
[validate] http://127.0.0.1.nip.io:37049/internal -> ALLOWED
[validate] http://localtest.me:37049/internal -> ALLOWED
[validate] http://169.254.169.254/latest/meta-data/ -> blocked(private)
[validate] http://metadata.google.internal/computeMetadata/v1/ -> ALLOWED

[assert] 3 of 6 internal-host URLs passed validateUserMediaUrl
[ssrf] fetched http://127.0.0.1.nip.io:37049/internal -> 200 body="INTERNAL-SERVICE-SECRET-9f2c"
[PASS] loopback-only service content retrieved through the validator -> SSRF confirmed
```

The PoC starts an HTTP server bound to `127.0.0.1` only (not reachable from the internet), then asks the shared validator for `http://127.0.0.1.nip.io:<port>/internal`. The validator returns `ok`, and the platform-side fetch returns the loopback-only service's body — proving the bypass end to end without any traffic to the production deployment.

## Root cause

`shared/user-media-url.ts` implements a purely **string-level** host policy:

```ts
const parts = normalized.split(".").map(Number);
return parts.length === 4 && parts.every(p => Number.isInteger(p) && p >= 0 && p <= 255);
```

Hostnames are never resolved, so the check is trivially bypassed with any DNS name. There is also no protection against DNS rebinding (name resolves to a public IP at validation time and to a private IP when the fetch happens) and no `redirect: "manual"` guard at the media-fetch sites shown above.

## Remediation

1. **Resolve before deciding.** After parsing, resolve the hostname (`dns.promises.lookup(host, { all: true })`) and reject the URL if **any** resolved address is loopback (`127.0.0.0/8`, `::1`), private (`10/8`, `172.16/12`, `192.168/16`), link-local (`169.254/16`), unique-local (`fc00::/7`), or multicast/reserved.
2. **Pin the address.** Pass the validated, resolved IP to the fetch (e.g. custom `lookup`/`agent` that only returns the checked address) so a second DNS answer (rebinding) cannot change the target between validation and request.
3. **Do not follow redirects** (`redirect: "manual"`) at every media fetch site, or re-validate each redirect hop with the same resolver-based policy.
4. **Block metadata explicitly** for the known provider names/addresses (`metadata.google.internal`, `metadata.goog`, `169.254.169.254`, `fd00:ec2::254`, Azure `169.254.169.254`) and consider an egress proxy/allowlist for workers that fetch user media.
5. Apply the same resolver-based policy to the sibling validators that are still string-based (`shared/community-endpoint-urls.ts` blocklist, `enter.pollinations.ai/src/services/client-metadata.ts` metadata-document fetch).

## Distinction from previously reported issues

This is **not** the community-endpoint blocklist bypass (#92), not the MCP arbitrary-URL fetch (#97), and not the floret SSRF (#56): it is the **shared, cross-service media URL policy** (`shared/user-media-url.ts`) used by image/audio/video generation and three MCP apps, and the bypass is DNS-based (hostname resolving to a private address) rather than a string-parsing trick.
