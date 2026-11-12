# Hunter Brief — pollinations local red-team (shared by all hunters)

## Authorization & safety
- Explicit user authorization to audit github.com/pollinations/pollinations. Defensive research only.
- **ALL testing is LOCAL**: run against the clone at `upstream/` and loopback/miniflare mocks only.
- **NEVER** contact `*.pollinations.ai`, never use real Stripe/OpenAI/Replicate keys, never fire at production.
- No DoS, no mass requests, no data exfiltration. Minimal, non-destructive reproductions.
- Do NOT modify upstream source files except by ADDING new test files under `upstream/<pkg>/test/`.
  (If a fix would be needed to demonstrate, do NOT patch the source — write the PoC so it demonstrates the
   vulnerable behaviour as-is, and describe the fix in the report.)

## Repo layout (read-only except test files)
- `upstream/` = clone of pollinations/pollinations @ `5c790c785c5063a4ec260e99b61e215bfebaa399` (already `npm install`ed).
- Monorepo workspaces: `shared/`, `gen.pollinations.ai/`, `enter.pollinations.ai/`, `media.pollinations.ai/`,
  `packages/auth`, `packages/sdk`, `packages/mcp`, `packages/polli-cli`, `packages/ui`.

## PoC harness (verified working)
Each worker package has its own vitest+miniflare config:
  cd upstream/gen.pollinations.ai  && npx vitest run test/<file>.test.ts
  cd upstream/enter.pollinations.ai && npx vitest run test/<file>.test.ts
  cd upstream/media.pollinations.ai && npx vitest run test/<file>.test.ts
  cd upstream/shared && npx vitest run <file>.test.ts
HTTP-level PoCs use `import { env, SELF } from "cloudflare:test"` and `SELF.fetch("http://localhost:3000/...")`.
D1 access: `import { drizzle } from "drizzle-orm/d1"; const db = drizzle(env.DB);` with schemas in
`shared/db/*.ts`. R2 mock helper: `import { createTestR2Bucket } from "@shared/test/mocks/r2.ts"`.
Look at existing tests (`upstream/gen.pollinations.ai/test/*.test.ts`, `upstream/enter.pollinations.ai/test/fixtures.ts`,
`upstream/media.pollinations.ai/test/integration.test.ts`) for the exact idioms — copy their patterns, don't invent.
`enter.pollinations.ai/test/fixtures.ts` exports helpers like `createApiKeyViaApi`, `test` fixture with
`sessionToken`/`accountToken`.

## PoC file naming
Write each PoC as `upstream/<pkg>/test/poc_<slug>.test.ts` — self-contained, deterministic, and it MUST:
1. FAIL if the vulnerability is fixed (i.e. assert the vulnerable behaviour currently happens),
2. print clear `console.log` evidence lines (what an attacker gains),
3. run green with `npx vitest run` — capture the exact command + output snippet as evidence.

## Dedup rules (CRITICAL)
Prior reports for issues **#40–#127** already exist at
`.newera/cyber/prior/pollinations-bugs-40-127/` (88 files) and the index at
`.newera/cyber/prior/pollinations-bugs-40-127/00-SEVERITY-INDEX.md`.
**Read the index first. Do NOT report anything already covered there** (even a variant of it) — you must find
NEW, distinct bugs. If a prior issue is partially fixed upstream, only report it if you can prove a NEW
residual exploit path that the prior report does not describe.

## Output contract — write BOTH files per finding
1. PoC test file (as above).
2. Append your finding to your area file `.newera/cyber/engagement/findings/<AREA>.md` using EXACTLY this
   markdown block per finding (one block per finding, no extra prose inside):

```
### <FINDING_ID> | <TITLE>
- **Area**: <area>
- **Severity**: CRITICAL | HIGH | MEDIUM | LOW
- **File**: <path:line>
- **Affected code**: <repo-relative path + short quote of the vulnerable logic>
- **Attack**: <exact attacker steps, minimal>
- **Impact**: <what the attacker gains>
- **PoC**: <path to test file>
- **PoC command**: <exact command>
- **PoC output**: <verbatim key lines of the run>
- **Remediation**: <concrete fix>
- **Dedup**: <one line: why this is NOT in #40-#127>
```

Also write `.newera/cyber/engagement/findings/<AREA>.json` — a JSON array of objects with keys:
`id,title,area,severity,file,affected_code,attack,impact,poc_path,poc_command,poc_output,remediation,dedup`.
The JSON array is what the lead uses to assemble `issue*.md` — it must be valid JSON (validate with `node -e`).

## Quality bar — NO FALSE POSITIVES
- A finding counts ONLY if the PoC test actually runs and shows the vulnerable behaviour.
- Do not report: missing hardening that has no exploitable path, theoretical-only issues, "defence in depth"
  nitpicks, or issues already in the prior index.
- Do not report a bug you could not execute. If you could not prove it, drop it (record it as a hypothesis in your
  summary instead — the lead will not publish hypotheses).
- Prefer real money/data/account-impact bugs over style issues.

## Working discipline
- Read code end-to-end for your assigned area, grep for the dangerous sinks (fetch of user URL, drizzle raw SQL,
  eval, innerHTML, path join, JWT parse, compare, timingSafeEqual, rate limiter, wallet balance write).
- Work in waves inside your area: each wave = one subsystem. Keep a short wave log in your summary.
- Use `git log --since=2026-10-26` inside `upstream/` to see freshly changed code — fresh code is the highest
  yield for NEW bugs, but verify against the whole area.
- Budget: you have a limited number of steps. Prefer breadth of READ + depth on 3-8 real findings over
  exhaustive speculation.
