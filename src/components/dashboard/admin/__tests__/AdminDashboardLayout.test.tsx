import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { AdminDashboardLayout } from "../AdminDashboardLayout";

// Mock sidebar components
jest.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

// Mock AdminSidebar and AdminHeader
jest.mock("../AdminSidebar", () => ({
  AdminSidebar: () => <aside data-testid="admin-sidebar">Sidebar</aside>,
}));

jest.mock("../AdminHeader", () => ({
  AdminHeader: () => <header data-testid="admin-header">Header</header>,
}));

describe("AdminDashboardLayout", () => {
  it("renders sidebar, header, and children", () => {
    render(
      <AdminDashboardLayout>
        <div>Test Content</div>
      </AdminDashboardLayout>
    );

    expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument();
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders main content area", () => {
    render(
      <AdminDashboardLayout>
        <div>Main Content</div>
      </AdminDashboardLayout>
    );

    const main = screen.getByText("Main Content").closest("main");
    expect(main).toBeInTheDocument();
  });
});

