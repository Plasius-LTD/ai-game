# NPC Gossip System

Status: Proposed  
Last updated: 2026-05-13

## Purpose

Transform canonical world events into relative, NPC-appropriate knowledge that can later be expressed as natural-language gossip during chat.

This system is not a raw chat generator. It is a knowledge projection and rumor-lifecycle system that decides what an NPC plausibly knows, how certain they are, how important the topic feels to them, and whether the topic is still current.

## Goals

- Convert authoritative event history into gossip-ready structured topics.
- Keep NPC knowledge relative to geography, faction, occupation, relationships, and witness chains.
- Track freshness, spread, correction, and resolution so gossip evolves with the world.
- Feed downstream dialogue systems with structured facts and linguistic hints rather than pre-rendered final text.
- Preserve the difference between public facts, local rumor, faction-only knowledge, and secrets.

## Non-goals

- Generating final chat prose inside this subsystem.
- Letting NPCs know everything the server knows.
- Keeping every rumor forever regardless of relevance.
- Replacing faction memory, quest state, or hard gameplay authority systems.

## Inputs

- Canonical `GameEvent` records from the Event Recorder.
- Incident projections with current active/resolved state.
- World topology and distance data.
- NPC metadata such as settlement, faction, role, known relationships, and reputation context.
- Optional channel metadata such as tavern noticeboards, guards, traders, heralds, and faction dispatches.

## Output shape

The primary output should be a structured topic rather than a final sentence.

```ts
interface GossipTopic {
  topicId: string;
  incidentId?: string;
  sourceEventIds: string[];
  topicType: string;
  scope: "local" | "regional" | "global";
  salience: number;
  freshness: number;
  certainty: "witnessed" | "trusted" | "heard" | "rumored";
  visibility: "public" | "local_public" | "faction_limited" | "party_limited" | "secret";
  resolutionState: "active" | "resolved" | "corrected" | "stale";
  factSummary: {
    headline: string;
    participants: string[];
    placeLabels: string[];
    outcome?: string;
  };
  speechHints: {
    tone: "celebratory" | "fearful" | "cautious" | "resentful" | "neutral";
    uncertaintyCue?: string;
    notableEntities: string[];
    keywordTags: string[];
  };
}
```

```ts
interface RelativeKnowledgeEntry {
  subjectKey: string;
  subjectType: "npc" | "audience_segment";
  topicId: string;
  stance: "supportive" | "hostile" | "neutral" | "self_interested";
  confidence: number;
  proximityBand: "onsite" | "same_settlement" | "same_region" | "distant";
  heardFrom?: string;
  firstKnownAtEpochMs: number;
  lastRefreshedAtEpochMs: number;
  expiresAtEpochMs?: number;
}
```

## Relative knowledge model

An NPC should only receive a topic when one or more propagation rules make it plausible:

- they witnessed the event directly;
- the event happened within their proximity band;
- their faction, party, guild, or settlement would circulate it;
- their role makes the topic unusually relevant, such as a guard hearing of a war breakout or a merchant hearing of famine and surplus;
- a trusted intermediary carried the information to them.

The system should prefer segment-level projections first, such as "town guards in Westwatch" or "farmers in the North Vale", then apply NPC-specific overlays for relationships, personal history, and stance. That avoids exploding storage while keeping individual gossip relative.

## Processing flow

1. Select candidate events or incident updates from the Event Recorder export checkpoint.
2. Score whether the fact is gossip-worthy based on novelty, impact, proximity, and visibility.
3. Build a structured topic seed from the factual event payload.
4. Project that topic into audience segments and NPC-relative knowledge entries using perspective rules.
5. Apply spread, decay, correction, and resolution updates over time.
6. Expose the current topic set to dialogue systems as structured context for natural-language generation.

## Perspective and visibility rules

NPC Gossip must preserve "who could know what" as a first-class invariant.

- `public`: may spread broadly according to propagation channels.
- `local_public`: may spread near the site and outward over time.
- `faction_limited`: may only spread through explicit faction channels unless leaked by another event.
- `party_limited`: remains near the involved party unless a public consequence occurs.
- `secret`: excluded from gossip unless a separate leak or discovery event makes it gossipable.

Perspective also shapes interpretation:

- allies speak of war heroes differently from enemies;
- merchants weight famine and surplus more heavily than soldiers do;
- villagers closer to a monster spawn may exaggerate danger compared with distant nobles;
- direct witnesses should sound more certain than third-hand rumor chains.

## Propagation, decay, and correction

Gossip should behave like a living topic stream:

- high-impact local events spread faster and persist longer locally;
- large regional or global events spread through formal channels even at distance;
- stale topics decay unless refreshed by related follow-up events;
- resolution events should update active rumors instead of leaving contradictory active copies;
- corrections should preserve that an old rumor existed while making the current truth queryable.

This means the system needs topic revisions or supersession links rather than silent overwrites.

## Dialogue integration boundary

The dialogue layer should receive structured knowledge, not a finished script. That gives later systems control over:

- tone and wording by NPC personality;
- language and localization;
- confidence and hedging phrases;
- repetition limits and conversational variety;
- safety and moderation filtering.

NPC Gossip is therefore a context service for dialogue, not the final line renderer.

## Safety and governance rules

- Do not leak account identifiers or privileged moderation data.
- Do not expose impossible omniscience.
- Do not convert `system_only` events into gossip.
- Preserve source truth and correction history so rumors can be explained or rebutted later.
- Keep feature rollout server evaluated; any local env override should be break-glass only.

## ADR roadmap

- ADR-0005 defines structured gossip topics as the canonical output boundary.
- ADR-0006 defines perspective-gated relative knowledge projection.
- ADR-0007 defines spread, decay, correction, and resolution handling.
