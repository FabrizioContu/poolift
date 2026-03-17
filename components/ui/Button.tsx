interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-bondi-blue-400 text-white hover:bg-bondi-blue-500 dark:bg-bondi-blue-500 dark:hover:bg-bondi-blue-400",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-bondi-blue-800 dark:text-bondi-blue-100 dark:hover:bg-bondi-blue-600",
    danger:
      "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
