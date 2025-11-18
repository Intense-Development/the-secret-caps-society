import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { RevenueTrendChart } from "../RevenueTrendChart";

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-items={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("RevenueTrendChart", () => {
  const mockData = [
    { month: "Jan", revenue: 10000, target: 12000 },
    { month: "Feb", revenue: 15000, target: 14000 },
    { month: "Mar", revenue: 18000, target: 16000 },
  ];

  it("renders the chart with data", () => {
    render(<RevenueTrendChart data={mockData} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toHaveAttribute("data-items", "3");
  });

  it("renders revenue and target areas", () => {
    render(<RevenueTrendChart data={mockData} />);

    expect(screen.getByTestId("area-revenue")).toBeInTheDocument();
    expect(screen.getByTestId("area-target")).toBeInTheDocument();
  });

  it("renders chart elements", () => {
    render(<RevenueTrendChart data={mockData} />);

    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("handles empty data array", () => {
    render(<RevenueTrendChart data={[]} />);

    expect(screen.getByTestId("area-chart")).toHaveAttribute("data-items", "0");
  });

  it("renders with correct month data key", () => {
    render(<RevenueTrendChart data={mockData} />);

    const xAxis = screen.getByTestId("x-axis");
    expect(xAxis).toHaveAttribute("data-key", "month");
  });
});

