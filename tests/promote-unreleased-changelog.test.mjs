import { describe, expect, it } from "vitest";

import { promoteUnreleasedChangelog } from "../scripts/promote-unreleased-changelog.mjs";

describe("promoteUnreleasedChangelog", () => {
  it("promotes keep-a-changelog unreleased content into a versioned section", () => {
    const input = `# Changelog

## [Unreleased]

- **Changed**
  - preserve release metadata

- **Fixed**
  - fix publish gating
`;

    const output = promoteUnreleasedChangelog(input, {
      nextVersion: "0.1.6",
      date: "2026-06-13",
      repository: "example/ai-game",
    });

    expect(output).toContain("## [Unreleased]");
    expect(output).toContain("## [0.1.6] - 2026-06-13");
    expect(output).toContain("- **Changed**");
    expect(output).toContain("  - preserve release metadata");
  });

  it("preserves later version sections and updates footer links when present", () => {
    const input = `# Changelog

## [Unreleased]

- **Changed**
  - preserve release metadata

## [0.1.5] - 2026-06-13

- previous release

[Unreleased]: https://github.com/example/ai-game/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/example/ai-game/releases/tag/v0.1.5
`;

    const output = promoteUnreleasedChangelog(input, {
      nextVersion: "0.1.6",
      date: "2026-06-14",
      repository: "example/ai-game",
    });

    expect(output).toContain("## [0.1.6] - 2026-06-14");
    expect(output).toContain("## [0.1.5] - 2026-06-13");
    expect(output).toContain(
      "[Unreleased]: https://github.com/example/ai-game/compare/v0.1.6...HEAD",
    );
    expect(output).toContain(
      "[0.1.6]: https://github.com/example/ai-game/releases/tag/v0.1.6",
    );
  });

  it("leaves the changelog untouched when the target version already exists", () => {
    const input = `# Changelog

## [Unreleased]

- **Changed**
  - preserve release metadata

## [0.1.6] - 2026-06-14
`;

    expect(
      promoteUnreleasedChangelog(input, {
        nextVersion: "0.1.6",
        date: "2026-06-14",
        repository: "example/ai-game",
      }),
    ).toBe(input);
  });
});
