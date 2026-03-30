import * as React from "react"
import { forwardRef } from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Shadcn base input — used internally by the Input wrapper below */
function InputBase({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

/** App-level Input — label, hint, error, required on top of shadcn base */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}{" "}
            {required && <span className="text-destructive">*</span>}
          </label>
        )}
        <InputBase
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn("h-auto px-3 py-2", className)}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, InputBase }
