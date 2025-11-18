import { describe, expect, it } from "@jest/globals";
import { getAdminDashboardData } from "../getAdminDashboardData";

describe("getAdminDashboardData", () => {
  it("returns admin dashboard data with summary cards", async () => {
    const data = await getAdminDashboardData();

    expect(data).toBeDefined();
    expect(data.summaryCards).toBeDefined();
    expect(Array.isArray(data.summaryCards)).toBe(true);
    expect(data.summaryCards.length).toBe(4);
  });

  it("returns correct summary card structure", async () => {
    const data = await getAdminDashboardData();

    data.summaryCards.forEach((card) => {
      expect(card).toHaveProperty("id");
      expect(card).toHaveProperty("title");
      expect(card).toHaveProperty("value");
      expect(card).toHaveProperty("changeLabel");
      expect(card).toHaveProperty("trend");
      expect(["up", "down"]).toContain(card.trend);
    });
  });

  it("includes all required summary cards", async () => {
    const data = await getAdminDashboardData();

    const cardIds = data.summaryCards.map((card) => card.id);
    expect(cardIds).toContain("total-revenue");
    expect(cardIds).toContain("active-stores");
    expect(cardIds).toContain("pending-approvals");
    expect(cardIds).toContain("total-users");
  });
});

