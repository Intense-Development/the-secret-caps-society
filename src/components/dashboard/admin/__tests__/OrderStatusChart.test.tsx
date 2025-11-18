import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { OrderStatusChart } from "../OrderStatusChart";

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-items={data.length}>
      {children}
    </div>
  ),
  Bar: ({ children, dataKey, name }: { children?: React.ReactNode; dataKey: string; name: string }) => (
    <div data-testid={`bar-${dataKey}`} data-name={name}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("OrderStatusChart", () => {
  const mockData = [
    { status: "Pending", count: 25 },
    { status: "Processing", count: 40 },
    { status: "Shipped", count: 60 },
    { status: "Delivered", count: 120 },
    { status: "Cancelled", count: 5 },
  ];

  it("renders the chart with data", () => {
    render(<OrderStatusChart data={mockData} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-items", "5");
  });

  it("renders the count bar", () => {
    render(<OrderStatusChart data={mockData} />);

    expect(screen.getByTestId("bar-count")).toBeInTheDocument();
  });

  it("renders chart elements", () => {
    render(<OrderStatusChart data={mockData} />);

    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("handles empty data array", () => {
    render(<OrderStatusChart data={[]} />);

    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-items", "0");
  });

  it("renders with correct status data key", () => {
    render(<OrderStatusChart data={mockData} />);

    const xAxis = screen.getByTestId("x-axis");
    expect(xAxis).toHaveAttribute("data-key", "status");
  });
});

