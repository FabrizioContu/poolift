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
    default: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
    danger: "text-gray-400 hover:text-red-500 hover:bg-red-50",
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
