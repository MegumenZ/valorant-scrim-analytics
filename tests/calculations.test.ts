import { describe, it, expect } from "vitest";
import {
  calculateKD,
  calculateMatchResult,
} from "@/lib/utils/analytics";

describe("Analytics Math Calculations", () => {
  describe("calculateKD", () => {
    it("should calculate standard K/D ratio correctly", () => {
      expect(calculateKD(20, 10)).toBe(2.0);
      expect(calculateKD(15, 12)).toBe(1.25);
    });

    it("should guard against division by zero when deaths is 0", () => {
      expect(calculateKD(15, 0)).toBe(15.0);
      expect(calculateKD(0, 0)).toBe(0.0);
    });
  });

  describe("calculateMatchResult", () => {
    it("should return WIN when team score is greater", () => {
      expect(calculateMatchResult(13, 9)).toBe("WIN");
      expect(calculateMatchResult(15, 13)).toBe("WIN");
    });

    it("should return LOSS when opponent score is greater", () => {
      expect(calculateMatchResult(8, 13)).toBe("LOSS");
      expect(calculateMatchResult(12, 14)).toBe("LOSS");
    });

    it("should return DRAW when scores are equal", () => {
      expect(calculateMatchResult(12, 12)).toBe("DRAW");
    });
  });
});
