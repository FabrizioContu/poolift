interface BadgeProps {
  children: React.ReactNode;
  variant?: "gray" | "yellow" | "green" | "red" | "blue" | "purple";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "gray",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    gray: "bg-gray-100 text-gray-700 dark:bg-bondi-blue-700 dark:text-bondi-blue-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    blue: "bg-bondi-blue-100 text-bondi-blue-700 dark:bg-bondi-blue-600 dark:text-bondi-blue-100",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
