"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Coins, Wallet } from "lucide-react";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/organizer", label: "Organizer" },
  { href: "/whitepaper", label: "Whitepaper" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#131313]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group active:scale-95 transition-all duration-150" data-testid="link-logo">
          <Coins className="w-5 h-5 text-primary" />
          <span className="text-ticket text-2xl tracking-tighter text-white">DaddyX</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
                pathname.startsWith(href)
                  ? "text-white bg-white/10"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              }`}
              data-testid={`link-nav-${label.toLowerCase()}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/creator/apply">
            <button
              className="border border-white/20 text-white/80 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/40 transition-all duration-200"
              data-testid="button-apply-creator"
            >
              Apply as Creator
            </button>
          </Link>
          <Link href="/events">
            <button
              className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all duration-200 glow-white-hover active:scale-95 flex items-center gap-2"
              data-testid="button-browse-events"
            >
              <Wallet className="w-3.5 h-3.5" />
              Browse Events
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-white/60 hover:text-white"
          onClick={() => setOpen(!open)}
          data-testid="button-mobile-menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#131313]">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                data-testid={`link-mobile-${label.toLowerCase()}`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              <Link href="/creator/apply" onClick={() => setOpen(false)}>
                <button className="w-full border border-white/20 text-white/80 px-5 py-3 rounded-full text-sm font-bold uppercase tracking-wider">
                  Apply as Creator
                </button>
              </Link>
              <Link href="/events" onClick={() => setOpen(false)}>
                <button className="w-full bg-white text-black px-5 py-3 rounded-full text-sm font-bold uppercase tracking-wider">
                  Browse Events
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
