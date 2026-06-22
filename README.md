# @plasius/ai-game

Game-domain AI contracts for player action validation, NPC actions, gossip, Quiet Measure mission probes, Judgment disclosure surfaces, and Player System-readable training recommendations.

## Scope

This package is part of the layered `@plasius/ai-*` package family. It exports canonical public contracts for world events, world-event ingestion, incident impact state, gossip topic projection, Quiet Measure hidden-runtime integration surfaces, and the Player System bridge layer that consumes `@plasius/training`.

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
- `AiGameSpecializationRecommendation` keeps leaning and recommended-track output inside the canonical `internalized` / `externalized` / `hybrid` MCC doctrine.
- `createAiGameTrainingStateSnapshot` freezes a Player System-readable bundle of progression, institution, eligibility, trust-marker, and recommendation data.

## Quiet Measure contracts

The Quiet Measure surface is intentionally structured as a hidden-runtime contract, not a turnkey morality meter.

- Axis and derived-read contracts expose bounded summaries, confidence bands, evidence windows, and perspective scope without publishing host-specific raw score storage.
- Mission probe contracts model `Clarify`, `Tempt`, and `Reinforce` modes plus `Restorative`, `Dominant`, `Detached`, and optional `Performative` resolution shapes.
- Judgment contracts model request, eligibility, insufficient-evidence, and verdict responses with `title-and-verdict-only` disclosure as the default public output.
- Runtime helpers validate and defensively copy public Quiet Measure request, title, dominant-read, and reason-code payloads so malformed host input fails closed without leaking hidden-score internals.
- Evaluation fixtures for hero, villain, counterfeit, tyrant, and redemption regression cases belong in `@plasius/ai-evals`, not this package.

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
- `isekai.training.institutions.enabled`

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
