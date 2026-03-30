import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle, Info, type LucideIcon, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/* ─── Shadcn Alert primitives ─────────────────────────────────────────────── */

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function AlertRoot({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-heading font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

/* ─── App-level Alert wrapper (preserves success/error/warning/info + icon) ── */

interface AppAlertProps {
  children: React.ReactNode
  variant?: "success" | "error" | "warning" | "info"
  className?: string
}

const appAlertConfig: Record<
  NonNullable<AppAlertProps["variant"]>,
  { container: string; icon: LucideIcon; iconClass: string }
> = {
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-300",
    icon: CheckCircle,
    iconClass: "text-emerald-500 dark:text-emerald-400",
  },
  error: {
    container: "bg-destructive/5 border-destructive/20 text-destructive dark:bg-destructive/10",
    icon: XCircle,
    iconClass: "text-destructive",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/40 dark:text-yellow-300",
    icon: AlertTriangle,
    iconClass: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    container: "bg-primary/5 border-primary/20 text-primary",
    icon: Info,
    iconClass: "text-primary",
  },
}

function Alert({ children, variant = "info", className }: AppAlertProps) {
  const { container, icon: Icon, iconClass } = appAlertConfig[variant]

  return (
    <div
      role="alert"
      className={cn(
        "p-3 border rounded-lg text-sm flex items-center gap-2",
        container,
        className
      )}
    >
      <Icon size={16} className={cn("shrink-0", iconClass)} />
      <span>{children}</span>
    </div>
  )
}

export { Alert, AlertRoot, AlertTitle, AlertDescription, AlertAction }
