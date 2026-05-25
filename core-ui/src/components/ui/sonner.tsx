import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"
import type { CSSProperties } from "react"

const defaultIcons: ToasterProps["icons"] = {
  success: <CircleCheckIcon className="size-4" />,
  info: <InfoIcon className="size-4" />,
  warning: <TriangleAlertIcon className="size-4" />,
  error: <CircleAlertIcon className="size-4" />,
  loading: <Loader2Icon className="size-4 animate-spin" />,
}

const defaultClassNames = {
  toast: "border shadow-lg",
  title: "text-sm font-semibold",
  description: "text-sm leading-relaxed opacity-90",
  success: "border-success/30 bg-success/10 text-foreground",
  error: "border-destructive/30 bg-destructive/10 text-foreground",
  warning: "border-warning/30 bg-warning/10 text-foreground",
  info: "border-primary/30 bg-primary/10 text-foreground",
  icon: "text-current",
}

const Toaster = ({
  className,
  icons,
  style,
  toastOptions,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      expand
      visibleToasts={5}
      className={["toaster group", className].filter(Boolean).join(" ")}
      icons={{ ...defaultIcons, ...icons }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          ...style,
        } as CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...defaultClassNames,
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
