import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  className?: string;
}

export function Alert({
  children,
  variant = "info",
  className = "",
}: AlertProps) {
  const variantStyles = {
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <CheckCircle size={16} className="text-emerald-500" />,
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-700",
      icon: <XCircle size={16} className="text-red-600" />,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: <AlertTriangle size={16} className="text-yellow-600" />,
    },
    info: {
      container: "bg-bondi-blue-50 border-bondi-blue-200 text-bondi-blue-600",
      icon: <Info size={16} className="text-bondi-blue-400" />,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${styles.container} ${className}`}
    >
      {styles.icon}
      <span>{children}</span>
    </div>
  );
}
