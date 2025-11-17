import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type SummaryCard = {
  id: string;
  title: string;
  value: string;
  changeLabel: string;
  trend: "up" | "down";
  helperText?: string;
};

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const TrendIcon = card.trend === "up" ? ArrowUpRight : ArrowDownRight;
        const trendColor =
          card.trend === "up" ? "text-emerald-500" : "text-destructive";

        return (
          <Card key={card.id} className="border-border/40 shadow-sm">
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {card.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div
                className={`inline-flex items-center text-sm font-medium ${trendColor}`}
              >
                <TrendIcon className="mr-1 h-4 w-4" />
                {card.changeLabel}
              </div>
              {card.helperText ? (
                <p className="text-xs text-muted-foreground text-right">
                  {card.helperText}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

