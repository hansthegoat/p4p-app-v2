import type { Variants, Transition } from "framer-motion";

// ─── Easing curves ────────────────────────────────────────
export const ease = {
  smooth: [0.22, 1, 0.36, 1] as const,     // snappy ease-out (your auth page)
  gentle: [0.4, 0, 0.2, 1] as const,       // material-style
  spring: { type: "spring", stiffness: 400, damping: 30 } as Transition,
  softSpring: { type: "spring", stiffness: 200, damping: 25 } as Transition,
};

// ─── Containers ───────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

// ─── Item reveals ─────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.smooth },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: ease.smooth } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: ease.smooth } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: ease.smooth } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: ease.smooth } },
};

// ─── Page transition (route changes) ──────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.28, ease: ease.smooth } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: ease.gentle } },
};

// ─── Tab content ──────────────────────────────────────────
export const tabContent: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: ease.smooth } },
};

// ─── List items ───────────────────────────────────────────
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.smooth } },
};

export const listItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: ease.smooth } },
};

// ─── Modal / dialog ───────────────────────────────────────
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: ease.softSpring },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.15 } },
};

// ─── Dropdown / popover ───────────────────────────────────
export const dropdown: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: ease.smooth } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } },
};

// ─── Micro-interactions (spread onto motion elements) ────
export const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.2, ease: ease.smooth } },
  whileTap: { y: 0, scale: 0.995 },
};

export const hoverLift = cardHover;

export const buttonPress = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.97 },
  transition: ease.spring,
};

export const iconButtonPress = {
  whileHover: { scale: 1.06 },
  whileTap: { scale: 0.94 },
  transition: ease.spring,
};