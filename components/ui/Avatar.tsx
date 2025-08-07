import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", fallback, ...props }, ref) => {
    const sizeClasses = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    const displayFallback = fallback || (name ? getInitials(name) : "?");

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt={alt || name || "Avatar"}
            onError={(e) => {
              // Hide image on error and show fallback
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
            src ? "absolute inset-0" : ""
          )}
          style={{ display: src ? "none" : "flex" }}
        >
          {displayFallback}
        </div>
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
