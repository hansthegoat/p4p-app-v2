interface PageLoaderProps {
  text?: string;
}

/**
 * The standard loading state used across the app.
 * Blue rotating circle + text — matches My Calculation / Appraisals style.
 */
export function PageLoader({ text = "Loading…" }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}