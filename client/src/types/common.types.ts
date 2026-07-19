// ============================================================
// Common / Shared Types
// ============================================================

/** Every persisted entity has at least these fields. */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Option shape used in selects, radio groups, etc. */
export interface SelectOption<V = string> {
  label: string;
  value: V;
  disabled?: boolean;
}

/** Navigation tab descriptor. */
export interface TabItem {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

/** Breadcrumb segment. */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Navigation link in sidebars / menus. */
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

/** Useful generic for components accepting children. */
export type PropsWithClassName<P = unknown> = P & { className?: string };
