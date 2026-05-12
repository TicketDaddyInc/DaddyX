import Link from "next/link";
import { Coins } from "lucide-react";

const FOOTER_LINKS = ["How It Works", "For Organizers", "For Fans", "Whitepaper", "Pitch Deck"];
const FOOTER_HREFS: Record<string, string> = {
  "How It Works": "/daddyx",
  "For Organizers": "/organizer",
  "For Fans": "/dashboard",
  "Whitepaper": "/whitepaper",
  "Pitch Deck": "/pitch",
};

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] py-16 bg-[#131313] mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-10">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-ticket text-3xl tracking-tighter text-white">DaddyX</span>
          </div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
            Powering the Solana Event Economy
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link}
              href={FOOTER_HREFS[link]}
              className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          © 2026 DaddyX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
