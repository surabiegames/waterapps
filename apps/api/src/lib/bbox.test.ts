import { describe, expect, it } from "vitest";

import { clampLimit, parseBBox } from "./bbox.js";

describe("parseBBox", () => {
  it("parses comma-separated bbox", () => {
    expect(parseBBox("107.53,-7.04,107.71,-6.82")).toEqual([107.53, -7.04, 107.71, -6.82]);
  });

  it("parses whitespace-separated bbox", () => {
    expect(parseBBox("107.53 -7.04 107.71 -6.82")).toEqual([107.53, -7.04, 107.71, -6.82]);
  });

  it("returns null for empty or invalid", () => {
    expect(parseBBox(undefined)).toBeNull();
    expect(parseBBox("")).toBeNull();
    expect(parseBBox("1,2,3")).toBeNull();
    expect(parseBBox("a,b,c,d")).toBeNull();
    expect(parseBBox("200,0,0,0")).toBeNull();
  });
});

describe("clampLimit", () => {
  it("uses fallback and caps", () => {
    expect(clampLimit(undefined, 5000, 20000)).toBe(5000);
    expect(clampLimit("100", 1, 20000)).toBe(100);
    expect(clampLimit("999999", 1, 20000)).toBe(20000);
    expect(clampLimit("0", 5, 10)).toBe(1);
  });
});
