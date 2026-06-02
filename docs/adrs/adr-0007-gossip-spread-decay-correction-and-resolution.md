# ADR-0007: Gossip Spread, Decay, Correction, and Resolution

## Status

- Proposed
- Date: 2026-05-13
- Version: 1.0

## Context

Gossip is not static. Topics spread through channels, lose relevance over time, and can be corrected when new canonical facts arrive. A useful system needs to remember that rumors existed while still exposing the current best-known state.

## Decision

- Model gossip as a lifecycle with spread, freshness decay, correction, and resolution updates.
- Use follow-up event or incident updates to supersede or revise active gossip topics rather than silently overwriting them.
- Let propagation speed and retention depend on impact, locality, faction relevance, and channel type.
- Keep a current queryable topic state while preserving revision lineage for audits and debugging.
- Roll out lifecycle handling behind `ai.game.npc-gossip.lifecycle.enabled`, evaluated server side, with local env override break-glass only.

## Consequences

- NPC conversations can evolve naturally as new information arrives.
- Contradictions can be explained as earlier rumor versus later correction instead of unexplained bugs.
- The system needs revision and expiry handling in addition to simple topic creation.
- High-impact incidents can remain conversation-worthy longer without keeping every trivial rumor forever.
