# Prior issue index (pollinations bugs #40-#127) - do not re-report these

### Hardening bundle (4th wave): e2b capacity/keeper asymmetries, per-create permanent key minting, model3d parameter gaps, catgpt key-in-URL (second instance of the issue-55 class), and a pi-workbench defense-in-depth note
- file: issue100-fourth-wave-hardening-bundle.md
**Severity: low-medium overall; individual items marked below. Code-verified.**

### Account deletion leaves every R2 media blob publicly readable forever — and permanently undeletable: no purge on delete, reads need no owner check, and fetching a blob at least once every 30 days refreshes its lifecycle so it never expires; the DELETE endpoint requires catalog rows the deletion just cascade-removed
- file: issue101-account-deletion-leaves-media-public-undeletable.md
**Severity: medium (data-lifecycle / privacy: user-uploaded content — and agent-run outputs in the same bucket — outlive the account, world-readable by URL, with no self-service or
**Found: 2026-10-25. Code-verified end-to-end (delete path, read path, TTL refresh, delete-endpoint precondition).**

### polli CLI key-management bundle: harness/MCP-install keys are minted with no budget and no expiry and are never revoked on off/remove (the issue-95 class, client side); the secret is passed as a process argument to claude/gemini/amp; `polli keys create` prints the raw sk_ to stdout while the shipped agent skill routes agents into key management — an injection-to-fresh-key exfil primitive; logout clears only the active environment's credential file
- file: issue102-polli-cli-key-management-bundle.md
**Severity: low-medium overall (four client-side findings that compound issue 95's server-side minting); individual severities marked.**
**Found: 2026-10-25. Code-verified (all excerpts read in-tree; codex contrast confirms the safe pattern already exists in the same file).**

### Payment & deletion hardening bundle: x402 post-settlement missing-receipt check throws a raw 500 at a buyer who already paid; account deletion leaves the Stripe customer + saved card alive and lets an in-flight auto-top-up invoice charge a deleted account with pollen never credited; pack-key string normalization gap ("0.5" vs "0.50") returns raw internal 500s
- file: issue103-payment-deletion-hardening-bundle.md
**Severity: low (money-route robustness; each path already has partial recovery machinery, but the failure modes surface as raw 500s or silent non-credit at exactly the moment a cu
**Found: 2026-10-25. Code-verified. Distinct triggers from issues 54/66/72/89 (cross-checked).**

### Video-generation billing audit (verdict + new live evidence): the fresh-generation path is airtight across all 23 official models — but the media-cache replay leg of issue 73 is now LIVE-PROVEN on the same adapter that serves /video (keyless 200 `X-Cache: HIT`, garbage key accepted), the OpenAI /v1/images/generations route accepts video models (uncharted but billed correctly), and the dedup join semantics let a second authenticated account receive an identical in-flight video at zero charge
- file: issue104-video-billing-audit-verdict-cache-replay-live-proof.md
**Severity: this is primarily a VERDICT issue (negative result on "free unlimited fresh video generation") plus live evidence that upgrades issue 73's media leg from code-claimed t
**Found: 2026-10-25. Full chain code-audited (admission → generation → usage extraction → settlement) + live control tests.**

### polli's HTTP API enforces its "API mode" GitHub-write restrictions only in the LLM's tool schema — the executor never checks them for direct API calls, so any `ag_` token holder can drive the official `polly-bot-pollinations-ai` identity to create issues, comment, edit/delete comments, and manipulate subscriptions in `pollinations/pollinations`
- file: issue105-polli-api-tool-restrictions-schema-only.md
**Severity: high (org-repo write primitive under the official bot identity, reachable by any platform user through the public `polli` community model; also a second-order prompt-in
**Found: 2026-10-25. Code-verified end-to-end (token acceptance → schema-only filtering → unguarded executor → unprivileged write actions). Not live-executed: no issue, comment, or

### The `community_endpoint` table is uncapped, and the shared catalog KV value it feeds has a 25 MiB ceiling whose overflow is silently swallowed — past the ceiling, every gen isolate falls back to a full-table D1 join on every 60 s expiry (5 s once degraded), turning a free account's insert loop into a platform-wide model-registry and D1 outage that persists with zero further attacker traffic
- file: issue106-community-endpoint-uncapped-rows-catalog-overflow.md
**Severity: high (platform-wide availability of the core generation path; D1 is shared by gen + enter + media; attacker cost ≈ 0 pollen; strictly larger blast radius than issue 69)
**Found: 2026-10-25. Code-verified end-to-end (insert routes → catalog cache → silent-overflow path → per-isolate full-scan fallback → degraded retry loop). NOT load-tested — per t
**Aggressiveness for the controlled test:** the insert loop above at 20-50 req/s for 10-30 min is sufficient; the measurable signal is (a) the serialized size of `community-catalog
- **Issue 88** is the quests GitHub-GraphQL fan-out (different upstream, different endpoint, requires session).

### One shared Cloudflare API token fronts every site deploy, publish, code-agent deploy/delete and account-deletion cleanup — and the routes that spend it are unthrottled, so a single free account can pin the platform's shared 1,200-requests/5-min Cloudflare API quota and make all deploys, agent creates and deletion cleanup fail platform-wide
- file: issue107-shared-cloudflare-deploy-token-quota-exhaustion.md
**Severity: medium-high (cross-user platform outage of the sites/agents surface; attacker cost 0 pollen; shared-quota class). NOT load-tested — PoC provided for the maintainers' co
**Found: 2026-10-25. Code-verified (token concentration → unthrottled routes → 429-to-502 propagation → co-tenant blast radius).**
**Aggressiveness for the controlled test:** 4-10 req/s from one account is enough to observe CF 429s surfacing as 502s on a second account's deploy. The signal to measure: `require
- **Issue 63 §2** covers the *unauthenticated* agent-sync route — which is throttled 1/30 s per agent; these authenticated deploy routes have **no throttle at all** and burn a *Clo

### The `quest-dash-live` operations worker serves an unauthenticated `/data` endpoint (default `workers.dev` host, no routes, no `workers_dev = false`) that reads the production `enter-prod` D1: per-event reward feeds with users' GitHub usernames, display names and avatar URLs, plus three unthrottled full-table `GROUP BY` aggregates per request against the same database that backs the production enter API
- file: issue108-quest-dash-live-unauth-prod-d1-reads.md
**Severity: medium-high (unauthenticated production-DB cost/DoS surface + PII-lite disclosure; a workers.dev host that scanners routinely enumerate).**
**Found: 2026-10-25. Code-verified from the committed wrangler.toml + worker.js. The live host name was not probed (would confirm deployment state; the config itself is the finding
- **No routes** and **no `workers_dev = false`** — so it is served on the account's default `quest-dash-live.<account-subdomain>.workers.dev` subdomain (account id committed in the
- **No auth binding of any kind** — its own header comment: *"No build step, no secrets: D1 binds by id at the account level."*

### Anonymous, unthrottled OpenAPI schema regeneration fans one public request into heavy schema generation across three production workers — gen's `/openapi.json` re-fetches enter's schema (regenerated per request, not memoized) and media's schema (a real network fetch, also regenerated per request) on every hit, all mounted before the edge-limited proxy and uncached
- file: issue109-openapi-regeneration-anonymous-cpu-amplification.md
**Severity: medium (anonymous CPU + subrequest amplification across the three workers serving all paid traffic; free to the attacker). NOT load-tested — PoC for the maintainers' co
**Found: 2026-10-25. Code-verified (route order, per-request fan-out, missing memoization and cache headers).**

### The usage/earnings/health Tinybird read pipes are unthrottled and uncached per user (50,000-row exports, 90-day windows, full-pipe aggregations per request) — any free account can saturate the shared Tinybird workspace that every dashboard, community-model health view, and the realtime admission median depend on
- file: issue110-tinybird-read-pipe-saturation.md
**Severity: medium (shared-analytics-workspace starvation — the read-side sibling of issue 63's write-side ingest abuse; platform already carries a dedicated `TinybirdRateLimitErro
**Found: 2026-10-25. Code-verified (routes → pipe parameters → no cache/throttle → shared dependencies).**
- **Issue 63** is the write side (unauthenticated analytics ingest beacons); this is the authenticated read side on different endpoints.
- **Issue 88** is the quests GraphQL fan-out (GitHub quota, not Tinybird).

### Zero-balance e2b sandbox create-churn: the create handler runs the E2B list → create → get sequence before the post-hoc funds check for the lease price, so a 0-pollen wallet still burns 4 E2B team-API calls per attempt — and E2B's concurrency/quota limits are per team, so the churn degrades sandbox operations for everyone
- file: issue111-e2b-zero-balance-create-churn.md
**Severity: medium-low (shared-provider quota burn reachable with an empty wallet; each failed create also litters a permanent `polli-sandbox-*` key row via enter's key API). NOT l
**Found: 2026-10-25. Code-verified (handler order in gen's e2b create route).**

### Pollen farming I — the onboarding quest cluster is a self-seeding mint: `use_app` is satisfiable with two of your own keys, the five usage quests are satisfiable with quest-granted tier pollen via ~1e-5-pollen micro-charges, and the multi-account baseline is ~2.75-4.75 tier pollen per fresh GitHub identity with no signup velocity control anywhere in the platform
- file: issue112-pollen-farming-onboarding-quest-cluster.md
**Severity: medium (aggregate platform-funded compute exposure; each individual vector is small, but the cluster is closed-loop, self-funded by the platform's own grants, and has n
**Found: 2026-10-25. Code-verified end-to-end (quest definitions → completion pipes → attribution minting). No farming was performed: the chain was verified against the code and te
- **Issue 84** covers Discord relink cycling on *one* account and the promo-redeem throttle — not the aggregate multi-account baseline, not `use_app`, not the tier-funded usage que
- **Issue 82** covers quest *bounty misrouting* on app submissions — different quests, different mechanism.

### Pollen farming II — `reported_merged_issue` pays 3 tier pollen per issue closed by a merged PR, with no check that the closing PR's author differs from the issue author: file N small issues yourself, submit the one-line PRs yourself, and each maintainer merge pays you 3 pollen as the reporter on top of the PR's own quest rewards
- file: issue113-pollen-farming-reported-merged-issue-self-fulfillment.md
**Severity: medium (repeatable per-issue mint gated only by maintainer willingness to merge small PRs; a pressure/attention-farming vector against the repo's own merge culture — th
**Found: 2026-10-25. Code-verified (quest definition → proposal query → exclusions → reward key). No issues or PRs were filed as part of this verification.**
**There is no check that the closing PR's author ≠ the issue author** — even though the data is already fetched (`closedByPullRequestsReferences` returns PR authors). The reward ke
- **Issue 82** covers the *Quest-field* misrouting on **app submissions** and quest-amount parsing on POLLEN-QUEST issues; its companion notes cover `hasMergedPr` username trust an

### Pollen farming III (compositions) — `top_up_since_launch` (5 tier) pays on ANY `stripe_checkout_credits` row regardless of amount paid, so the issue-54 100%-off promo checkout and the issue-72 buy-refund-keep loop each convert into quest pollen on top of their own bugs; plus the colluder exchange rate on `app_pollen_10` (3 pack in → 10 tier + 3 pack kickbacks out)
- file: issue114-pollen-farming-topup-composition-colluder-economics.md
**Severity: low-medium as standalone (composition multiplier on two filed criticals; the colluder math is an economics observation).**
**Found: 2026-10-25. Code-verified (quest source query → composition inputs). No purchases, promos or refunds were performed.**
- **With issue 54** (the 100%-off promo-code checkout credits the full pack for `amount_subtotal`): a $0 checkout that credits pollen also **satisfies this quest (+5 tier)** — and 
- **With issue 72** (refunds/chargebacks never reverse credited pollen): buy → quest pays +5 → refund → everything retained. (Issue 72 already notes the quest-tier interaction; thi

### The official Discord bots are a free, unlimited, unauthenticated generation faucet funded by one shared platform key: the six discord-bot-family bots always respond to mentions/DMs on paid models and hand out their own public install link (`!invite`), and catgpt-bot generates a paid-only 1024×1024 image plus a text completion per mention — no per-user cooldown, no Pollinations account, no pollen charge to the caller, anywhere
- file: issue115-discord-bots-free-unlimited-platform-funded-generation.md
**Severity: medium-high (platform-funded provider spend with zero identity requirements — the "free unlimited generation" surface that survives the issue-104 verdict; bounded only 
**Found: 2026-10-25. Code-verified across all three bots (config, request paths, models, absence of any cooldown/charge). No mention-spamming was performed.**
- **Issue 57 / issue 100 §5** covered catgpt-bot's *key logging* (key-in-URL), not the funding loop or the other bots.
- **Issue 85** (realtime) required a Pollinations account and key; this surface requires neither.

### x402 prepaid keys have no working revocation primitive: the only delete API trips a D1 foreign key (`x402_key_purchase.key_id`, `NO ACTION`) and returns a raw 500, the mint carries no expiry, the patch endpoint has no `enabled` field — and the x402 holding user can never be deleted either
- file: issue116-x402-prepaid-key-no-revocation-fk-500.md
**Severity: medium (broken credential-lifecycle control on a real-money route; composes with issue 66's signature-replay key exposure; permanent 500-on-delete for the platform's ow
**Found: 2026-10-25. Code-verified (schema, mint, delete, patch, auth honoring of `enabled`).**
- **Issue 66** covered the x402 route's signature-as-bearer replay and error-leak surfaces; its hygiene note covered secret *rotation* bricking, not deletion.
- **Issue 89 §4** re-verified the x402 *payment/credit* paths solid (exactly-once, `credited_at IS NULL` transactional guard) — this is the *key lifecycle after crediting*, a diffe

### Account deletion cascades the `community_endpoint` rows but orphans every code agent's deployed Workers script in the `CODE_AGENTS` dispatch namespace forever: deploys carry no owner tags (sites do), the deletion hook cleans sites only, and the API delete swallows Cloudflare failures leaving live scripts behind deleted rows — plus the complete deletion-cleanup census this audit produced
- file: issue117-account-deletion-orphans-code-agent-scripts.md
**Severity: low-medium (permanent user-authored code residue in the platform's Cloudflare account; unbounded accumulation; erasure-expectation gap for user code — the code-agent an
**Found: 2026-10-25. Code-verified (deploy metadata, deletion hook, delete paths, cascade table).**
- **Issue 101** = R2 media blobs; **issue 103 §2** = Stripe. Both enumerated *external* residues and neither mentions dispatch namespaces; issue 100 §5's verified-clean note covere

### Seventh-wave hardening bundle: the sites upload route buffers an unbounded body, the admin site-block commits the D1 row before the Cloudflare delete, a failed device-approve orphans the pre-minted key, the d1_user Tinybird export ships `email` under a header that says sensitive columns never leave D1, and polli's CLI attribution is self-mintable without the CLI
- file: issue118-seventh-wave-hardening-bundle.md
**Severity: low (five verified hardening gaps, none independently exploitable beyond what's noted; each with a one-to-few-line fix).**
**Found: 2026-10-25. Code-verified.**
- **Device/OAuth pairing deep-dive:** `device_code` entropy ≈ 238 bits; `user_code` 40 bits unbiased; double-approval blocked (`requirePendingDevice` requires `status === "pending"
- **enter has no email/password surface at all** (`CHANGE_EMAIL_DISABLED` path; OAuth profile emails never overwrite the stored one; `update-user` cannot touch `tier`/`githubId`/`r

### The auto-fix Polli agent is a write-capable GitHub Actions job that consumes fully attacker-controlled issue bodies with zero untrusted-content framing — holding `contents: write`, `id-token: write`, the Polly App token, and a platform spending key in its environment — plus an unpinned `bunx` runtime dependency and a shell-concatenated token
- file: issue119-auto-fix-polli-agent-untrusted-issue-body-write-capable.md
**Severity: high (maintainer-label-gated trigger, but the content gate is prompt-only and absent: the agent that can push commits under the verified bot identity and read `PLN_GITH
**Found: 2026-10-25. Code-verified from the workflow file. No injection was performed.**
**There is no untrusted-content instruction anywhere in this prompt.** The platform's own sibling workflows prove the omission is not policy:
- **Issue 93** covers the read-only triage bot (`repo-triage-new-issues.yml`, unauthenticated trigger, comment/close only). This is a different workflow (label-triggered), a differ

### `pollinations/collective-memory` is a public content-injection channel into bash agents that execute inside the victim's persistent per-user sandbox: every official repo-reading agent's guard is prompt-level only (no code-level bash filter, no egress URL policy), gazette's guard is undercut by its own "MUST follow the space README" instruction, and the per-user DO aggregates private memory (Barnaby memories, `/workspace/memory/facts.md`) in the same filesystem the injected commands land in
- file: issue120-collective-memory-public-injection-into-victim-sandboxes.md
**Severity: medium-high (probabilistic LLM-injection gate, but the write side is fully open by design: any registered user can push arbitrary content to the shared repo, and the ex
**Found: 2026-10-25. Code-verified across the whole chain. No injection content was pushed; no victim agent was targeted.**
- **gazette's guard is undercut by its own next instruction**: *"The space README states the house conventions for posts — **your edition MUST follow them**"* (`agent-gazette/agent
- **gotcha-scout's allowlist is prompt-enforced only**: *"Re-run a command ONLY if it passes the allowlist in the Safety rules"* — the model is the judge of its own allowlist compl

### The social-posting pipeline turns merged-PR author prose into unreviewed posts on the official X, LinkedIn, Instagram and Discord accounts: the PR body is the LLM prompt (no untrusted-data framing, unlike the platform's own review-agent), deploy posts ship with zero human review, and the weekly Discord send omits `allowed_mentions` — an injected `@everyone` mass-pings the official server
- file: issue121-social-pipeline-pr-prose-to-brand-accounts.md
**Severity: medium (requires one merged PR; then no human in the loop on the Discord paths, and the Buffer/X/LinkedIn legs inherit whatever the LLM writes).**
**Found: 2026-10-25. Code-verified (prs.py, deploy_posts.py, deliver.py, both news workflows). No PR was opened and no post was influenced.**
- **Every completed production deploy** posts the PR note + AI-generated picture to Discord (`deploy_posts.py:219-245`, `DISCORD_REALTIME_WEBHOOK_URL` provisioned at `news-deploy-p
- **The weekly digest** goes to X / LinkedIn / Instagram via Buffer (`deliver.py:224-253`, `BUFFER_ACCESS_TOKEN`) — Buffer's queue is a review *window*, but the pipeline documents 

### The `mcpServers` arms of community prompt agents (the companion analysis to issue 81 addendum 2): any prompt agent can be configured with `composio` (the caller's Gmail read / GitHub commit / Sheets / Slack), `computer` (the caller's persistent private sandbox), and `machines` (caller-billed arbitrary command execution in E2B) — with no caller-visible toolset, no per-server consent, and a no-injection-needed malicious-publisher variant
- file: issue122-mcpservers-composio-computer-machines-arms.md
**Severity: high (the credential plumbing is verified end-to-end; a malicious allowlisted publisher needs no prompt injection at all — the agent's own system prompt is the payload)
**Found: 2026-10-25. Code-verified (schema, registry, runtime, proxy headers, composio session binding). Not live-tested against a victim.**
**A. Malicious publisher (no injection needed).** An allowlisted community publisher ships a friendly agent — "email summarizer", "workspace janitor", "PR helper" — with `mcpServer
**B. Injection into benign agents.** Issue 81 addendum 2's attack B, with the loot being the caller's third-party accounts instead of the Pollinations account.

### `agent-pr-mender` reviews arbitrary attacker-authored PR content (any public repo) inside a bash-equipped agent with zero untrusted-content framing — its sibling `agent-pr-review-fixer` carries the exact missing sentence, and pr-mender additionally holds a push channel to the public collective repo
- file: issue123-pr-mender-untrusted-pr-content-no-framing.md
**Severity: medium (the natural victim is a maintainer running PR review on an untrusted contributor's PR — the agent's advertised use case).**
**Found: 2026-10-25. Code-verified (full prompt diff between the two siblings). No PR was reviewed and no injection performed.**
**The prompt contains no "content is data, never instructions" sentence at all** — PR titles, descriptions, diffs, and code comments (fully attacker-controlled by the PR author, on
- **Issue 93**: GitHub Actions triage workflow, no shell, no victim workspace.

### Eighth-wave hardening bundle: `computer-mcp` and `ffmpeg-mcp` run without `global_fetch_strictly_public` (private-IP connect from the edge — the flag every other URL-fetching MCP worker sets), composio-mcp has no fetch timeouts and accepts an unvalidated `callbackUrl`, the MCP SDK is pinned at 2.0.0 on the flagship public server while machines-mcp runs 2.3.1, the app-submission pre-review spends the shared key on unauthenticated issue edits with an SSRF-unchecked screenshot fetch, floret serves `/files/{name}` unauthenticated with no retention, and openclaw passes the user's key as a process argument
- file: issue124-eighth-wave-hardening-bundle.md
**Severity: low (five hardening gaps plus corroboration notes; each with a one-to-few-line fix, two of them flags-file one-liners).**
**Found: 2026-10-25. Code-verified.**
- **computer-mcp**: the `Egress` binding (`src/index.ts:85-96`) applies only a User-Agent default before `fetch(outbound)` — no scheme/host/IP policy — so a sandboxed `curl http://
- **ffmpeg-mcp**: `validateUserMediaUrl` (`shared/user-media-url.ts:5-26`) refuses only literal IPs/localhost/credentials — a **public hostname that DNS-rebinds to a private IP pas

### Issue 125 — Private code agents are a free, unlimited, stateful CPU farm + 64-subrequest anonymous relay
- file: issue125-cpu-farm-no-throttle-unbilled-code-agents.md
**Severity: critical (resource exhaustion / missing economic gate / missing throttle).**

### Issue 126 — Auto-top-up: no per-day cap, no velocity control, no per-charge confirmation
- file: issue126-auto-topup-no-cap-no-confirmation.md
**Severity: critical (composition) — unbounded real-money loop against a saved card.**

### Issue 127 — Moderation is caller-opt-in only; the platform permanently hosts every generation
- file: issue127-moderation-caller-opt-in-permanent-hosting.md
**Severity: critical — platform-funded unmoderated content distribution with no takedown path.**

### One-click account takeover: enter's `/authorize` legacy flow accepts a `javascript:` `redirect_url` — the consent screen's Allow/Decline/Cancel buttons assign it to `window.location.href`, executing attacker JS in the `enter.pollinations.ai` origin (no sign-in even needed for Cancel/Deny)
- file: issue40-authorize-javascript-redirect-xss.md


### Required safety features scan only the trailing 50k chars / 25 message parts — the Bedrock guardrail never sees earlier content, so required `sexual`/`violence`/`secrets`/`shield` blocking is bypassed by padding on `POST /v1/chat/completions`
- file: issue41-safety-window-truncation-bypass.md


### User wallets have no atomic admission control — the preflight is a read-only SELECT, so N concurrent requests sharing one wallet all pass on the same snapshot and settle into negative tier/pack balances while the platform funds the upstream compute; API-key budgets got a conditional atomic reservation (`atomicReserveApiKeyBalance`) but user wallets never did
- file: issue42-wallet-admission-no-atomic-reservation.md


### `/v1/messages` drops the request's query string when dispatching internally — `?key=`-authenticated calls 401 on the inner route, and `?safe=` (or a body `safe` field) is silently ignored, so opt-in privacy redaction the user asked for never runs
- file: issue43-messages-route-drops-query.md


### PollenRateLimiter admission is a pure read — check-then-consume spans the whole generation, so N concurrent publishable-key requests all pass the same `checkRateLimit` snapshot and the only per-(key,IP) spend throttle never actually throttles a burst
- file: issue44-pollen-rate-limiter-admission-race.md


### E2B sandbox lease charges that fail are only logged — the lease proceeds upstream unbilled with no retry and no ledger row; and the sandbox capacity check is count-then-act, so concurrent creates transiently exceed the per-user cap
- file: issue45-e2b-charge-swallow-capacity-race.md


### community-monitor agent runs Claude with `--dangerously-skip-permissions` and a Bash tool in an environment holding three live tokens, while its duties direct it to read attacker-controlled Discord content — prompt injection in that content is a straight path to stealing `POLLI_TOKEN` (a spending credential), `DISCORD_TOKEN`, and `TB_TOKEN`
- file: issue46-community-monitor-injection.md


### Agent-run tokens authenticate to media with `type: "secret"` — a delegation credential handed to generated/sandboxed code gets full DELETE authority over every item the user ever published, because media's only credential-tier check is `type === "secret"`
- file: issue47-media-run-token-delete-authority.md


### media uploads are unthrottled, unquota'd and unmoderated — any `pk_` key (or free account) can push 400 MiB bodies in a loop, publish to public tag galleries, and keep blobs alive forever with unauthenticated GETs; untagged blobs can never be deleted by anyone
- file: issue48-media-unbounded-unmoderated-uploads.md
- **Upload auth is any valid key** — including publishable `pk_` keys that by design ship inside public clients (`index.ts:376-388` performs no tier/quota check; the worker's own d
- **Tags need only `userId ≠ null`** (`index.ts:558-565`) — but tagging works with a pk_ key attached to an account (verified by the worker's own tests: `integration.test.ts:1224-1
- **Retention is attacker-controlled**: a public `GET /:id` every ≤ 15 days refreshes the 30-day TTL forever (`shared/r2-storage.ts:33-50`), and the request is unauthenticated. A c
- **Untagged blobs are immortal by policy**: the DELETE route requires ownership via a catalog row, and untagged uploads have no catalog entry (`index.ts:841-846` returns 404 for t

### media's HTTP upload paths don't cap `originalName` — a multipart filename (or JSON `name`) of a few KB exceeds R2's 2 KB customMetadata limit and the upload 500s; the service-binding path already slices to 253 chars, the HTTP paths forgot
- file: issue49-media-unbounded-originalname.md


### Editing an API key's budget is an absolute SET that clobbers in-flight reservations — a mid-flight edit re-inflates a key's spend cap beyond what the owner set (or pushes it negative when lowering), because gen's reserve/adjust writes are relative while enter's PATCH is not
- file: issue50-key-budget-edit-clobbers-reservations.md


### Stem separation bills a client-forged MP3 Xing header: ~0.0025 pollen charged for hours of ElevenLabs processing
- file: issue51-stem-separation-xing-frames-forgery.md


### AssemblyAI transcription: 240 s timeout abandons the job un-billed and un-cancelled, and `/v1/audio/transcriptions` has no file-size cap — third-party spend with zero caller charge
- file: issue52-assemblyai-timeout-unbilled-no-size-cap.md


### Device `/approve` and OAuth `/api/oauth/code` store a client-supplied `apiKey` verbatim — no binding of the delivered credential to the consenting user (amplifies the confirmed /authorize XSS)
- file: issue53-device-approve-oauth-code-trust-client-apikey.md
**Device flow** — `POST /api/device/approve` (`enter.pollinations.ai/src/routes/device.ts:33-39` schema, `173-213` handler, `317-355` delivery) requires only a session and a pendin
**OAuth code flow** — `POST /api/oauth/code` (`enter.pollinations.ai/src/routes/oauth.ts:130-148`) rigorously validates `clientId` (registered app key or metadata document), `redir

### Discounted Stripe checkouts credit full pack pollen — the "was actually paid" guard checks the pre-discount subtotal
- file: issue54-stripe-discount-codes-credit-full-pack.md


### SDK puts the secret API key in the request URL for image/video/audio GETs — proxy/CDN/APM/HAR leakage of a live `sk_`
- file: issue55-sdk-secret-key-in-request-url.md


### floret fetches arbitrary user-influenced URLs server-side with no host validation (SSRF class) and leaks response bodies into the chat
- file: issue56-floret-ssrf-no-host-validation.md


### catgpt-bot writes a spendable `sk_` API key into persistent, world-readable log files
- file: issue57-catgpt-bot-logs-secret-key.md


### Community-model usage forgery: a public listing bills any caller its self-reported token count — and the owner pockets 75% as reward
- file: issue58-community-usage-forgery-drains-callers.md
**Severity: raises this issue's ceiling — same root cause (self-reported usage), amplified through the Connect-User-Wallets (BYOP) developer-earnings path. 2026-10-25, code-verifie

### Publishable `pk_` keys can carry account permissions — a browser-public key becomes full account takeover
- file: issue59-publishable-key-account-permissions.md


### Unauthenticated, unbounded writes to the `device_code` table — and pending rows are never cleaned up
- file: issue60-device-code-unbounded-writes.md


### One-click account takeover via the consent screen's `keys` scope: any unvetted OAuth client can pre-check "Manage keys, agents and models" from a link, receive a victim `sk_` with `account:keys`, and mint unlimited-budget keys — the device-flow variant needs zero attacker infrastructure
- file: issue61-consent-keys-scope-account-takeover.md
**Variant A — device flow, zero attacker infrastructure (no website, no redirect_uri):**
**Variant B — authorization-code flow (OAuth 2.1, PKCE):**
**Post-exploitation, all with the single delivered key (chain proven in issue 59):**

### One-click full account takeover with the victim's consent bypassed entirely: chaining the `/authorize` `javascript:` redirect (issue 40) with API-level permission minting (issue 59) and `/api/device/approve`'s client-supplied `apiKey` (issue 53) — the single click can be "Decline"
- file: issue62-compound-chain-one-click-decline-takeover.md


### Unauthenticated write/trigger surfaces without rate limits: the analytics beacons accept arbitrarily many forged events (Tinybird ingest cost + product-metric pollution), and the public code-agent sync endpoint lets anyone force a Worker redeploy every 30 seconds per agent
- file: issue63-unauthenticated-analytics-and-agent-sync.md
**1. Analytics beacons gate only on a forgeable `Origin` header** (`enter.pollinations.ai/src/routes/product-analytics.ts:32`):
**2. Public code-agent sync** (`enter.pollinations.ai/src/routes/agents.ts:629-650`, `syncCodeAgent` at `207-267`):
- **Analytics integrity + ingest cost**: unbounded unauthenticated writes to a paid managed ingest (Tinybird). Funnel metrics (sign-in conversion, page views, top-up funnels) can b
- **Resource churn**: unauthenticated forced redeploys of every code agent (GitHub API + Cloudflare deploy API), bounded only by the 30s global throttle per agent; deploy-failure n

### issue 64 — Unauthenticated `GET /register` on gen.pollinations.ai leaks the internal GPU worker fleet
- file: issue64-unauthenticated-gpu-worker-registry-leak.md
**Severity: medium (information disclosure → targeted pipeline DoS / recon)**
**Status: LIVE in production, verified 2026-10-22**

### issue 65 — `media.pollinations.ai` upload: no rate limit, no quota, any valid key (including publishable `pk_`)
- file: issue65-media-upload-unthrottled-storage-dos.md
**Severity: medium-low (unbounded storage / catalog growth = cost DoS; amplifies issue 31)**
**Status: LIVE in production, verified 2026-10-22 (live PoC with cleanup)**

### issue 66 — x402 key purchases: the payment signature is a bearer credential for the funded key; cross-pack replay 500s with the raw internal error
- file: issue66-x402-payment-signature-bearer-and-error-leak.md
**Severity: low-medium (secret-handling + robustness on a money route)**
**Status: code-verified on `origin/main` 432d5e54 (2026-10-22)**

### issue 67 — Community **embeddings** usage forgery: `/v1/embeddings` bills callers from the community endpoint's unbounded self-reported `prompt_tokens`
- file: issue67-community-embeddings-usage-forgery.md
**Severity: high (same class as issue 58 — arbitrary caller wallet drain + 75% self-enrichment, on a route issue 58 did not list)**
**Status: LIVE in production, verified 2026-10-22 (caller-side, exact charge reproduced)**

### issue 68 — `NaN`/`Infinity` in usage headers: **[CORRECTED 2026-10-23] not reachable end-to-end; downgrade to hardening**
- file: issue68-nan-infinity-usage-headers.md
**Severity: corrected from high → low (hardening). Original claim: victim-side wallet destruction + self-enrichment via NaN/Infinity usage headers.**
**Status: unit-verified parser gap; end-to-end impact blocked by zod 4.5.4 default-finite validation + gen-rebuilt headers + ledger finite guard (see STATUS UPDATE above)**

### issue 69 — Stored XSS / arbitrary content hosting on `media.pollinations.ai`: raw-upload content-type is stored and replayed verbatim (`text/html` accepted; no CSP, no `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`)
- file: issue69-media-upload-stored-xss.md
**Severity: high (arbitrary attacker-controlled HTML+JS permanently hosted and executed on an official Pollinations origin; works with any `pk_`/`sk_` key, one unauthenticated-to-a
**Status: LIVE in production, verified 2026-10-23 (benign marker payload uploaded, served, and header-inspected via curl; content cleaned up where the API allows)**
- **Credential phishing on a trusted origin**: pixel-perfect `enter.pollinations.ai` sign-in lookalike at an official `*.pollinations.ai` URL (the real sign-in is OAuth-popups on a
- **Malware/illegal content hosting on Pollinations' domain and CDN** — reputation, legal, and clean-up costs (R2 objects are immutable-cached; untagged uploads **cannot be deleted

### issue 70 — Child-key privilege & budget escalation on `POST/PATCH /api/account/keys`: a `keys`-scoped key mints full-scope children (incl. `machines` + PII `profile`), self-patches its own scopes, and a 0.01-pollen-capped key mints **unlimited-budget** children
- file: issue70-child-key-permission-budget-escalation.md
**Severity: high (violates the consent screen's core promise "every scope is opt-in — nothing is implicit": an app granted only key management silently obtains account-wide PII rea
**Status: LIVE in production, verified 2026-10-23 end-to-end (keys-only child minted a full-permission grandchild that read the account's name+email; capped child minted an unlimit

### issue 71 — Post-issue-40 bypass: legacy `/authorize` fragment flow mints a secret `sk_` and delivers it to an **arbitrary, unregistered attacker URL** (`#api_key=…` in the fragment) — one link + one "Allow access" click on the official consent screen
- file: issue71-authorize-legacy-fragment-api-key-leak.md
**Severity: critical (direct secret API key leakage to an attacker-controlled site on the Pollinations identity provider's own consent screen; the key can carry attacker-preselecte
**Status: LIVE in production, verified 2026-10-23 with an attacker-side Cloudflare Worker collector (passcode-gated `/harvest` catcher + leak panel): completing the legacy flow wit

### issue 72 — Stripe refunds and chargebacks never reverse credited Pollen: buy → spend → refund/chargeback keeps the Pollen (and the platform also eats Stripe's $15 dispute fee) — no reversal, no ban, no balance freeze anywhere
- file: issue72-stripe-refunds-chargebacks-never-reverse-pollen.md
**Severity: high (direct financial loss: every refunded or charged-back payment permanently mints Pollen; attacker-only, zero victim interaction, repeatable per account/card; Polle
**Status: LIVE in production (code-verified at upstream `a9c570bc`, 2026-10-23); class = the platform's #2 priority (Pollen integrity — "duplicate or edit Pollen")**
- **Chargeback**: file a dispute with the card issuer ("unauthorized charge" / "product not delivered"). Stripe pulls the money from Pollinations and adds a **$15 dispute fee** (St
- **Merchant refund**: email/Discord support "I bought the wrong pack / I was double-charged" and get a goodwill refund from the dashboard. `refund.created` fires → Tinybird analyt

### issue 73 — The text-generation cache is identity-blind, runs **before auth/balance**, and is never billed: unauthenticated cross-user replay of paid-model outputs, cross-tenant response poisoning, and rate-limit-free reads
- file: issue73-shared-text-cache-preauth-unbilled-cross-user.md
**Severity: high (paid-only model content served with no key, no account, no rate limit, no billing; attacker can pre-seed cache entries that later victims receive as "fresh model 
**Status: LIVE in production, verified 2026-10-23 (keyless 200 `X-Cache: HIT` replay of a key-warmed generation; identical cache-key across keyed and keyless requests; control show

### issue 74 — `linkFallbackEntries` enforces the paid-only balance-class rule **only for community models**: an official model that declares a paid-only fallback target links it with no check — one registry line away from "Quest Pollen pays for a paid-only model"
- file: issue74-official-fallback-chains-skip-paid-only-balance-guard.md
**Severity: medium as shipped (missing invariant / defense-in-depth — zero exploitable chains exist in today's catalog, verified exhaustively); escalates to critical the moment any
**Status: unit-verified invariant gap in current `main` (`a9c570bc`); not attacker-triggerable today (the catalog is the platform's own config). This is the "free primary → paid-on

### issue 75 — Agent-execution media writes: `computer`'s `assets publish` and `ffmpeg`'s output write unattributed, unquoted, unthrottled files to platform media storage through the internal `MediaUpload` RPC — a single 0.0002-pollen bash call can publish many max-size files
- file: issue75-agent-media-rpc-unattributed-unquoted-writes.md
**Severity: medium (platform storage-cost and availability DoS — attacker-sustained R2 fill at a flat, byte-independent rate ~2×10⁹ bytes per pollen; no data exposure; compounds is
**Status: LIVE in the tree, verified by code audit 2026-10-23 (see "Verification" — every cited gate is the absence of a check, not behavior to reproduce)**

### issue 76 — Platform demo apps deploy to the shared `pollinations.ai` registrable domain: an XSS in any one of them (issue 33's chat XSS is live in the tree) is platform-wide cookie territory that user sites were deliberately isolated from
- file: issue76-apps-deploy-to-shared-pollinations-ai-domain.md
**Severity: high (attack-surface multiplier with a concrete, live trigger — the unfixed issue 33 streaming XSS executes on `chat.pollinations.ai` and thereby gains `Domain=pollinat
**Status: LIVE — deployment topology verified against the deploy pipeline source and live-verified 2026-10-24 (`https://catgpt.pollinations.ai/` → 200, `https://chat.pollinations.a

### issue 77 — `assets publish` uploads `text/html`/`image/svg+xml` by design and media serves it inline: keyless stored XSS on `media.pollinations.ai` for any positive Quest Pollen balance, chaining issue 75's unauthenticated RPC write with issue 31's missing serve-time allowlist — on the shared `pollinations.ai` registrable domain (issue 76)
- file: issue77-agent-assets-publish-inline-html-xss.md
**Severity: critical (attacker-authored script served inline on a platform origin; admission = free account + any positive Quest Pollen; total cost 0.0002 pollen per tool call; no 
**Status: LIVE in the tree — every link verified by direct code read 2026-10-24; no live HTML was published during this audit (see Verification)**
- **issue 31** (same serve-side gap, HTTP upload path): that path requires an API key; this one requires none. A serve-time allowlist fixes both, but an upload-time fix in the HTTP
- **issue 75** (same RPC write path): its impact was scoped to storage-cost DoS; this adds code-execution-on-origin.

### issue 78 — websim serves unsanitized model-generated HTML with attacker-chosen paths on `websim.pollinations.ai`: free attacker-controlled script hosting on the platform's registrable domain (any signup key; no XSS bug needed)
- file: issue78-websim-attacker-html-on-platform-domain.md
**Severity: high (attacker-authored script execution on a `pollinations.ai` origin — the app's designed function is to serve generated HTML, so the only "vulnerability" needed is t
**Status: LIVE in the tree — worker code read in full 2026-10-24; deployed at `websim.pollinations.ai` per `apps/websim/deploy.json` (`"target": "worker"`, `"subdomain": "websim"`)
- **issue 76** supplies the domain-topology root cause and the cookie-tossing consequence analysis.
- **issue 33** (chat XSS) and **issue 77** (agent-published HTML) are the same end-state reached through app bugs; websim reaches it through designed behavior — which is why it is 

### issue 79 — Private community models are publicly listed with full operational telemetry on `/models/status` and `/models/stats` (and through the public Tinybird pipes): the publisher allowlist conceals them from the catalog, but nothing filters them from the public health/stats surfaces — 392 never-published model IDs live-verified
- file: issue79-private-community-models-leak-public-telemetry.md
**Severity: high (information disclosure that defeats the platform's own private-model concealment invariant at scale: 392 community model IDs that are hidden from the public catal
**Status: LIVE — verified end-to-end against production 2026-10-24 (see "Live verification")**
- **392 IDs appear in the status surface but are not in the anonymous catalog.** Sampled five and confirmed the private-model signature on every one — anonymous `GET /models/<id>` 

### issue 80 — websim "Open" button executes prompt-controlled generated HTML with the full `websim.pollinations.ai` origin (blob-URL origin inheritance) while the preview iframe correctly sandboxes it: steals the minted `sk_` key from `localStorage["polli:pk_…:token"]`
- file: issue80-websim-open-button-blob-origin-xss.md
**Severity: high (attacker-authored script on a `pollinations.ai` origin with read access to the victim's minted API key and the platform's default SDK storage; the security bounda
**Status: LIVE in the tree — code read in full 2026-10-24; deployed app at `websim.pollinations.ai` (app shell served from `STATIC_PATHS`, generation via `POST /api/generate` on th
- **issue 78** (worker-served HTML) — same origin, different hole; 78's worker-side serve is attacker-authenticated only after its correction addendum, and its victim-facing execut
- **issue 76** supplies the domain topology and `Domain=pollinations.ai` cookie-tossing consequences available to any script on the zone.

### issue 81 — agent run tokens (`ag_`) authenticate on the account API with the parent key's full permissions: a community code agent can operate the caller's account mid-request (balance, PII, usage history, key inventory, and with `account:keys` on the caller's key, mint an unlimited-budget `sk_` = permanent account takeover)
- file: issue81-agent-run-token-account-api-full-permissions.md
**Severity: critical when the caller's key has `account:keys` (mint-and-exfiltrate a fresh unlimited `sk_`, complete wallet/identity takeover); high with `account:profile`/`account
**Status: SOURCE-VERIFIED end-to-end (every hop read in the tree, 2026-10-25); live PoC requires deploying a one-file agent — runbook below, self-contained against the tester's own

### issue 82 — app-approval bounty misrouting: the free-text `Quest` field on any app submission closes and pays out ANY open POLLEN-QUEST issue when a maintainer approves the app (no quest-type, fulfillment, or linkage check anywhere in the chain); plus quest reward amounts are user-supplied/editable issue text capped only at 10,000 Pollen
- file: issue82-app-approval-bounty-misrouting-unvalidated-quest-field.md
**Severity: medium-high (integrity of the bounty economy — one-click confused-deputy payout + permanent quest consumption + standings pollution; every gate in the chain validates t
**Status: LIVE-VERIFIED end-to-end (2026-10-25): the mechanism is proven in production by merged bot PR #17642; all 5 currently-open quests are attachable; code-verified every hop 

### issue 83 — auth-surface hardening bundle: device-flow D1 write amplification with no row GC or throttle; `approve` accepts an unvalidated `apiKey`; `sess_` minting is unthrottled per-session; model-key permission is not re-checked on fallback candidates
- file: issue83-auth-surface-hardening-bundle.md
**Severity: low (hardening; each item verified in code, several live-confirmed 2026-10-25 — none individually exploitable past the platform's existing cookie/CORS defaults, but eac
**Status: code-verified on `origin/main`; `POST /api/device/code` live-confirmed unauthenticated (2026-10-25)**

### Discord quest rewards re-earnable on one Pollinations account by cycling linked Discord accounts + quest-dedupe filter clause that bypasses the per-user `earned` set
- file: issue84-discord-quest-relink-cycling-and-filter-bypass.md
**Severity: low (bounded by Discord Sybil costs) — but it breaks the platform's stated once-per-account quest invariant, and the same filter clause is a standing hazard for every f
**Found: 2026-10-25. Code-verified (all four links of the chain are in the repo; no live Discord accounts were created).**
- **Google cycling is blocked**: proposals for `perUser` quests without `idempotencyKey` overrides hit the `!earned.has(quest.id)` clause, so unlinking Google and relinking another
- **GitHub cycling is blocked twice over**: `/unlink-account` hard-blocks GitHub, and `githubId`/`githubUsername` are `input: false` additional fields written only by the OAuth cal

### Realtime sessions: no per-user session or RPM cap, admission is a one-shot median estimate, settlement fires only on socket close, has no balance floor, and is dropped after one retry — plus the upstream Azure connect has no timeout
- file: issue85-realtime-uncapped-sessions-settle-on-close-negative-balance.md
**Severity: high (platform-funded provider spend; free-tier-reachable; verified live).**
**Found: 2026-10-25. Code-verified and live-verified (4 concurrent sessions on one key from a quest-funded account; zero-audio sessions used to keep the verification cost at zero).

### /v1/embeddings multimodal ContentPart arrays are uncapped — the 32-input batch limit applies only to string arrays, so one request can trigger an unbounded remote-media fetch fan-out (per-part 20 MiB, no shared budget, no timeout)
- file: issue86-embeddings-content-part-arrays-uncapped-remote-fetch-fanout.md
**Severity: medium-high (authenticated DoS + egress amplification; API key required).**
**Found: 2026-10-25. Code-verified and live-verified (40-part array accepted end-to-end; cost kept to a single text embedding).**
- **Egress fan-out**: 10,000 sequential fetches × up to 20 MiB each ≈ 200 GB of platform-paid egress (plus Vertex/Gemini token spend far above the admission estimate once the parts
- **Isolate OOM**: each part is fetched, then retained as a base64 string (~1.33×) in the parts array; the 128 MiB isolate dies around the 5th×20 MiB part, killing the request only

### Consent endpoints take session cookies with no Origin check — their only CSRF defense is SameSite=Lax, which every attacker-controlled *.pollinations.ai subdomain defeats
- file: issue87-consent-endpoints-cookie-csrf-no-origin-check.md
**Severity: medium (silent device approval with attacker-chosen key + scope, chaining issues 53/62; write-only CSRF, responses not readable).**
**Found: 2026-10-25. Code-verified (full chain read; not executed against a victim).**
- **Issue 32** analyzed better-auth's `/api/auth/*` wildcard-origin problem and asserted "the Hono routes under `/api/account/*` are safe because they are Bearer-only" — true for `
- **Issue 53** fixed ownership of the device being approved; the CSRF here has the attacker approving *their own* device with the *victim's* session, which passes that ownership ch

### done GET /api/account/quests is uncached and unthrottled, and each call runs the full GitHub-App GraphQL fan-out — one authenticated user can starve quest payouts and code-agent creation platform-wide
- file: issue88-account-quests-unthrottled-shared-github-quota-burn.md
**Severity: medium-low (authenticated availability/integrity attack on the reward pipeline; errors are swallowed so failures are silent).**
**Found: 2026-10-25. Code-verified (route, service, and GraphQL cost chain all read; no load test was run against the shared quota).**

### Credential-scope and comparison hardening bundle — gen's billing middleware holds the full admin token it never needs; two production localhost trusted origins; unsubscribe HMACs never expire; D1-export digest compared non-constant-time
- file: issue89-credential-scope-and-comparison-hardening-bundle.md
**Severity: low (each item is a hardening gap; none is remotely exploitable on its own — but item 1 converts any single gen-side token leak into unlimited pollen minting).**
**Found: 2026-10-25. Code-verified.**
**Fix:** mint a dedicated `PLN_AUTO_TOPUP_TOKEN` scoped to the trigger route only (or a service-binding HMAC scoped to `userId`), and keep `PLN_ENTER_TOKEN` exclusively for human o
**Fix:** move both entries inside the non-production spread.

### Community text-proxy upstream fetches have no timeout — the documented 300 s control (COMMUNITY_ENDPOINT_TIMEOUT_MS) is unimplemented on the highest-traffic modality; any authenticated account can hang requests indefinitely via a private model, and hung attempts also defeat declared fallbacks
- file: issue90-community-text-proxy-no-timeout.md
**Severity: medium-high (availability + design-control bypass; cheapest account tier; zero publisher allowlist needed).**
**Found: 2026-10-25. Code-verified (control, serve paths, and fallback interaction all read).**
**Fallbacks are defeated too**: `withModelFallback` (`gen.../src/fallback.ts:376-419`) awaits the hung attempt, so a healthy declared fallback is never tried — the timeout is what 

### Video generations that fail after the provider rendered them are unbilled on every route except one — the `billedUsage` mechanism exists (track.ts) and one fal path uses it, but the direct xAI route deterministically gives away moderation-rejected renders for free, and five poll-timeout/alarm paths leave accepted provider jobs uncharged
- file: issue91-video-post-render-failures-unbilled.md
**Severity: medium (attacker-amplifiable platform-funded provider spend at $0.03–$0.28/video-second with zero caller charge).**
**Found: 2026-10-25. Code-verified (billing mechanism, all six failure paths, and the one protected route read end-to-end).**

### Community endpoint URL trust model: hostname blocklist is string-only (nip.io-dash/localtest.me/metadata.google.internal pass; *.pollinations.ai allowed), the text and video serve paths never revalidate the stored baseUrl, and baseUrl/bearer/upstreamModel changes take effect immediately — the 3-hour publication delay is pricing-only
- file: issue92-community-endpoint-url-trust-model.md
**Severity: medium (hardening/policy gap; practical SSRF on Workers is bounded by platform egress, but the origin-spoofing primitive and the update-timing bypass are structural).**
**Found: 2026-10-25. Code-verified; blocklist behavior re-verified empirically in Node ( WHATWG URL parsing + the exact `isBlockedHostname` function).**
- **Redirect-following / bearer forwarding on redirects: clean** — every fetch of a publisher URL uses `redirect: "manual"` (probe, text, image/video, audio, embeddings, media URLs
- **Bearer storage: clean** — encrypted (`encryptSecret`, `BETTER_AUTH_SECRET`), never logged (debug logs print header key *names* only), never echoed in errors (errors carry `requ

### Unauthenticated prompt injection into the issue-triage bot — arbitrary content posted under the official verified bot identity, and real issues closed as duplicates of hallucinated matches
- file: issue93-triage-bot-prompt-injection-readme-markdown-injection.md
**Severity: medium (impersonation under a trusted identity with an unauthenticated trigger; no secret exposure — the LLM never receives the token).**
**Found: 2026-10-25. Code-verified (workflow, system prompt, few-shot examples, and output sinks all read).**

### Billing/quota enforcement bundle — Bedrock guardrail calls are unbilled amplification (blocked requests cost the platform, caller pays zero); sites storage quota is client-declared and ~128× bypassable; the `image` parameter bypasses the user-media URL policy that its sibling `reference_*` params enforce
- file: issue94-billing-quota-enforcement-bundle.md
**Severity: medium-low family (three distinct enforcement gaps, each verified in code).**
**Found: 2026-10-25. Code-verified.**
**Attack:** a modified CLI does `POST /api/account/sites/{name}/upload` with a manifest declaring 1000 files of `size: 1` (total 1000 bytes — passes every limit), then uploads the 
**Attack:** `GET /video/x?model=kwaivgi/kling-v3.0-std&image=http://user:pass@evil.com/a.jpg` (or `http://169.254.169.254/...`) is accepted while the identical value in `reference_

### E2B sandbox login mints an uncapped, never-expiring account credential and writes it into the box where untrusted code runs — prompt-injected or malicious-repo code drains the whole account balance and can spawn more sandboxes, and the key outlives the sandbox it came from
- file: issue95-e2b-sandbox-login-uncapped-never-expiring-key.md
**Severity: medium-high (unbounded financial blast radius from the sandbox's designed purpose — running untrusted code; zero attacker privileges needed beyond owning an account).**
**Found: 2026-10-25. LIVE-VERIFIED end-to-end (sandbox created, minted key inspected, in-box credential file read back, cleanup done). Total test cost: 0.00014 pollen.**
**A. Prompt injection (remote, no code bug needed).** The Barbara product runs user sandboxes whose Claude Code sessions answer *strangers'* mentions in group chats (`apps/mama-bar
**B. Malicious repo / harness task.** The templates' documented workflow is cloning user-chosen repos and running model-written code in them. Any such code reads `~/.pollinations/c

### Exa MCP: caller-deterministic receipt loss — web_fetch_exa amplifies its own worker into a memory-limit crash, the crash discards the usage receipt, settlement is silently skipped, and Exa still bills the platform; admission is cost-0 so any positive (quest) balance qualifies
- file: issue96-exa-mcp-deterministic-receipt-loss-oom.md
**Severity: medium-high (deterministic platform-funded spend; repeatable per request; reachable by the cheapest account tier; also a per-request small-balance overshoot vector).**
**Found: 2026-10-25. LIVE-VERIFIED (crash reproduced, zero pollen settled, Exa-side fetch work observed).**

### mcp.pollinations.ai `transcribeAudio` is an unauthenticated arbitrary-URL fetch primitive — the bearer token is checked for presence only, the worker fetches and fully buffers the caller's URL before the key is ever validated, with no size cap, no timeout, and no rate limit
- file: issue97-mcp-transcribeaudio-unauthenticated-fetch.md
**Severity: medium-low (unauthenticated server-side request/bandwidth primitive from platform egress + isolate-pinning DoS; blind — response not returned to caller; public-URL spac
**Found: 2026-10-25. LIVE-VERIFIED anonymously (fake bearer, fetch observed twice).**

### ffmpeg-mcp `runFfmpeg` `args` bypass the validated `sources` policy — `file://` inputs read arbitrary container files and the output is uploaded to public media with the URL returned to the caller (live-proven exfil of /etc/passwd); `sources` itself is uncapped with fetches that never time out
- file: issue98-ffmpeg-mcp-args-protocol-bypass-and-unbounded-sources.md
**Severity: medium-low (policy bypass + container-filesystem read → public-URL exfil chain; bounded by `enableInternet:false` inside the container and by per-second billing; no sec
**Found: 2026-10-25. LIVE-VERIFIED end-to-end (container files exfiltrated to public media URLs, contents fetched back).**

### Post-render provider-job abandonment: Stable Audio 3's poll budget (180 s) is smaller than its own duration schema (≤380 s, default 190) and the 504 settles nothing — the caller gets a free render the platform pays Stability for; the InferencePort 3D client has the identical shape (300 s job timeout, no cancel, no billedUsage on the 504)
- file: issue99-audio-3d-timeout-provider-job-abandonment.md
**Severity: medium (deterministic free-render money leak for funded callers; companions to issues 52/91 — this documents the two provider clients those issues did not cover).**
**Found: 2026-10-25. Code-verified. Live reproduction requires a paid-balance account (the model is paidOnly; our quest-tier test key is correctly refused at admission with HTTP 40
