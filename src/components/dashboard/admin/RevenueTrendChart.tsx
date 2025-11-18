"use client";

import {
  Area,
  AreaChart,
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

export type RevenueTrendData = {
  month: string;
  revenue: number;
  target?: number;
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

  return (
    <div style={tooltipContent}>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <ul className="mt-2 space-y-1">
        {payload.map((entry) => (
          <li
            key={entry.dataKey?.toString()}
            className="flex items-center text-sm text-muted-foreground"
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-2">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {typeof entry.value === "number"
                ? Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(entry.value)
                : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
}

/**
 * Revenue Trend Chart Component
 * Displays platform revenue over time with optional target line
 */
export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis
            tickFormatter={(value) =>
              Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(value)
            }
            stroke="var(--muted-foreground)"
          />
          <Tooltip content={<DefaultTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            fill="url(#adminRevenueGradient)"
            strokeWidth={2}
            name="Revenue"
          />
          {data.some((d) => d.target !== undefined) && (
            <Area
              type="monotone"
              dataKey="target"
              stroke="#22d3ee"
              fill="rgba(34, 211, 238, 0.12)"
              strokeDasharray="4 4"
              name="Target"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

