"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export type CategoryDistributionData = {
  name: string;
  value: number;
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#8b5cf6",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

const tooltipContent = {
  backgroundColor: "var(--background)",
  color: "var(--foreground)",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  boxShadow: "0 10px 25px -15px rgba(15, 23, 42, 0.35)",
  padding: "12px 14px",
};

function DefaultTooltip({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const percentage =
    data.payload && "percent" in data.payload
      ? ((data.payload.percent as number) * 100).toFixed(1)
      : "0";

  return (
    <div style={tooltipContent}>
      <p className="text-sm font-semibold text-foreground">{data.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {typeof data.value === "number"
          ? Intl.NumberFormat("en-US").format(data.value)
          : data.value}{" "}
        products ({percentage}%)
      </p>
    </div>
  );
}

interface CategoryDistributionChartProps {
  data: CategoryDistributionData[];
}

/**
 * Category Distribution Chart Component
 * Displays product distribution across categories as a donut chart
 */
export function CategoryDistributionChart({
  data,
}: CategoryDistributionChartProps) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<DefaultTooltip />} />
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={6}
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

