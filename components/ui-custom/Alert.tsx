import { AlertTriangle, CheckCircle, Info, LucideIcon, XCircle } from "lucide-react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  className?: string;
}

const variantStyles: Record<
  NonNullable<AlertProps["variant"]>,
  { container: string; icon: LucideIcon; iconClass: string }
> = {
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:border-emerald-700 dark:text-emerald-200",
    icon: CheckCircle,
    iconClass: "text-emerald-500 dark:text-emerald-300",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300",
    icon: XCircle,
    iconClass: "text-red-600 dark:text-red-400",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200",
    icon: AlertTriangle,
    iconClass: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    container: "bg-bondi-blue-50 border-bondi-blue-200 text-bondi-blue-600 dark:bg-bondi-blue-700 dark:border-bondi-blue-600 dark:text-bondi-blue-200",
    icon: Info,
    iconClass: "text-bondi-blue-400 dark:text-bondi-blue-300",
  },
};

export function Alert({
  children,
  variant = "info",
  className = "",
}: AlertProps) {
  const { container, icon: Icon, iconClass } = variantStyles[variant];

  return (
    <div
      className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${container} ${className}`}
    >
      <Icon size={16} className={iconClass} />
      <span>{children}</span>
    </div>
  );
}
