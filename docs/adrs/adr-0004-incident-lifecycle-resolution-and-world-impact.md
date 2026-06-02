# ADR-0004: Incident Lifecycle, Resolution, and World Impact

## Status

- Proposed
- Date: 2026-05-13
- Version: 1.0

## Context

Some world changes are one-shot facts, but others are long-lived incidents such as wars, famine, or dungeon occupation. The system needs to answer whether those situations are still active, when they ended, how they ended, and how strongly they affected nearby systems.

## Decision

- Group related events under an optional `incidentId` so long-lived situations can be tracked as narrative threads.
- Represent current incident state in a derived projection with lifecycle states such as active, resolved, superseded, and expired.
- Record resolution as follow-up facts linked to the closing event rather than mutating the original initiating event.
- Model impact with both scope and dimension vectors so downstream systems can reason about security, economy, ecology, politics, morale, magic, and population effects.
- Roll out incident and impact modeling behind `ai.game.event-recorder.impact.enabled`, evaluated server side, with local env override break-glass only.

## Consequences

- The system can answer when and how a war, famine, or dungeon event resolved.
- Gossip and analytics can rank the same event differently based on impact scope and dimension.
- Projectors must manage both atomic events and incident state.
- Designers gain a stable place to encode world-change significance instead of burying it in prose.
