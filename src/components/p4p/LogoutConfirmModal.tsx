import { LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ open, onClose, onConfirm }: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm px-4"
          >
            <Card className="p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Log out?</h3>
                    <p className="text-xs text-foreground/70 mt-0.5">
                      You'll need to sign in again.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-accent transition-colors text-foreground/60 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-lg bg-muted/40 border border-border/60 p-3 mb-4">
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Any unsaved changes will be lost. Make sure you've saved your work before logging out.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className="flex-1 gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}