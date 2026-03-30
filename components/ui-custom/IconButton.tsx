import { LucideIcon } from "lucide-react";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "default" | "danger";
  size?: "sm" | "md";
  label: string;
}

export function IconButton({
  icon: Icon,
  variant = "default",
  size = "md",
  label,
  className = "",
  ...props
}: IconButtonProps) {
  const variantStyles = {
    default: "text-gray-700 hover:text-gray-700 hover:bg-gray-100 dark:text-bondi-blue-300 dark:hover:text-bondi-blue-100 dark:hover:bg-bondi-blue-700",
    danger: "text-gray-700 hover:text-red-500 hover:bg-red-50 dark:text-bondi-blue-300 dark:hover:text-red-400 dark:hover:bg-red-900",
  };

  const sizeStyles = {
    sm: "p-1",
    md: "p-1.5",
  };

  const iconSize = {
    sm: 14,
    md: 16,
  };

  return (
    <button
      className={`rounded transition ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      title={label}
      aria-label={label}
      {...props}
    >
      <Icon size={iconSize[size]} />
    </button>
  );
}
