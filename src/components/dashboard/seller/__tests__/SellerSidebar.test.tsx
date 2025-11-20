import { describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { SellerSidebar } from "../SellerSidebar";
import { usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "seller.sidebar.dashboard": "Dashboard",
      "seller.sidebar.products": "Products",
      "seller.sidebar.orders": "Orders",
      "seller.sidebar.revenue": "Revenue",
      "seller.sidebar.shipping": "Shipping",
      "seller.sidebar.team": "Team",
      "seller.sidebar.settings": "Settings",
    };
    return translations[key] || key;
  },
}));

describe("SellerSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all navigation links", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/seller");
    
    render(<SellerSidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should highlight active route", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/seller/products");
    
    const { container } = render(<SellerSidebar />);
    
    // Find the active link (should have active styling)
    const productsLink = screen.getByText("Products").closest("a");
    expect(productsLink).toHaveAttribute("aria-current", "page");
  });

  it("should highlight dashboard when on dashboard route", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/seller");
    
    render(<SellerSidebar />);
    
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("should highlight orders when on orders route", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/seller/orders");
    
    render(<SellerSidebar />);
    
    const ordersLink = screen.getByText("Orders").closest("a");
    expect(ordersLink).toHaveAttribute("aria-current", "page");
  });
});

