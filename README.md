# @plasius/ai-game

Game-domain AI contracts for player action validation, NPC actions, gossip, and feedback.

## Scope

This package is part of the layered `@plasius/ai-*` package family. It exports canonical public contracts for world events, world-event ingestion, incident impact state, and gossip topic projection.

## Install

```bash
npm install @plasius/ai-game
```

## Exports

```ts
import {
  AI_GAME_PACKAGE,
  AI_GAME_FEATURE_FLAG_ID,
  aiGameFeatureFlags,
  packageDescriptor,
  type GameWorldEvent,
  type WorldEventIngestionPort,
  type WorldIncidentThread,
  type GossipTopic,
  type GossipPerspectiveProjection
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

## Feature flags

- `ai.game.event-recorder.contracts.enabled`
- `ai.game.event-recorder.ingestion.enabled`
- `ai.game.event-recorder.impact.enabled`
- `ai.game.npc-gossip.topics.enabled`
- `ai.game.npc-gossip.perspective.enabled`
- `ai.game.npc-gossip.lifecycle.enabled`

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
