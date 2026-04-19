import { describe, expect, it } from "vitest";

import { loadDemoSermon } from "./index";

describe("demo seed", () => {
  it("parses seed sermon JSON", () => {
    const doc = loadDemoSermon();
    expect(doc.title).toBe("Hope in Crisis");
    expect(doc.blocks.length).toBeGreaterThan(0);
  });
});
