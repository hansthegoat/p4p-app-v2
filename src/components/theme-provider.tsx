import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "p4p-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme: "light" | "dark" = "light";
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);
  }, [theme]);

  // Listen for system changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const setThemeWithTransition = (newTheme: Theme) => {
    // Add transition class to html element
    const root = window.document.documentElement;
    root.classList.add("theme-transition");

    // Store the theme
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, newTheme);
    }
    setTheme(newTheme);

    // Remove transition class after animation completes
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 400);
  };

  const value = {
    theme,
    setTheme: setThemeWithTransition,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}