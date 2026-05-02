import { describe, expect, it } from "vitest";

import {
  AI_GAME_ENV_PREFIX,
  AI_GAME_FEATURE_FLAG_ID,
  AI_GAME_PACKAGE,
  packageDescriptor,
} from "../src/index.js";

describe("@plasius/ai-game", () => {
  it("exports the package descriptor contract", () => {
    expect(packageDescriptor.packageName).toBe(AI_GAME_PACKAGE);
    expect(packageDescriptor.featureFlagId).toBe(AI_GAME_FEATURE_FLAG_ID);
    expect(packageDescriptor.envPrefix).toBe(AI_GAME_ENV_PREFIX);
    expect(packageDescriptor.summary.length).toBeGreaterThan(0);
  });
});
