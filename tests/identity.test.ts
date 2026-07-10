import { describe, expect, it } from "vitest";

import {
  AI_GAME_IDENTITY_CONTRACT_VERSION,
  AI_GAME_IDENTITY_FEATURE_FLAG_ID,
  AI_GAME_IDENTITY_DISCLOSURE_POLICY,
  assertAiGameIdentityProjectionContractVersion,
  createAiGameIdentityProjectionContract,
  createAiGameIdentitySelfProjection,
  createAiGameIdentityTargetProjection,
  isAiGameIdentityKnowledgeState,
  isAiGameIdentityProjectionRead,
  isAiGameIdentityTargetCategory,
  isAiGameIdentityVisibilityState,
  resolveAiGameIdentityProjectionRead,
  selectAiGameVisibleIdentityTargets,
} from "../src/index.js";

const selfInput = {
  entityId: "player-1",
  label: "Wayfinder Kestrel",
  summary: "Self-state remains fully inspectable.",
  fields: [
    { label: "Aether balance", value: "Stable" },
    { label: "Combat posture", value: "Ready" },
  ],
};

const targetInput = {
  targetId: "target-1",
  label: "Ash-grove scout",
  category: "allied" as const,
  knowledgeState: "full" as const,
  lineOfSight: true,
  summary: "Known ally with a current watch route.",
  combatSummary: "Ally, low threat, watch route stable.",
  fields: [
    { label: "Role", value: "Forward scout" },
    { label: "Intent", value: "Holding the east path" },
  ],
};

describe("identity projection contracts", () => {
  it("exports the rollout and disclosure contract", () => {
    expect(AI_GAME_IDENTITY_FEATURE_FLAG_ID).toBe(
      "isekai.player-system.identity.enabled",
    );
    expect(AI_GAME_IDENTITY_CONTRACT_VERSION).toBe("1.0");
    expect(AI_GAME_IDENTITY_DISCLOSURE_POLICY).toEqual({
      self: "full",
      visibleTargets: "partial-or-full-by-knowledge",
      occludedTargets: "partial-redacted",
    });
    expect(resolveAiGameIdentityProjectionRead({
      knowledgeState: "full",
      lineOfSight: true,
    })).toBe("full");
    expect(resolveAiGameIdentityProjectionRead({
      knowledgeState: "full",
      lineOfSight: false,
    })).toBe("partial");
    expect(resolveAiGameIdentityProjectionRead({
      knowledgeState: "partial",
      lineOfSight: true,
    })).toBe("partial");
  });

  it("guards projection, category, knowledge, and visibility vocabularies", () => {
    expect(isAiGameIdentityProjectionRead("self")).toBe(true);
    expect(isAiGameIdentityProjectionRead("partial")).toBe(true);
    expect(isAiGameIdentityProjectionRead("full")).toBe(true);
    expect(isAiGameIdentityProjectionRead("unknown")).toBe(false);
    expect(isAiGameIdentityTargetCategory("allied")).toBe(true);
    expect(isAiGameIdentityTargetCategory("neutral")).toBe(true);
    expect(isAiGameIdentityTargetCategory("unknown")).toBe(true);
    expect(isAiGameIdentityTargetCategory("unfriendly")).toBe(true);
    expect(isAiGameIdentityTargetCategory("threat")).toBe(false);
    expect(isAiGameIdentityKnowledgeState("unknown")).toBe(true);
    expect(isAiGameIdentityKnowledgeState("partial")).toBe(true);
    expect(isAiGameIdentityKnowledgeState("full")).toBe(true);
    expect(isAiGameIdentityKnowledgeState("hidden")).toBe(false);
    expect(isAiGameIdentityVisibilityState("visible")).toBe(true);
    expect(isAiGameIdentityVisibilityState("occluded")).toBe(true);
    expect(isAiGameIdentityVisibilityState("withheld")).toBe(false);
  });

  it("creates an immutable full self projection", () => {
    const self = createAiGameIdentitySelfProjection(selfInput);

    expect(self).toMatchObject({
      contractVersion: "1.0",
      entityId: "player-1",
      projectionRead: "self",
    });
    expect(self.fields[0]).toMatchObject({
      label: "Aether balance",
      value: "Stable",
      redacted: false,
    });
    expect(Object.isFrozen(self)).toBe(true);
    expect(Object.isFrozen(self.fields)).toBe(true);
    expect(Object.isFrozen(self.fields[0])).toBe(true);
  });

  it("creates full visible target reads for fully known targets", () => {
    const target = createAiGameIdentityTargetProjection(targetInput);

    expect(target).toMatchObject({
      targetId: "target-1",
      category: "allied",
      visibility: "visible",
      projectionRead: "full",
      lineOfSight: true,
    });
    expect(target.fields[0]).toMatchObject({
      value: "Forward scout",
      redacted: false,
    });
  });

  it("redacts partial knowledge while retaining safe visible target context", () => {
    const target = createAiGameIdentityTargetProjection({
      ...targetInput,
      category: "unknown",
      knowledgeState: "partial",
    });

    expect(target).toMatchObject({
      category: "unknown",
      visibility: "visible",
      projectionRead: "partial",
    });
    expect(target.fields).toEqual([
      {
        contractVersion: "1.0",
        label: "Role",
        value: "Unknown",
        redacted: true,
      },
      {
        contractVersion: "1.0",
        label: "Intent",
        value: "Unknown",
        redacted: true,
      },
    ]);
  });

  it("withholds occluded target fields even when knowledge is otherwise full", () => {
    const target = createAiGameIdentityTargetProjection({
      ...targetInput,
      category: "unfriendly",
      knowledgeState: "full",
      lineOfSight: false,
    });

    expect(target).toMatchObject({
      category: "unfriendly",
      visibility: "occluded",
      projectionRead: "partial",
      lineOfSight: false,
    });
    expect(target.fields[0]).toMatchObject({ value: "Withheld", redacted: true });
    expect(selectAiGameVisibleIdentityTargets([target])).toEqual([]);
  });

  it("builds a projection-only contract and selects visible targets", () => {
    const fullTarget = createAiGameIdentityTargetProjection(targetInput);
    const partialTarget = createAiGameIdentityTargetProjection({
      ...targetInput,
      targetId: "target-2",
      category: "neutral",
      knowledgeState: "partial",
    });
    const occludedTarget = createAiGameIdentityTargetProjection({
      ...targetInput,
      targetId: "target-3",
      lineOfSight: false,
    });
    const contract = createAiGameIdentityProjectionContract({
      self: selfInput,
      targets: [fullTarget, partialTarget, occludedTarget],
    });

    expect(contract).toMatchObject({
      contractVersion: "1.0",
      featureFlagId: AI_GAME_IDENTITY_FEATURE_FLAG_ID,
      authorityOwner: "identity-card",
      authorityMode: "projection-only",
    });
    expect(contract.targets).toHaveLength(3);
    expect(selectAiGameVisibleIdentityTargets(contract.targets).map((target) => target.targetId)).toEqual([
      "target-1",
      "target-2",
    ]);
    expect(Object.isFrozen(contract)).toBe(true);
    expect(Object.isFrozen(contract.targets)).toBe(true);
  });

  it("defaults contracts to no target projections", () => {
    expect(createAiGameIdentityProjectionContract({ self: selfInput }).targets).toEqual([]);
  });

  it("validates versions and malformed projection data", () => {
    expect(() => assertAiGameIdentityProjectionContractVersion("1.0")).not.toThrow();
    expect(() => assertAiGameIdentityProjectionContractVersion("2.0")).toThrow(
      "contractVersion must be 1.0",
    );

    expect(() => createAiGameIdentitySelfProjection({ ...selfInput, entityId: "" })).toThrow(
      "entityId must be a non-empty string",
    );
    expect(() => createAiGameIdentitySelfProjection({ ...selfInput, label: "" })).toThrow(
      "label must be a non-empty string",
    );
    expect(() => createAiGameIdentitySelfProjection({ ...selfInput, summary: "" })).toThrow(
      "summary must be a non-empty string",
    );
    expect(() => createAiGameIdentitySelfProjection({
      ...selfInput,
      fields: [{ label: "", value: "value" }],
    })).toThrow("field.label must be a non-empty string");
    expect(() => createAiGameIdentitySelfProjection({
      ...selfInput,
      fields: [{ label: "label", value: "" }],
    })).toThrow("field.value must be a non-empty string");

    expect(() => createAiGameIdentityTargetProjection({ ...targetInput, targetId: "" })).toThrow(
      "targetId must be a non-empty string",
    );
    expect(() => createAiGameIdentityTargetProjection({ ...targetInput, label: "" })).toThrow(
      "label must be a non-empty string",
    );
    expect(() => createAiGameIdentityTargetProjection({ ...targetInput, summary: "" })).toThrow(
      "summary must be a non-empty string",
    );
    expect(() => createAiGameIdentityTargetProjection({ ...targetInput, combatSummary: "" })).toThrow(
      "combatSummary must be a non-empty string",
    );
    expect(() => createAiGameIdentityTargetProjection({
      ...targetInput,
      category: "threat" as "allied",
    })).toThrow("category must be a supported identity target category");
    expect(() => createAiGameIdentityTargetProjection({
      ...targetInput,
      knowledgeState: "hidden" as "full",
    })).toThrow("knowledgeState must be a supported identity knowledge state");
  });
});
