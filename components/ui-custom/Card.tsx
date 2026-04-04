interface CardProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hover?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  size = "md",
  hover = false,
  selected = false,
  className = "",
  onClick,
}: CardProps) {
  const sizeStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const baseStyles = "bg-card border rounded-lg";
  const borderStyles = selected
    ? "border-emerald-400 bg-emerald-50 dark:border-ocean-mist-400 dark:bg-ocean-mist-800"
    : "border-border";
  const hoverStyles = hover
    ? "hover:shadow-lg hover:border-primary/40 transition cursor-pointer"
    : "";

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${borderStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
