export type BadgeTone = "forest" | "rust" | "gold" | "ink";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children }: BadgeProps) {
  return <span>{children}</span>;
}
