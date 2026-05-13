# ADR-0002: Game AI Task Contracts and Speech Cache Safety

- Date: 2026-05-14
- Status: Accepted

## Context

The `@plasius/ai-game` package began as a package boundary scaffold while `#266` and `#273` were still open. The implementation needed concrete, testable contracts for:

- player-action validation intents
- NPC action/dialogue/gossip/governance task types
- gameplay authority boundaries for high-impact outcomes
- player-address text handling before speech render to control cache reuse

## Decision

The package now exports stable contracts for:

- deterministic task classification from free text (`classifyAiGameTask`)
- batched task resolution for actor-role-aware workflow gating (`resolveAiGameTaskBatch`)
- player-address redaction + TTS cache decisioning (`resolveAiGamePlayerAddressText`)

`ai.game-agentic-workloads.enabled` is the primary feature gate for all task resolution decisions. Existing speech-feature flags are surfaced for cache behavior alignment but do not change the package boundary contract.

## Consequences

- Consumers receive a single point of contract for gameplay task risk classes and fallback paths.
- High-impact gameplay decisions are represented as deterministic/operator-review/blocked outcomes, enabling explicit human fallback.
- Default speech payloads remove player/account identifiers before cache reuse decisions.
