/**
 * Centralized theme color tokens to avoid hardcoded hex values.
 * Use these strings directly in style props or data payloads.
 */
export const THEME_COLORS = {
  primary: "var(--color-primary)",
  primaryStrong: "var(--color-chart-2)",
  secondary: "var(--color-secondary)",
  warning: "var(--warning, var(--color-chart-2))",
  success: "var(--success, var(--color-chart-3))",
  info: "var(--info, var(--color-chart-4))",
  error: "var(--error, var(--color-destructive))",
  accent: "var(--color-accent)",
  pink: "var(--color-chart-5)",
  amber: "var(--color-chart-1)",
  muted: "var(--color-muted)",
  border: "var(--color-border)",
};
