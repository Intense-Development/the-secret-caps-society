"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
 Legend,
  Pie,
  PieChart,
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

type RevenueDatum = {
  month: string;
  revenue: number;
  target: number;
};

type CategoryDatum = {
  name: string;
  value: number;
};

type InventoryDatum = {
  name: string;
  current: number;
  minimum: number;
  optimal: number;
};

type TrafficDatum = {
  name: string;
  value: number;
};

const CATEGORY_COLORS = ["#6366f1", "#22d3ee", "#8b5cf6", "#f97316", "#f59e0b"];
const TRAFFIC_COLORS = ["#0ea5e9", "#6366f1", "#22c55e", "#f97316", "#14b8a6"];

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

export function RevenueTrendChart({ data }: { data: RevenueDatum[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#revenueGradient)"
            strokeWidth={2}
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#22d3ee"
            fill="rgba(34, 211, 238, 0.12)"
            strokeDasharray="4 4"
            name="Target"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDistributionChart({
  data,
}: {
  data: CategoryDatum[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={6}
            dataKey="value"
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

export function InventoryHealthChart({
  data,
}: {
  data: InventoryDatum[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="current"
            name="Current stock"
            fill="rgba(99, 102, 241, 0.9)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="optimal"
            name="Optimal"
            fill="rgba(34, 197, 94, 0.65)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="minimum"
            name="Minimum"
            fill="rgba(239, 68, 68, 0.65)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficSourcesChart({ data }: { data: TrafficDatum[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Share (%)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

