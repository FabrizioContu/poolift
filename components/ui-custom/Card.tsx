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

  const baseStyles = "bg-white dark:bg-bondi-blue-700 border rounded-lg";
  const borderStyles = selected
    ? "border-emerald-400 bg-emerald-50 dark:border-ocean-mist-400 dark:bg-ocean-mist-800"
    : "border-gray-200 dark:border-bondi-blue-600";
  const hoverStyles = hover
    ? "hover:shadow-lg hover:border-bondi-blue-200 dark:hover:border-bondi-blue-400 transition cursor-pointer"
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
