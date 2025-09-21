"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HelloCard({ name = "World" }: { name?: string }) {
  const [count, setCount] = useState(0);
  return (
    <Card className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Hello, {name}!</h2>
        <p className="text-sm text-muted-foreground">Responsive by default with Tailwind and shadcn/ui.</p>
      </div>
      <Button onClick={() => setCount((c) => c + 1)} aria-label="increment">
        Clicked {count} times
      </Button>
    </Card>
  );
}
