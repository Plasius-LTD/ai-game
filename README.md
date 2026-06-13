# @plasius/ai-game

Game-domain AI contracts for player action validation, NPC actions, gossip, feedback, and points-store authority seams.

## Scope

This package is part of the layered `@plasius/ai-*` package family. It exports canonical public contracts for world events, world-event ingestion, incident impact state, gossip topic projection, and Player System points-store ledgers and spend policies.

## Install

```bash
npm install @plasius/ai-game
```

## Exports

```ts
import {
  AI_GAME_PACKAGE,
  AI_GAME_FEATURE_FLAG_ID,
  AI_GAME_POINTS_STORE_FEATURE_FLAG_ID,
  aiGameFeatureFlags,
  getAiGameProtoSocialDevolutionPolicy,
  getDefaultAiGamePointsSpendPolicies,
  packageDescriptor,
  type GameWorldEvent,
  type WorldEventIngestionPort,
  type WorldIncidentThread,
  type GossipTopic,
  type GossipPerspectiveProjection,
  type AiGamePointsLedgerSnapshot
} from "@plasius/ai-game";
```

## Development

```bash
npm install
npm run build
npm test
npm run test:coverage
npm run pack:check
```

## Release Workflow

Protected `main` releases use a two-step flow:

1. Run `.github/workflows/cd.yml` with `bump=patch|minor|major` to push a `release/vX.Y.Z` prep branch and, when repository settings allow it, open the matching PR from `main`. The workflow creates that branch before committing the versioned `package.json` and `CHANGELOG.md` updates, and a tested helper promotes the current `Unreleased` section into the matching version header so the release metadata is preserved for review and publish.
2. Merge that PR to `main` so the next `main` push can detect the unpublished versioned metadata, tag the release, publish to npm, and publish the GitHub release.

If a release version is already prepared on `main` and only publication remains, rerun `.github/workflows/cd.yml` with `bump=none` to publish the current version from `main` without creating a new release branch.

## Feature flags

- `ai.game.event-recorder.contracts.enabled`
- `ai.game.event-recorder.ingestion.enabled`
- `ai.game.event-recorder.impact.enabled`
- `ai.game.npc-gossip.topics.enabled`
- `ai.game.npc-gossip.perspective.enabled`
- `ai.game.npc-gossip.lifecycle.enabled`
- `isekai.player-system.points-store.enabled`

## Points Store contracts

- `AI_GAME_POINTS_LEDGER_IDS` exports the canonical `PP`, `ESP`, `TIS`, and `DIS` ledger IDs as `pp`, `esp`, `tis`, and `dis`.
- `resolveAiGamePointsAuthorityBoundary()` maps each ledger to its public authority band and owning external system.
- `getDefaultAiGamePointsSpendPolicies()` describes the documented spend-policy surface for each ledger.
- `getAiGameProtoSocialDevolutionPolicy()` and `evaluateAiGameProtoSocialDevolutionEligibility()` define the one-time proto-social PP devolution window and its closure after social-form lock.

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
