import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface Props {
  open: boolean;
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({ open, secondsLeft, onStay, onLogout }: Props) {
  if (!open) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const label = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-lg shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-base font-semibold mb-1">Session expiring</h2>
        <p className="text-[13px] text-muted-foreground mb-4">
          You've been inactive. Signing out in{" "}
          <span className="font-semibold text-foreground tabular-nums">{label}</span>.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onLogout} className="flex-1">
            Sign out now
          </Button>
          <Button
            size="sm"
            onClick={onStay}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          >
            Stay signed in
          </Button>
        </div>
      </div>
    </div>
  );
}
