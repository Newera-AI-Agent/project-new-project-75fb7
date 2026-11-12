# Scope — pollinations local red-team engagement

- **Target**: `github.com/pollinations/pollinations` @ `5c790c785c5063a4ec260e99b61e215bfebaa399` (cloned locally to `/tmp/pollinations`).
- **Authorization**: explicit user statement in the task brief (owner-directed assessment of the public open-source repository).
- **Method**: static end-to-end code read + executable PoCs executed against the real upstream modules in this VM (vitest/tsx harnesses, local mock providers, loopback servers).
- **Hard rules**:
  1. No request is ever sent to a production `*.pollinations.ai` host.
  2. No production credential, key, balance or user data is used.
  3. No proof-of-concept is destructive or hits a third party.
  4. Every published finding must be backed by a PoC transcript saved under `.newera/cyber/engagement/evidence/`.
- **Dedup baseline**: the 88 prior issues `#40`–`#127` supplied by the requester (`.newera/cyber/prior/pollinations-bugs-40-127/`). New findings must be materially distinct from those; overlap is explicitly noted.
