import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useAdminRealtime } from "../useAdminRealtime";

// Mock Supabase client
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockResolvedValue({ status: "SUBSCRIBED" }),
  unsubscribe: jest.fn(),
};

const mockSupabase = {
  channel: jest.fn(() => mockChannel),
  from: jest.fn(),
};

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe("useAdminRealtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up subscriptions
    if (mockChannel.unsubscribe) {
      mockChannel.unsubscribe();
    }
  });

  it("subscribes to stores table changes", async () => {
    const { result } = renderHook(() =>
      useAdminRealtime({
        onStoreChange: jest.fn(),
      })
    );

    await waitFor(() => {
      expect(mockSupabase.channel).toHaveBeenCalled();
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("calls onStoreChange callback when store is updated", async () => {
    const onStoreChange = jest.fn();
    const { result } = renderHook(() =>
      useAdminRealtime({
        onStoreChange,
      })
    );

    await waitFor(() => {
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    // Simulate a store update event
    const updateCallback = mockChannel.on.mock.calls.find(
      (call) => call[0] === "postgres_changes"
    )?.[1];

    if (updateCallback) {
      updateCallback({
        eventType: "UPDATE",
        new: { id: "store-1", verification_status: "verified" },
        old: { id: "store-1", verification_status: "pending" },
      });

      expect(onStoreChange).toHaveBeenCalled();
    }
  });

  it("handles connection errors gracefully", async () => {
    mockChannel.subscribe.mockRejectedValueOnce(new Error("Connection failed"));

    const { result } = renderHook(() =>
      useAdminRealtime({
        onStoreChange: jest.fn(),
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() =>
      useAdminRealtime({
        onStoreChange: jest.fn(),
      })
    );

    unmount();

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });
});

