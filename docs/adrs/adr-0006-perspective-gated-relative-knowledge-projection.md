# ADR-0006: Perspective-Gated Relative Knowledge Projection

## Status

- Proposed
- Date: 2026-05-13
- Version: 1.0

## Context

Canonical events describe what truly happened, but NPC gossip must describe what a specific NPC or audience segment could plausibly know. Without a perspective layer, NPCs become omniscient and secret or distant events leak into inappropriate conversations.

## Decision

- Project gossip topics through geography, faction, occupation, relationship, and witness-channel rules before making them visible to an NPC or audience segment.
- Use audience-segment projections as the base layer, then apply NPC-specific stance or relationship overlays where needed.
- Preserve visibility classes such as public, local public, faction limited, party limited, and secret as hard constraints on projection.
- Store certainty and heard-from metadata so dialogue can distinguish direct witnesses from third-hand rumor.
- Roll out perspective projection behind `ai.game.npc-gossip.perspective.enabled`, evaluated server side, with local env override break-glass only.

## Consequences

- NPC knowledge stays believable and locality aware.
- Storage and query design become more complex because the same topic may have different relative forms.
- Secret events stay private unless another explicit leak or discovery event makes them projectable.
- Designers get a stable way to tune who hears what and how confidently they repeat it.
