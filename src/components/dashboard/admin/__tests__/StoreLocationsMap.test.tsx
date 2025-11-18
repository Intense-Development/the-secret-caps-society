import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { StoreLocationsMap } from "../StoreLocationsMap";

// Mock react-simple-maps
jest.mock("react-simple-maps", () => ({
  ComposableMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composable-map">{children}</div>
  ),
  Geographies: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="geographies">{children}</div>
  ),
  Geography: () => <div data-testid="geography" />,
  Marker: ({ coordinates, children }: { coordinates: [number, number]; children?: React.ReactNode }) => (
    <div
      data-testid="marker"
      data-lat={coordinates[1]}
      data-lng={coordinates[0]}
    >
      {children}
    </div>
  ),
  ZoomableGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="zoomable-group">{children}</div>
  ),
}));

describe("StoreLocationsMap", () => {
  const mockData = [
    { id: "1", name: "Store 1", lat: 40.7128, lng: -74.006 },
    { id: "2", name: "Store 2", lat: 34.0522, lng: -118.2437 },
    { id: "3", name: "Store 3", lat: 51.5074, lng: -0.1278 },
  ];

  it("renders the map", () => {
    render(<StoreLocationsMap stores={mockData} />);

    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
  });

  it("renders geographies", () => {
    render(<StoreLocationsMap stores={mockData} />);

    expect(screen.getByTestId("geographies")).toBeInTheDocument();
  });

  it("renders markers for each store", () => {
    render(<StoreLocationsMap stores={mockData} />);

    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(3);
  });

  it("renders markers with correct coordinates", () => {
    render(<StoreLocationsMap stores={mockData} />);

    const markers = screen.getAllByTestId("marker");
    expect(markers[0]).toHaveAttribute("data-lat", "40.7128");
    expect(markers[0]).toHaveAttribute("data-lng", "-74.006");
  });

  it("handles empty stores array", () => {
    render(<StoreLocationsMap stores={[]} />);

    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
    expect(screen.queryAllByTestId("marker")).toHaveLength(0);
  });
});

