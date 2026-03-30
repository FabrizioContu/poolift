import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ─── Shadcn Badge primitives ─────────────────────────────────────────────── */

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function BadgeBase({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">({ className: cn(badgeVariants({ variant }), className) }, props),
    render,
    state: { slot: "badge", variant },
  })
}

/* ─── App-level Badge wrapper (preserves gray/yellow/green/red/blue/purple) ── */

interface BadgeProps {
  children: React.ReactNode
  variant?: "gray" | "yellow" | "green" | "red" | "blue" | "purple"
  size?: "sm" | "md"
  className?: string
}

const appBadgeVariants = {
  gray: "bg-secondary text-secondary-foreground",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  red: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  blue: "bg-primary/10 text-primary dark:bg-primary/20",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
}

function Badge({ children, variant = "gray", size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        appBadgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export { Badge, BadgeBase, badgeVariants }
