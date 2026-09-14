const ease = {
  smooth: [0.22, 1, 0.36, 1],
  // snappy ease-out (your auth page)
  gentle: [0.4, 0, 0.2, 1]
};
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03
    }
  }
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.smooth }
  }
};
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.28, ease: ease.smooth } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: ease.gentle } }
};
const tabContent = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: ease.smooth } }
};
const dropdown = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: ease.smooth } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }
};
const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.2, ease: ease.smooth } },
  whileTap: { y: 0, scale: 0.995 }
};
const hoverLift = cardHover;
export {
  cardHover as c,
  dropdown as d,
  fadeUp as f,
  hoverLift as h,
  pageTransition as p,
  staggerContainer as s,
  tabContent as t
};
