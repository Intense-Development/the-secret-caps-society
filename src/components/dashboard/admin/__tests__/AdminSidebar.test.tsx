import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "../AdminSidebar";
import { usePathname } from "@/i18n/routing-config";

// Mock i18n routing
jest.mock("@/i18n/routing-config", () => ({
  usePathname: jest.fn(),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.sidebar.dashboard": "Dashboard",
      "admin.sidebar.stores": "Stores",
      "admin.sidebar.products": "Products",
      "admin.sidebar.orders": "Orders",
      "admin.sidebar.users": "Users",
      "admin.sidebar.analytics": "Analytics",
      "admin.sidebar.payments": "Payments",
      "admin.sidebar.settings": "Settings",
    };
    return translations[key] || key;
  }),
}));

// Mock sidebar components
jest.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <aside role="complementary">{children}</aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({
    children,
    isActive,
    asChild,
  }: {
    children: React.ReactNode;
    isActive?: boolean;
    asChild?: boolean;
  }) => (
    <button
      data-active={isActive}
      className={isActive ? "bg-accent" : ""}
      data-testid={`menu-button-${isActive ? "active" : "inactive"}`}
    >
      {children}
    </button>
  ),
}));

describe("AdminSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all menu items", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<AdminSidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Stores")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("highlights active route", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/admin/stores");
    render(<AdminSidebar />);

    const activeButtons = screen.getAllByTestId("menu-button-active");
    expect(activeButtons.length).toBeGreaterThan(0);
  });

  it("renders sidebar content", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<AdminSidebar />);

    expect(screen.getByTestId("sidebar-content")).toBeInTheDocument();
  });

  it("renders links with correct hrefs", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<AdminSidebar />);

    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(screen.getByText("Stores").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/stores"
    );
  });
});

