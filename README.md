# @plasius/ai-game

Game-domain AI contracts for player action validation, adaptive System missions, NPC actions, gossip, observed event logs, Quiet Measure mission probes, Judgment disclosure surfaces, and Player System-readable training recommendations.

## Scope

This package is part of the layered `@plasius/ai-*` package family. It exports canonical public contracts for adaptive System missions, world events, world-event ingestion, incident impact state, gossip topic projection, Quiet Measure hidden-runtime integration surfaces, and the Player System bridge layer that consumes `@plasius/training`.

## Install

```bash
npm install @plasius/ai-game
```

## Exports

```ts
import {
  AI_GAME_PACKAGE,
  AI_GAME_FEATURE_FLAG_ID,
  AI_GAME_TRAINING_INSTITUTIONS_FEATURE_FLAG_ID,
  aiGameFeatureFlags,
  packageDescriptor,
  AI_GAME_QUIET_MEASURE_FEATURE_FLAG_ID,
  type AiGameTrainingState,
  type AiGameInstitutionEligibility,
  type AiGameSpecializationRecommendation,
  type GameWorldEvent,
  type WorldEventIngestionPort,
  type WorldIncidentThread,
  type GossipTopic,
  type GossipPerspectiveProjection,
  type QuietMeasureAxisSummary,
  type QuietMeasureMissionProbe,
  type QuietMeasureJudgmentResponse
} from "@plasius/ai-game";
```

## Training bridge contracts

The training surface intentionally reuses `@plasius/training` as the authority for institutions, trust tiers, and specialization tracks.

- `AiGameTrainingState` re-exports the canonical progression record from `@plasius/training`.
- `AiGameInstitutionEligibility` makes stage-gated institutional availability explicit for Player System consumers.
- `AiGameTrainingTrustMarker` carries trust evidence without copying broader profile state.
- `AiGameTrainingAcademicMissionPrerequisite`, `AiGameTrainingSchoolProgression`, `AiGameTrainingAcademyAdmission`, and `AiGameTrainingTrackSelection` re-export the academy authority contracts from `@plasius/training`.
- `AiGameSpecializationRecommendation` keeps leaning and recommended-track output inside the canonical `internalized` / `externalized` / `hybrid` MCC doctrine.
- `createAiGameTrainingStateSnapshot` freezes a Player System-readable bundle of progression, institution, eligibility, trust-marker, and recommendation data.
- `createAiGameAcademicTrainingSnapshot` packages school-stage progress, academy admissions, track-selection authority, and Player System recommendations into one frozen bridge payload.

## Martial training bridge contracts

The martial slice remains a bridge surface over the published
`@plasius/training` authority package rather than a second source of truth.

- `AI_GAME_TRAINING_MARTIAL_FEATURE_FLAG_ID` re-exports the inherited
  `isekai.training.martial.enabled` rollout key.
- `AI_GAME_TRAINING_BARRACKS_DRILL_DELIVERY_MODES`,
  `AI_GAME_TRAINING_MARTIAL_TECHNIQUE_FAMILIES`, and
  `AI_GAME_TRAINING_ANTI_SPELL_FIELDCRAFT_FAMILIES` expose the canonical
  barracks and bounded anti-spell vocabulary to ai-game consumers.
- `AiGameTrainingBarracksDrill`, `AiGameTrainingMissionTechniqueUnlock`,
  `AiGameTrainingMartialTechnique`, and
  `AiGameTrainingAntiSpellFieldcraftDiscipline` re-export the authoritative
  training contracts directly.
- `createAiGameMartialTrainingSnapshot` freezes a Player System-readable bundle
  of barracks drills, mission-earned unlocks, martial techniques, and bounded
  anti-spell fieldcraft without redefining those authority models locally.

## Player System core contracts

The Player System core contracts are dependency-free shared boundaries under
`isekai.player-system.core.enabled`. They provide:

- versioned ambient, focused, and combat-safe focus-mode contracts;
- module descriptors for identity, missions, guild quests, event logs, MCC,
  tutorials, and the points store;
- alert priorities with combat-safe delivery filtering that preserves critical
  and high-priority alerts; and
- privacy-safe preference-learning inputs with bounded confidence scores,
  confidence bands, and immutable session profiles.

Use `createAiGamePlayerSystemSession()`,
`createAiGamePlayerSystemPreferenceProfile()`, and
`selectAiGamePlayerSystemAlertsForFocusMode()` at package boundaries. The
contracts intentionally contain no account identifiers, credentials, or raw
player telemetry.

### Guidance cue contracts

Guidance cues reuse the core alert-priority vocabulary while adding explicit
multimodal fallback identifiers and bounded delivery assumptions under
`isekai.player-system.guidance-nfr.enabled`:

- `createAiGamePlayerSystemGuidanceCue()` validates cue source/fallback pairs.
- `maxPayloadBytes` is capped at 4,096 bytes and
  `maxOccurrencesPerMinute` is capped at 30 to make client performance
  assumptions machine-checkable.
- Voice, narration, and speech-capture failures map to touch/text summaries,
  live-region status copy, and visible manual actions respectively.

## Adaptive mission contracts

Adaptive System missions are versioned, dependency-free shared contracts under
`isekai.player-system.missions.enabled`. They keep the Player System's internal
mission vocabulary portable while preserving progression safety.

- `AiGameMissionDefinition` captures bootstrap, short-term, medium-term, and
  long-horizon mission guidance with explicit readiness context, nearby
  opportunity codes, world-pressure codes, and dual `audio` / `visual`
  feedback channels.
- `AiGameMissionObjectiveState` freezes bounded progress snapshots for mission
  objectives without leaking host runtime internals.
- `AiGameMissionPlayerResponse` explicitly models acceptance, refusal,
  ignored or declined outcomes, pinning, completion, failure, and abandonment
  so those events can feed the player model safely.
- `AiGameMissionPlayerModelInfluenceInput` carries preference dimensions,
  bounded confidence, evidence metadata, repeated-signal handling, MCC focus
  influence, and readiness or gate context.
- `AiGameMissionRewardEnvelope` encodes progression-safe accelerants only:
  bounded currencies, items, recipes, temporary modifiers, and knowledge
  unlocks with minimum, maximum, cap, cap semantic, readiness context, stage
  gates, and explicit `cannotSkipReasonCodes`.

Use `createAiGameMissionDefinition()`,
`createAiGameMissionPlayerResponse()`, and
`createAiGameMissionRewardEnvelope()` at package boundaries. The mission
surface intentionally avoids raw telemetry, progression writes, and
authority-owned tuning data.

## Quiet Measure contracts

The Quiet Measure surface is intentionally structured as a hidden-runtime contract, not a turnkey morality meter.

- Axis and derived-read contracts expose bounded summaries, confidence bands, evidence windows, and perspective scope without publishing host-specific raw score storage.
- Mission probe contracts model `Clarify`, `Tempt`, and `Reinforce` modes plus `Restorative`, `Dominant`, `Detached`, and optional `Performative` resolution shapes.
- Judgment contracts model request, eligibility, insufficient-evidence, and verdict responses with `title-and-verdict-only` disclosure as the default public output.
- Runtime helpers validate and defensively copy public Quiet Measure request, title, dominant-read, and reason-code payloads so malformed host input fails closed without leaking hidden-score internals.
- Evaluation fixtures for hero, villain, counterfeit, tyrant, and redemption regression cases belong in `@plasius/ai-evals`, not this package.

## Identity projection contracts

Identity projections are versioned, projection-only payloads under
`isekai.player-system.identity.enabled`. The identity-card boundary remains the
authority of record; `@plasius/ai-game` only defines portable consumer
contracts.

- Self projections are full reads.
- Visible targets are full only when both line of sight and full knowledge are
  present; otherwise fields are redacted into a partial read.
- Occluded targets always become partial reads with `Withheld` field values.
- Target categories are `allied`, `neutral`, `unknown`, and `unfriendly`.

Use `createAiGameIdentityProjectionContract()` to build an immutable payload
and `selectAiGameVisibleIdentityTargets()` before rendering line-of-sight
surfaces. The contract does not carry hidden truth or authority-owned mutation
data.

## Observed event log and gossip export contracts

Observed event contracts provide a shared, privacy-safe basis for Player System
logs and gossip transport under `isekai.player-system.logs.enabled`:

- `AiGameObservedEvent` carries bounded domain references, summaries, visibility,
  significance, and tags without raw player telemetry or account identifiers.
- `AiGameObservedEventRecencyWindow` validates that events fall inside a single
  time-bounded window.
- `AiGameObservedEventHighlightSummary` references event IDs from its source
  window rather than copying event truth.
- `AiGameGossipExport` packages one recency window and validated highlights for
  a declared player, NPC, or public audience.

Use `createAiGameObservedEvent()`,
`createAiGameObservedEventRecencyWindow()`,
`createAiGameObservedEventHighlightSummary()`, and
`createAiGameGossipExport()` at package boundaries. Audience authorization,
feature-flag evaluation, persistence, and gossip generation remain the
responsibility of consuming services.

## Development

```bash
npm install
npm run build
npm test
npm run test:coverage
npm run pack:check
```

## Feature flags

- `ai.game.event-recorder.contracts.enabled`
- `ai.game.event-recorder.ingestion.enabled`
- `ai.game.event-recorder.impact.enabled`
- `ai.game.npc-gossip.topics.enabled`
- `ai.game.npc-gossip.perspective.enabled`
- `ai.game.npc-gossip.lifecycle.enabled`
- `isekai.player-system.quiet-measure.enabled`
- `isekai.player-system.core.enabled`
- `isekai.player-system.guidance-nfr.enabled`
- `isekai.player-system.identity.enabled`
- `isekai.player-system.logs.enabled`
- `isekai.training.institutions.enabled`
- `isekai.training.academies.enabled`
- `isekai.training.martial.enabled`

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
