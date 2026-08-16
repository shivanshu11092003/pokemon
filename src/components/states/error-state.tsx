"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/api/errors";

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { title, detail } = describeError(error);

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-20 text-center ${className ?? ""}`}
    >
      <div className="mb-5 grid size-14 place-items-center rounded-full bg-brand/10 text-brand-accent">
        <TriangleAlert className="size-6" />
      </div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">{detail}</p>
      <Button variant="primary" size="md" className="mt-7" onClick={onRetry}>
        <RotateCw />
        Try again
      </Button>
    </div>
  );
}
