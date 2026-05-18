# @plasius/ai-game

Game-domain AI contracts for player action validation, NPC actions, gossip, and feedback.

## Scope

This package is part of the layered `@plasius/ai-*` package family and defines public contracts for game AI workloads that need gameplay authority checks, deterministic task classification, and speech cache safety.

## Contracts

- `AI_GAME_FEATURE_FLAGS` declares workload and TTS cache flags for game workloads.
- `classifyAiGameTask` detects game-task intent from player/NPC text.
- `resolveAiGameTaskBatch` evaluates requested game tasks through risk classes and actor authority boundaries.
- `resolveAiGamePlayerAddressText` removes player/account identifiers and returns exact/near/no-cache tags for TTS reuse.

## Install

```bash
npm install @plasius/ai-game
```

## Usage

```ts
import {
  AI_GAME_FEATURE_FLAGS,
  classifyAiGameTask,
  resolveAiGameTaskBatch,
  resolveAiGamePlayerAddressText,
} from "@plasius/ai-game";

const taskKind = classifyAiGameTask("A rumor started about the blacksmith");

const tasks = resolveAiGameTaskBatch({
  actorRole: "player",
  featureFlags: {
    [AI_GAME_FEATURE_FLAGS.workloads]: true,
    [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
    [AI_GAME_FEATURE_FLAGS.ttsNearReuseEnabled]: true,
  },
  requests: [
    {
      taskId: "t1",
      taskText: "Rumor about the blacksmith started near the gate",
    },
  ],
});

const speech = resolveAiGamePlayerAddressText({
  playerAddressText: "Hello Alice, your quest update is ready",
  playerAlias: "Alice",
  featureFlags: {
    [AI_GAME_FEATURE_FLAGS.ttsCacheEnabled]: true,
  },
});

console.log(taskKind, tasks.audit.result, speech.ttsCachePolicy);
```

## Development

```bash
npm install
npm run build
npm test
npm run test:coverage
npm run pack:check
```

## Governance

- Security policy: [SECURITY.md](./SECURITY.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- ADRs: [docs/adrs](./docs/adrs)
- CLA and legal docs: [legal](./legal)

## License

Apache-2.0
