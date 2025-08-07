"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps as NextThemesProviderProps } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
} & Omit<NextThemesProviderProps, 'children'>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
