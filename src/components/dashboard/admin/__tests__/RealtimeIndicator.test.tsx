import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { RealtimeIndicator } from "../RealtimeIndicator";

// Mock useAdminRealtime
jest.mock("@/hooks/useAdminRealtime", () => ({
  useAdminRealtime: jest.fn(),
}));

import { useAdminRealtime } from "@/hooks/useAdminRealtime";

describe("RealtimeIndicator", () => {
  it("displays connected status", () => {
    (useAdminRealtime as jest.Mock).mockReturnValue({ isConnected: true });

    render(<RealtimeIndicator />);

    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  it("displays disconnected status", () => {
    (useAdminRealtime as jest.Mock).mockReturnValue({ isConnected: false });

    render(<RealtimeIndicator />);

    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  it("renders with correct styling for connected state", () => {
    (useAdminRealtime as jest.Mock).mockReturnValue({ isConnected: true });

    const { container } = render(<RealtimeIndicator />);
    const indicator = container.querySelector('[data-status="connected"]');

    expect(indicator).toBeInTheDocument();
  });

  it("renders with correct styling for disconnected state", () => {
    (useAdminRealtime as jest.Mock).mockReturnValue({ isConnected: false });

    const { container } = render(<RealtimeIndicator />);
    const indicator = container.querySelector('[data-status="disconnected"]');

    expect(indicator).toBeInTheDocument();
  });
});

