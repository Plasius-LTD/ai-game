import {
  createAiGameApprenticeshipHandoff,
  createAiGameApprenticeshipReadiness,
  createAiGameApprenticeshipSponsorship,
  createAiGameApprenticeshipSupervision,
} from "../src/apprenticeship-handoffs.js";

const baseSponsorship = {
  sponsorshipId: "sponsorship-1",
  apprenticeSubjectId: "subject-apprentice-1",
  sponsorSubjectId: "subject-sponsor-1",
  institutionId: "guild-workshop-1",
  disciplineCode: "item-crafting.fundamentals",
  status: "active" as const,
  issuedAtIso: "2026-07-11T00:00:00.000Z",
  expiresAtIso: null,
  scopeCodes: ["tool-familiarity", "supervised-repetition"],
  reasonCodes: ["mission-sponsorship"],
};

const baseReadiness = {
  readinessId: "readiness-1",
  sponsorshipId: baseSponsorship.sponsorshipId,
  disciplineCode: baseSponsorship.disciplineCode,
  state: "ready" as const,
  requiredTrustLevel: "trusted" as const,
  requiredTrack: "hybrid" as const,
  supervisionRequired: true,
  unmetPrerequisiteCodes: [],
  evaluatedAtIso: "2026-07-11T00:00:00.000Z",
  reasonCodes: ["supervisor-confirmed"],
};

describe("apprenticeship handoff contracts", () => {
  it("creates immutable sponsorship, supervision, and readiness records", () => {
    const sponsorship = createAiGameApprenticeshipSponsorship(baseSponsorship);
    const supervision = createAiGameApprenticeshipSupervision({
      supervisionId: "supervision-1",
      sponsorshipId: sponsorship.sponsorshipId,
      supervisorSubjectId: "subject-supervisor-1",
      mode: "milestone",
      checkpointCodes: ["first-safe-tool-use"],
      startedAtIso: "2026-07-11T00:01:00.000Z",
      endsAtIso: null,
      reasonCodes: ["active-sponsorship"],
    });
    const readiness = createAiGameApprenticeshipReadiness(baseReadiness);

    expect(sponsorship.featureFlagId).toBe(
      "isekai.training.apprenticeship.enabled",
    );
    expect(supervision.sponsorshipId).toBe(sponsorship.sponsorshipId);
    expect(readiness.state).toBe("ready");
    expect(Object.isFrozen(sponsorship.scopeCodes)).toBe(true);
    expect(Object.isFrozen(supervision.checkpointCodes)).toBe(true);
    expect(Object.isFrozen(readiness)).toBe(true);
  });

  it("rejects a ready record that still has unmet prerequisites", () => {
    expect(() => createAiGameApprenticeshipReadiness({
      ...baseReadiness,
      unmetPrerequisiteCodes: ["supervisor-approval"],
    })).toThrow("ready apprenticeship state cannot have unmet prerequisites");
  });

  it("emits distinct request-only handoffs to each authoritative system", () => {
    const common = {
      handoffId: "handoff-1",
      requestId: "request-1",
      apprenticeshipId: "apprenticeship-1",
      sponsorshipId: "sponsorship-1",
      supervisionId: "supervision-1",
      readinessId: "readiness-1",
      readinessState: "ready",
      apprenticeSubjectId: "subject-apprentice-1",
      disciplineCode: "apprenticeship.cross-system",
      intent: "practice" as const,
      requestedAtIso: "2026-07-11T00:02:00.000Z",
      reasonCodes: ["ready-for-supervised-practice"],
    };

    const spellcraft = createAiGameApprenticeshipHandoff({
      ...common,
      kind: "spellcraft",
      requestedTrack: "externalized",
      recommendationId: "spell-recommendation-1",
    });
    const itemCrafting = createAiGameApprenticeshipHandoff({
      ...common,
      kind: "item-crafting",
      recipeFamilyCode: "tool-basic",
    });
    const dungeonCrafting = createAiGameApprenticeshipHandoff({
      ...common,
      kind: "dungeon-crafting",
      blueprintFamilyCode: "sealed-training-room",
      sealingObjectiveCode: "contain-chaos-hotspot",
    });

    expect(spellcraft.targetSystem).toBe("spellcraft-system");
    expect(itemCrafting.targetSystem).toBe("item-crafting-system");
    expect(dungeonCrafting.targetSystem).toBe("dungeon-crafting-system");
    expect(spellcraft.commitment).toBe("request-only");
    expect(spellcraft.guidanceOwner).toBe("player-system");
    expect(Object.isFrozen(dungeonCrafting)).toBe(true);
  });

  it("rejects malformed identifiers, timestamps, and target-specific values", () => {
    expect(() => createAiGameApprenticeshipSponsorship({
      ...baseSponsorship,
      apprenticeSubjectId: " ",
    })).toThrow("apprenticeSubjectId must be a non-empty string");

    expect(() => createAiGameApprenticeshipSupervision({
      supervisionId: "supervision-1",
      sponsorshipId: "sponsorship-1",
      supervisorSubjectId: "subject-supervisor-1",
      mode: "direct",
      checkpointCodes: [],
      startedAtIso: "not-a-timestamp",
      endsAtIso: null,
      reasonCodes: [],
    })).toThrow("startedAtIso must be an ISO-8601 timestamp");

    expect(() => createAiGameApprenticeshipHandoff({
      handoffId: "handoff-1",
      requestId: "request-1",
      apprenticeshipId: "apprenticeship-1",
      sponsorshipId: "sponsorship-1",
      supervisionId: "supervision-1",
      readinessId: "readiness-1",
      readinessState: "ready",
      apprenticeSubjectId: "subject-apprentice-1",
      disciplineCode: "spellcraft",
      intent: "practice",
      requestedAtIso: "2026-07-11T00:02:00.000Z",
      reasonCodes: [],
      kind: "spellcraft",
      requestedTrack: "externalized",
      recommendationId: " ",
    })).toThrow("recommendationId must be a non-empty string");
  });
});
