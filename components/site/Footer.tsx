import Link from "next/link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-kicker">Vortex Servers</p>
          <p className="footer-copy">
            Game server hosting with CMS-managed pages and Pelican-backed server details.
          </p>
        </div>

        <div className="footer-links-group">
          <p className="footer-kicker">Legal</p>
          <nav className="footer-links" aria-label="Legal links">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bar">
        <span>Copyright {siteConfig.name} 2026</span>
      </div>
    </footer>
  );
}
