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
    gray: "bg-gray-100 text-gray-700",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-bondi-blue-100 text-bondi-blue-700",
    purple: "bg-purple-100 text-purple-800",
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
