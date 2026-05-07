import { MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactCallout() {
  return (
    <section
      aria-label="Contact support"
      className="bg-[var(--color-accent-light)] border border-[var(--color-accent)]/20 rounded-[var(--radius-lg)] p-8 text-center"
    >
      <p className="text-[var(--color-text-secondary)] mb-1 text-sm font-medium uppercase tracking-wider">
        Didn&apos;t find what you were looking for?
      </p>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        Our support team is here to help
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto text-sm">
        Can&apos;t find the answer you need? Reach out and a real person will get back to you.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <a
          href="#"
          className={cn(
            "inline-flex items-center gap-2 px-5 py-3 rounded-full min-h-[44px]",
            "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white",
            "text-sm font-semibold transition-colors duration-150"
          )}
        >
          <MessageCircle size={16} aria-hidden="true" />
          Live chat
        </a>
        <a
          href="mailto:support@healthco.com"
          className={cn(
            "inline-flex items-center gap-2 px-5 py-3 rounded-full min-h-[44px]",
            "border border-[var(--color-primary)] text-[var(--color-primary)]",
            "hover:bg-[var(--color-primary-light)] text-sm font-semibold transition-colors duration-150"
          )}
        >
          <Mail size={16} aria-hidden="true" />
          Email support
        </a>
      </div>
    </section>
  );
}
