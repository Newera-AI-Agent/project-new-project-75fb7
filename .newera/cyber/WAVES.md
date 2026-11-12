# 30-Wave Red-Team Plan — pollinations/pollinations (local, authorized)

Scope: LOCAL clone at `upstream/` (commit 5c790c7). No traffic to *.pollinations.ai.
Dedup baseline: `.newera/cyber/prior/pollinations-bugs-40-127/00-SEVERITY-INDEX.md` (88 issues).
Each wave = read subsystem end-to-end -> grep dangerous sinks -> PoC in `upstream/<pkg>/test/poc_<slug>.test.ts`
-> run `npx vitest run` -> evidence -> findings block. A wave with no provable bug closes NEGATIVE (recorded).

| # | Wave | Area | Primary sinks |
|---|------|------|---------------|
| 1 | Auth core | packages/auth + enter auth routes | session/JWT, compare, reset flows |
| 2 | Device + OAuth consent | enter routes | device_code, redirect_uri, apiKey trust |
| 3 | API keys | enter auth/api-key-* | scope, budget, expiry, child keys |
| 4 | Account lifecycle | enter routes account | delete, export, email change |
| 5 | Stripe billing | shared + enter billing | refunds, discounts, webhook sig |
| 6 | x402 payments | enter x402 | signature, replay, revocation |
| 7 | Admin surfaces | enter admin + operations | authz, IDOR, role checks |
| 8 | Wallet / pollen | shared db + gen | settle race, negative balance |
| 9 | Rate limiting | shared middleware | check-then-consume, per-key/IP |
| 10 | Text gen routes | gen /v1/* | authz, billing, cache identity |
| 11 | Image routes | gen images | billing, cache, model routing |
| 12 | Video routes | gen video | provider job abandonment, billing |
| 13 | Audio routes | gen audio | SSRF, file size, timeout |
| 14 | Embeddings | gen /v1/embeddings | usage forgery, array caps |
| 15 | Moderation / safety | gen guardrails | padding bypass, bypass scope |
| 16 | Media service | media.pollinations.ai | upload quota, XSS, delete authz |
| 17 | Media run tokens | media + shared | token scope vs DELETE |
| 18 | Community endpoints | shared community-* | URL trust, SSRF blocklist |
| 19 | Apps / websim | apps/*, packages/ui | XSS, origin, deploy tokens |
| 20 | MCP server | packages/mcp | tool authz, URL validation |
| 21 | SDK | packages/sdk | key leakage in URLs/logs |
| 22 | Polli CLI | packages/polli-cli | key handling, local storage |
| 23 | Agent runtime | enter code-agent-* | origin checks, sandbox secrets |
| 24 | E2B sandbox | enter e2b | file:// escapes, key minting |
| 25 | Database / migrations | shared/db | raw SQL, injection, constraints |
| 26 | Secrets / config | shared, workers | secret leakage in responses/logs |
| 27 | Schemas / validation | all packages zod | mass assignment, prototype pollution |
| 28 | Path traversal | file paths, R2 keys | ../, abs paths, upload names |
| 29 | ReDoS / regex | all packages | catastrophic regex on user input |
| 30 | SSRF + prompt injection | all fetch sinks | URL parsing escapes, agent prompts |

Cross-cutting passes after wave 30:
- W31: authorization matrix diff (every route vs authz check)
- W32: PoC re-run of every confirmed finding (all green, no false positives)
- W33: dedup pass against #40-#127
- W34: severity-ordered issue1.md..issueN.md + engagement report + worklog
