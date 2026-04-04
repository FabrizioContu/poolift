import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground ${
            error ? "border-red-500 dark:border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
