import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "caution" | "success";

const CONFIG: Record<
  CalloutType,
  { icon: React.ElementType; borderColor: string; bgColor: string; ariaRole: string }
> = {
  info: {
    icon: Info,
    borderColor: "border-l-[var(--color-info)]",
    bgColor: "bg-[var(--color-info-light)]",
    ariaRole: "note",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-[var(--color-warning)]",
    bgColor: "bg-[var(--color-warning-light)]",
    ariaRole: "note",
  },
  caution: {
    icon: AlertCircle,
    borderColor: "border-l-[var(--color-error)]",
    bgColor: "bg-[var(--color-error-light)]",
    ariaRole: "alert",
  },
  success: {
    icon: CheckCircle,
    borderColor: "border-l-[var(--color-success)]",
    bgColor: "bg-[var(--color-success-light)]",
    ariaRole: "note",
  },
};

interface Props {
  type: CalloutType;
  text: string;
}

export default function Callout({ type, text }: Props) {
  const { icon: Icon, borderColor, bgColor, ariaRole } = CONFIG[type];
  return (
    <div
      role={ariaRole}
      className={cn(
        "flex gap-3 p-4 rounded-[var(--radius-md)] border-l-4 my-4",
        borderColor,
        bgColor
      )}
    >
      <Icon
        size={18}
        className="flex-shrink-0 mt-0.5 text-[var(--color-text-secondary)]"
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{text}</p>
    </div>
  );
}
