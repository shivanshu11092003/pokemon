"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";

interface ResponsiveModalProps {
  /** Accessible name. Rendered visually hidden — children own the visible heading. */
  title: string;
  children: ReactNode;
  /** Fired once the exit animation has finished, so navigation never cuts it off. */
  onClosed: () => void;
  className?: string;
}

/**
 * One dialog, two presentations: a centred modal from `md` up and a draggable
 * bottom sheet below it. Same component tree, same focus management, same exit
 * contract — the breakpoint only changes geometry and motion.
 */
export function ResponsiveModal({ title, children, onClosed, className }: ResponsiveModalProps) {
  const [open, setOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const reducedMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  const sheetMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isDesktop
      ? {
          initial: { opacity: 0, scale: 0.96, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.97, y: 8 },
        }
      : {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
        };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && close()}>
      <AnimatePresence onExitComplete={onClosed}>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px]"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onOpenAutoFocus={(event) => {
                // Focus the panel itself rather than the first control, so the
                // reading order starts at the top of the Pokémon, not at "close".
                event.preventDefault();
                (event.currentTarget as HTMLElement).focus();
              }}
            >
              <motion.div
                {...sheetMotion}
                transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.8 }}
                drag={isDesktop || reducedMotion ? false : "y"}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120 || info.velocity.y > 700) close();
                }}
                tabIndex={-1}
                className={cn(
                  "fixed z-50 flex flex-col overflow-hidden bg-canvas outline-none",
                  "inset-x-0 bottom-0 max-h-[92svh] rounded-t-[1.75rem] border-t border-line",
                  "md:inset-0 md:m-auto md:h-fit md:max-h-[88svh] md:w-[min(56rem,calc(100vw-3rem))] md:rounded-[1.75rem] md:border",
                  "shadow-hover",
                  className,
                )}
              >
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>

                {/* Grab handle doubles as the affordance for drag-to-dismiss. */}
                <div className="flex shrink-0 justify-center pt-3 pb-1 md:hidden">
                  <div className="h-1.5 w-10 rounded-full bg-line-strong" />
                </div>

                <DialogPrimitive.Close
                  className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-line bg-surface/80 text-ink-muted backdrop-blur transition-colors hover:bg-surface hover:text-ink"
                  aria-label="Close details"
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
