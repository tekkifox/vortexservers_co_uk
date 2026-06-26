import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Footer } from "@/components/site/Footer";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: "CMS-driven game server hosting website powered by Pelican.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/servers", label: "Servers" },
  { href: "/about", label: "About" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              <span className="brand-mark">V</span>
              <span>
                <strong>{siteConfig.name}</strong>
                <small>Pelican-powered hosting</small>
              </span>
            </Link>

            <nav className="nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="site-main">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
