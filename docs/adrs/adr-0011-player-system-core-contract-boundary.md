# ADR 0011: Player System core contract boundary

## Status

Accepted

## Context

The Player System runtime, interface, and site adapters need a small shared
contract surface for session state, module orchestration, focus modes, alert
priorities, and preference learning. The contracts must remain portable across
browser, native-shell, and headless consumers and must not pull runtime or UI
dependencies into `@plasius/ai-game`.

## Decision

`@plasius/ai-game` owns versioned, dependency-free Player System core
contracts behind `isekai.player-system.core.enabled`.

- Focus modes are `ambient`, `focused`, and `combat-safe`.
- Focused mode accepts both voice and touch input.
- Combat-safe mode exposes at most one safe module and delivers only critical
  and high-priority alerts.
- Preference inputs carry only bounded confidence, category, source, timestamp,
  and reason-code data. Account identifiers, credentials, and raw telemetry do
  not belong in this boundary.
- Factories validate timestamps, enum values, confidence bounds, and combat-safe
  module constraints, then return immutable snapshots.

The contract version is `1.0`. Consumers must treat the version as part of the
wire boundary and coordinate an explicit ADR before introducing incompatible
changes.

## Alternatives considered

1. Reuse `@plasius/player-system` directly. Rejected because it would make the
   shared game-contract package depend on a runtime orchestration package and
   create an undesirable package-direction coupling.
2. Define contracts in the site repository. Rejected because the same boundary
   is consumed by multiple packages and must remain portable and publishable.
3. Store raw preference telemetry in the contract. Rejected for privacy and
   data-minimization reasons; consumers can retain raw telemetry in an approved
   system outside this package.

## Consequences

The runtime and interface packages can consume one stable shared vocabulary,
while combat-safe delivery and preference confidence remain testable without a
browser or infrastructure SDK. Future incompatible changes require a new
contract version and migration plan.

## Validation

Unit tests cover enum guards, confidence bounds and band derivation,
immutability, focused voice/touch input, combat-safe alert filtering, and
rejection of unsafe modules.
