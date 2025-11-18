"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Store, ShoppingCart, UserPlus, Activity } from "lucide-react";

export type ActivityType = "store_created" | "order_placed" | "user_registered" | "other";

export type RecentActivity = {
  id: string;
  type: ActivityType;
  description: string;
  user: string;
  timestamp: Date;
};

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  store_created: Store,
  order_placed: ShoppingCart,
  user_registered: UserPlus,
  other: Activity,
};

const activityColors: Record<ActivityType, string> = {
  store_created: "text-blue-500",
  order_placed: "text-green-500",
  user_registered: "text-purple-500",
  other: "text-gray-500",
};

interface RecentActivityListProps {
  activities: RecentActivity[];
}

/**
 * Recent Activity List Component
 * Displays recent platform activities in a timeline format
 */
export function RecentActivityList({ activities }: RecentActivityListProps) {
  const t = useTranslations("admin.dashboard");

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
          <CardDescription>{t("recentActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("noRecentActivity")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
          <CardDescription>{t("recentActivityDesc")}</CardDescription>
        </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || Activity;
            const iconColor = activityColors[activity.type] || "text-gray-500";

            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`mt-1 ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

