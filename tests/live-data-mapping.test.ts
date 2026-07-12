import { describe, expect, it } from "vitest";

import { mapAlertSeverity, mapAlertStatus, mapFreshness, toRiskLevel } from "@/lib/operations/live-data";

describe("live data mapping", () => {
  it("maps backend alert values to the UI contract", () => {
    expect(mapAlertSeverity("moderate")).toBe("MEDIUM");
    expect(mapAlertStatus("open")).toBe("active");
    expect(mapFreshness("healthy")).toBe("fresh");
  });

  it("maps forecast risk bands without synthetic defaults", () => {
    expect(toRiskLevel("critical")).toBe("high");
    expect(toRiskLevel("moderate")).toBe("medium");
    expect(toRiskLevel(undefined)).toBe("low");
  });
});
