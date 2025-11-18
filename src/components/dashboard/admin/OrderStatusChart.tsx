"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export type OrderStatusData = {
  status: string;
  count: number;
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Shipped: "#8b5cf6",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
  Refunded: "#6b7280",
};

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
  label,
  payload,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  return (
    <div style={tooltipContent}>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        <span
          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        {data.name}:{" "}
        <span className="font-medium text-foreground">
          {typeof data.value === "number"
            ? Intl.NumberFormat("en-US").format(data.value)
            : data.value}
        </span>
      </p>
    </div>
  );
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

/**
 * Order Status Chart Component
 * Displays order distribution by status as a bar chart
 */
export function OrderStatusChart({ data }: OrderStatusChartProps) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="status" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip content={<DefaultTooltip />} />
          <Legend />
          <Bar dataKey="count" name="Orders" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] || "#6366f1"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

