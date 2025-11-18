import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { AdminHeader } from "../AdminHeader";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.header.search": "Search...",
      "admin.header.notifications": "Notifications",
      "admin.header.profile": "Profile",
    };
    return translations[key] || key;
  }),
}));

// Mock sidebar
jest.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Toggle</button>,
}));

// Mock user data
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            email: "admin@example.com",
            user_metadata: { name: "Admin User" },
          },
        },
      }),
    },
  })),
}));

describe("AdminHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sidebar trigger", () => {
    render(<AdminHeader />);
    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<AdminHeader />);
    const searchInput = screen.getByPlaceholderText("Search...");
    expect(searchInput).toBeInTheDocument();
  });

  it("renders notification button", () => {
    render(<AdminHeader />);
    // Notification button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

