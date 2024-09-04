"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-300 filter blur-[10px] dark:invert",
              showRadialGradient &&
              "mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)"
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
