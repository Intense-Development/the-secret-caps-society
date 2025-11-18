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

  it("returns revenue trend data", async () => {
    const data = await getAdminDashboardData();

    expect(data.revenueTrend).toBeDefined();
    expect(Array.isArray(data.revenueTrend)).toBe(true);
    expect(data.revenueTrend.length).toBeGreaterThan(0);

    const firstTrend = data.revenueTrend[0];
    expect(firstTrend).toHaveProperty("month");
    expect(firstTrend).toHaveProperty("revenue");
  });

  it("returns category distribution data", async () => {
    const data = await getAdminDashboardData();

    expect(data.categoryDistribution).toBeDefined();
    expect(Array.isArray(data.categoryDistribution)).toBe(true);
    expect(data.categoryDistribution.length).toBeGreaterThan(0);

    const firstCategory = data.categoryDistribution[0];
    expect(firstCategory).toHaveProperty("name");
    expect(firstCategory).toHaveProperty("value");
  });

  it("returns order status data", async () => {
    const data = await getAdminDashboardData();

    expect(data.orderStatus).toBeDefined();
    expect(Array.isArray(data.orderStatus)).toBe(true);
    expect(data.orderStatus.length).toBeGreaterThan(0);

    const firstStatus = data.orderStatus[0];
    expect(firstStatus).toHaveProperty("status");
    expect(firstStatus).toHaveProperty("count");
  });

  it("returns store locations data", async () => {
    const data = await getAdminDashboardData();

    expect(data.storeLocations).toBeDefined();
    expect(Array.isArray(data.storeLocations)).toBe(true);
    expect(data.storeLocations.length).toBeGreaterThan(0);

    const firstStore = data.storeLocations[0];
    expect(firstStore).toHaveProperty("id");
    expect(firstStore).toHaveProperty("name");
    expect(firstStore).toHaveProperty("lat");
    expect(firstStore).toHaveProperty("lng");
  });

  it("returns pending stores data", async () => {
    const data = await getAdminDashboardData();

    expect(data.pendingStores).toBeDefined();
    expect(Array.isArray(data.pendingStores)).toBe(true);
    expect(data.pendingStores.length).toBeGreaterThan(0);

    const firstPending = data.pendingStores[0];
    expect(firstPending).toHaveProperty("id");
    expect(firstPending).toHaveProperty("name");
    expect(firstPending).toHaveProperty("owner");
    expect(firstPending).toHaveProperty("submittedAt");
    expect(firstPending).toHaveProperty("category");
  });

  it("returns recent activities data", async () => {
    const data = await getAdminDashboardData();

    expect(data.recentActivities).toBeDefined();
    expect(Array.isArray(data.recentActivities)).toBe(true);
    expect(data.recentActivities.length).toBeGreaterThan(0);

    const firstActivity = data.recentActivities[0];
    expect(firstActivity).toHaveProperty("id");
    expect(firstActivity).toHaveProperty("type");
    expect(firstActivity).toHaveProperty("description");
    expect(firstActivity).toHaveProperty("user");
    expect(firstActivity).toHaveProperty("timestamp");
  });

  it("returns top stores data", async () => {
    const data = await getAdminDashboardData();

    expect(data.topStores).toBeDefined();
    expect(Array.isArray(data.topStores)).toBe(true);
    expect(data.topStores.length).toBeGreaterThan(0);

    const firstTopStore = data.topStores[0];
    expect(firstTopStore).toHaveProperty("id");
    expect(firstTopStore).toHaveProperty("name");
    expect(firstTopStore).toHaveProperty("revenue");
    expect(firstTopStore).toHaveProperty("orders");
    expect(firstTopStore).toHaveProperty("growth");
  });
});

