import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-secondary)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-lg mb-2">HealthHelp</p>
            <p className="text-sm text-white/70">
              Trusted health information for patients, caregivers, and families.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">Resources</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Browse all topics</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">Support</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="mailto:support@healthco.com" className="hover:text-white transition-colors">Email support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Live chat</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/70">
          <p>© {new Date().getFullYear()} HealthCo. All rights reserved.</p>
          <p>
            No PHI is stored in this system. Content is for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
