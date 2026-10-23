# ADR 0022: Unknown game task classifications require review

- Status: Accepted
- Date: 2026-10-23
- Work: ai-game#82; original Feature 266 / Story 273 / Epic 260

## Context

Unknown task profiles were low-risk and deterministic, so unclassified text or
an unsupported decoded task kind could enter `allowedTaskIds`. Falsy malformed
kinds could also fall through to text inference. This contradicted ADR 0002's
explicit authority fallback. The package already owns classification, profiles,
per-task decisions and audit aggregation; no new package or dependency is needed.

## Decision

Unknown profiles have high risk and an operator-review boundary. Unknown kinds
require review for every actor role, before the existing system-role allowance
for recognized review-bound kinds. Only an omitted (`undefined`) kind uses the
text classifier. Unsupported values, including `null`, empty strings, booleans,
numbers and structured decoded values, normalize to unknown and require review.

The existing reason-code scheme yields `task-unknown-operator-review`. Unknown
requests enter `reviewTaskIds`, never `allowedTaskIds`; batch audit is `defer`
unless any blocked task makes it `deny`. Recognized explicit kinds retain their
meaning. Review happens outside this package; this change grants no new authority
and does not reinterpret recognized caller-supplied kinds from text.

The original Feature records `ai.game-agentic-workloads.enabled`; current source
exports `AI_GAME_FEATURE_FLAGS.workloads` as `ai.game.enabled`. Preserve the
current public key. Consumers supply its remotely evaluated snapshot. Missing or
false state blocks all tasks, regardless of classification. The historical name
is not an alias. No capability is required for this package-only policy fix.

## Alternatives and consequences

Reclassifying malformed explicit kinds from text could allow invalid structured
input to obtain automatic authority through a keyword heuristic. Unconditional
review is more conservative and is an accepted option in Task 82. Blocking all
unknown work would prevent the existing human fallback, while preserving the
system bypass would keep a fail-open path. Neither is chosen.

Public types and recognized decisions stay compatible, but consumers that relied
on unknown work executing must correct classification or handle operator review.
This is an intentional safer fallback patch. No I/O, retries, dependency changes,
new flag evaluator or unrelated validation is added; processing remains linear
in requests and text with the same immutable collection outputs and audit shape.

## Verification and release

First-failing regressions cover unknown/empty text, explicit unknown, malformed
decoded values across all actor roles and review/blocked/dialogue text. Tests
retain known deterministic/system decisions, deny precedence and feature-off or
unavailable behavior. Run full tests, coverage with changed-source LCOV, lint,
strict types, build, package/artifact checks and dependency audit. Qualify installed
ESM/CJS and declarations through the public package surface and confirm the
task-resolution consumer handles the review collection and audit result.

Deliver through a focused PR, successful CI and the existing exact-main hosted
`cd.yml` / `production` OIDC release, with an unused patch version and registry
integrity/provenance evidence. Rollback disables `ai.game.enabled` in the remote
consumer control plane. Keep the safe fallback rather than reverting to automatic
approval of unknown work. This package deploys no UI, backend or Azure resources.
