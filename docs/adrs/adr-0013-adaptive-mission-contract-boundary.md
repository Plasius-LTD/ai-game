# ADR 0013: Adaptive mission contract boundary

## Status

Accepted

## Context

The Player System needs a portable mission surface that can guide bootstrap
players, learn from mission responses over time, and expose bounded reward
metadata without making `@plasius/ai-game` the authority for progression truth.

ADR 0061 and TDR-0029 require adaptive mission selection, confidence-scored
player-model learning, MCC focus influence, and reward envelopes that accelerate
readiness without skipping gates. Those rules must be consumable by multiple
packages without pulling site runtime code into the shared contract boundary.

## Decision

`@plasius/ai-game` owns the dependency-free adaptive mission contract boundary
behind `isekai.player-system.missions.enabled`.

- Mission definitions remain distinct from guild quests and other external
  contract systems.
- Mission definitions carry both audio and visual feedback channels so
  completion and failure outputs stay aligned with the Player System design.
- Objective-state contracts capture bounded progress snapshots rather than raw
  host runtime internals.
- Player-response contracts explicitly model acceptance, refusal, ignored or
  declined outcomes, pinning, completion, failure, and abandonment as learning
  signals.
- Player-model influence inputs carry bounded confidence, evidence metadata,
  repeated-signal handling, MCC focus influence, and readiness or stage-gate
  context.
- Reward envelopes are progression-safe, accelerant-only payloads with explicit
  minimum, maximum, cap, cap semantic, readiness context, gate references, and
  reason codes describing why a reward cannot skip progression.

The contract version is `1.0`. Incompatible changes require a new contract
version and an explicit ADR.

## Alternatives considered

1. Keep adaptive mission contracts inside the site repository. Rejected because
   multiple consumers need one stable shared vocabulary.
2. Allow free-form reward payloads and let consumers enforce fairness.
   Rejected because consumer-side reward policing is easy to bypass and would
   weaken progression safety.
3. Reuse guild-quest contracts for System missions. Rejected because TDR-0029
   explicitly distinguishes internal System missions from guild-sourced work.

## Consequences

The Player System runtime, site adapters, and future packages can share one
validated mission vocabulary for guidance, learning signals, and bounded reward
metadata. The package still stays out of authority-owned progression writes and
host-private tuning logic.

## Validation

Tests cover enum guards, confidence-band derivation, immutable mission
definitions and responses, dual-channel feedback requirements, bounded reward
caps, progression-safe reason codes, and malformed mission input rejection.
