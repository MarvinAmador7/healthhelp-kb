import { MessageCircle } from "lucide-react";

export default function ContactSupportCta() {
  return (
    <aside
      aria-label="Contact support"
      className="w-[212px] bg-[var(--color-primary)] rounded-[var(--radius-lg)] p-4 text-white sticky top-[68px] mt-3.5"
    >
      <p className="text-[13px] font-semibold leading-snug mb-1">
        Need more help?
      </p>
      <p className="text-[12px] leading-relaxed" style={{ opacity: 0.82 }}>
        Our support team is available to answer your health questions.
      </p>
      <a
        href="mailto:support@healthco.com"
        className="mt-3 flex items-center justify-center gap-2 w-full bg-white text-[var(--color-primary)] text-[12px] font-semibold py-2.5 px-3 rounded-full hover:bg-[var(--color-primary-light)] transition-colors duration-150 min-h-[44px]"
      >
        <MessageCircle size={14} aria-hidden="true" />
        Contact support
      </a>
    </aside>
  );
}
