import type { CSSProperties, ReactNode } from 'react';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  loading?: boolean;
  variant?: SkeletonVariant;
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  children?: ReactNode;
}

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

export function Skeleton({
  loading = true,
  variant = 'text',
  lines = 3,
  width,
  height,
  className = '',
  children,
}: SkeletonProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const style: CSSProperties = {
    width: toCssSize(width),
    height: toCssSize(height),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div
        className={`skeleton-group${className ? ` ${className}` : ''}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="콘텐츠를 불러오는 중"
      >
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className="skeleton skeleton--text skeleton-group__line" />
        ))}
      </div>
    );
  }

  return (
    <span
      className={`skeleton skeleton--${variant}${className ? ` ${className}` : ''}`}
      style={style}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="콘텐츠를 불러오는 중"
    />
  );
}

export interface SkeletonTimelineProps {
  itemCount?: number;
  className?: string;
}

export function SkeletonTimeline({ itemCount = 2, className = '' }: SkeletonTimelineProps) {
  return (
    <div
      className={`skeleton-group skeleton-group--timeline${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index} className="skeleton-timeline-item">
          <Skeleton variant="circle" width={24} height={24} />
          <div className="skeleton-timeline-content">
            <Skeleton variant="text" width="55%" lines={1} />
            <Skeleton variant="text" width="88%" lines={1} />
          </div>
        </div>
      ))}
    </div>
  );
}
