interface LogoProps {
  size?: number;
  variant?: "full" | "mark";
  theme?: "auto" | "light" | "dark";
  className?: string;
}

export function Logo({
  size = 32,
  variant = "mark",
  theme = "auto",
  className = "",
}: LogoProps) {
  // Vite serves public/ at the app's base path (/p4p-app-v2/)
  const base = import.meta.env.BASE_URL; // e.g. "/p4p-app-v2/"
  const src = `${base}${variant === "mark" ? "logo-mark.png" : "logo.png"}`;

  const invertClass =
    theme === "light"
      ? "brightness-0 invert"
      : theme === "dark"
      ? ""
      : "dark:brightness-0 dark:invert";

  return (
    <img
      src={src}
      alt="P4P Platform"
      className={`object-contain shrink-0 ${invertClass} ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}