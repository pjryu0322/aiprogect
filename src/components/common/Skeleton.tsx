import type { CSSProperties, ReactNode } from "react";
import "./Skeleton.css";

export type SkeletonVariant = "text" | "block" | "circle";

export interface SkeletonProps {
  loading?: boolean;
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  label?: string;
}

export function Skeleton({
  loading = true,
  variant = "text",
  width,
  height,
  lines = 1,
  className,
  style,
  children,
  label = "콘텐츠 로딩 중",
}: SkeletonProps) {
  if (!loading) {
    return children ? <>{children}</> : null;
  }

  const dimensionStyle: CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  if (variant === "text" && lines > 1) {
    return (
      <div
        className={`skeleton skeleton--text-group${
          className ? ` ${className}` : ""
        }`}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={`skeleton skeleton__line${
              index === lines - 1 ? " skeleton__line--short" : ""
            }`}
            style={index === 0 ? dimensionStyle : undefined}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <span
      className={`skeleton skeleton--${variant}${
        className ? ` ${className}` : ""
      }`}
      style={dimensionStyle}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
