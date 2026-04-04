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
      "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
