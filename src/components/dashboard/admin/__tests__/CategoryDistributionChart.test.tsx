import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { CategoryDistributionChart } from "../CategoryDistributionChart";

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="pie" data-items={data.length}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe("CategoryDistributionChart", () => {
  const mockData = [
    { name: "Baseball Caps", value: 45 },
    { name: "Snapbacks", value: 30 },
    { name: "Beanies", value: 15 },
    { name: "Bucket Hats", value: 10 },
  ];

  it("renders the chart with data", () => {
    render(<CategoryDistributionChart data={mockData} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toHaveAttribute("data-items", "4");
  });

  it("renders cells for each data point", () => {
    render(<CategoryDistributionChart data={mockData} />);

    const cells = screen.getAllByTestId("cell");
    expect(cells).toHaveLength(4);
  });

  it("renders chart elements", () => {
    render(<CategoryDistributionChart data={mockData} />);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("handles empty data array", () => {
    render(<CategoryDistributionChart data={[]} />);

    expect(screen.getByTestId("pie")).toHaveAttribute("data-items", "0");
    expect(screen.queryAllByTestId("cell")).toHaveLength(0);
  });

  it("applies colors to cells", () => {
    render(<CategoryDistributionChart data={mockData} />);

    const cells = screen.getAllByTestId("cell");
    expect(cells[0]).toHaveAttribute("data-fill");
  });
});

