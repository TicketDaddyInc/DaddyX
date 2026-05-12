"use client";

import Link from "next/link";
import { ArrowRight, Wallet, Info, Ban, Ticket, TrendingUp, Shield, Users, ChevronRight, Coins } from "lucide-react";
import { useGetStatsSummary, useListEvents } from "@workspace/api-client-react";
import EventCard from "@/components/EventCard";

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="font-display text-5xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, accent = false }: { icon: any; title: string; body: string; accent?: boolean }) {
  return (
    <div className={`bg-card border rounded-2xl p-6 transition-all duration-300 ${
      accent
        ? "border-primary/20 hover:border-primary/40"
        : "border-card-border hover:border-white/20"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
        accent ? "bg-primary/15" : "bg-white/5"
      }`}>
        <Icon className={`w-5 h-5 ${accent ? "text-primary" : "text-white/60"}`} />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{body}</p>
    </div>
  );
}

export default function HomePage() {
  const stats = useGetStatsSummary();
  const events = useListEvents();
  const featuredEvents = (events.data ?? []).filter((e: any) => e.daddyxEnabled).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ──────────────────────────────────── */}
      <section className="min-h-[85vh] flex flex-col justify-center items-center px-6 text-center relative pt-24 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,182,144,0.06)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-3xl z-10 space-y-8">
          <h1 className="font-display font-bold uppercase text-5xl md:text-7xl text-white leading-[1.05] tracking-tight">
            BACK THE EVENT.<br />
            <span className="text-primary">EARN FROM THE NIGHT.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto leading-relaxed font-light">
            DaddyX lets fans pre-finance events and earn a share of verified ticket revenue.
            Powered by Solana and built on battle-tested infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <button
                className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all duration-200 glow-white-hover flex items-center justify-center gap-2 active:scale-95"
                data-testid="button-hero-browse"
              >
                <Wallet className="w-4 h-4" />
                Browse Events
              </button>
            </Link>
            <Link href="/daddyx">
              <button
                className="border border-white/20 text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                data-testid="button-hero-whitepaper"
              >
                <Info className="w-4 h-4" />
                How It Works
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <span className="bg-white/5 text-white/80 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse block" />
              Powered by Solana
            </span>
            <span className="bg-white/5 text-white/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/[0.06]">
              Built on TicketDaddy
            </span>
            <span className="bg-white/5 text-white/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/[0.06]">
              600K+ Tickets Processed
            </span>
          </div>
        </div>
      </section>

      {/* ── THE BROKEN SYSTEM ─────────────────────── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-center text-white mb-16 uppercase tracking-tighter italic">
          THE BROKEN SYSTEM
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-card border border-card-border p-8 flex flex-col gap-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white leading-tight">The Organizer Burden</h3>
                <p className="text-white/40 text-sm font-medium">Financing friction</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <Ban className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="text-white/55 text-base leading-relaxed">
              Organizers absorb 100% of upfront costs while waiting weeks for ticketing payouts
              to clear, stifling growth and event scale.
            </p>
            <div className="mt-auto pt-6 border-t border-white/[0.06]">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-5xl text-white">7–30</span>
                <span className="text-white/40 font-bold uppercase tracking-widest text-sm">Days</span>
              </div>
              <span className="text-[11px] text-white/30 font-bold uppercase tracking-widest mt-1 block">Average Payout Delay</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-card-border p-8 flex flex-col gap-6 rounded-2xl relative overflow-hidden group hover:border-secondary/30 transition-colors duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white leading-tight">The Fan Reality</h3>
                <p className="text-white/40 text-sm font-medium">Zero ownership</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-xl">
                <Ticket className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <p className="text-white/55 text-base leading-relaxed">
              Fans pour billions into the industry but capture zero upside from the financial
              success of the shows they hype and attend.
            </p>
            <div className="mt-auto pt-6 border-t border-white/[0.06]">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-5xl text-white">0%</span>
              </div>
              <span className="text-[11px] text-white/30 font-bold uppercase tracking-widest mt-1 block">Financial Upside for Fans</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white uppercase tracking-tighter mb-4">
              How DaddyX Works
            </h2>
            <p className="text-white/45 text-sm max-w-lg mx-auto leading-relaxed">
              A bonding-curve token model where fans back events, prices rise with each purchase,
              and everyone earns from the night's revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                step: "01",
                title: "Creator Lists an Event",
                body: "Approved organizers configure token supply, initial price, step factor S, payout factor P, and revenue share. The Anchor smart program enforces all constraints.",
              },
              {
                step: "02",
                title: "Fans Buy DaddyX Tokens",
                body: "Each purchase costs current_price × S. The previous owner is paid out × P. Early buyers pay less — and earn more when the next fan buys in.",
              },
              {
                step: "03",
                title: "Earn from the Night",
                body: "After the event, the oracle reports revenue on-chain. Token holders claim their pro-rata share of the revenue pool directly from Solana escrow.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="bg-card border border-card-border rounded-2xl p-6">
                <div className="font-display font-black text-5xl text-primary/20 mb-3">{step}</div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/daddyx">
              <button className="text-primary/80 hover:text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-1 mx-auto transition-colors" data-testid="button-learn-more">
                Full Technical Overview <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ────────────────────────────── */}
      {stats.data && (
        <section className="py-20 px-6 bg-card border-y border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <StatBadge value={String(stats.data.totalEvents ?? 0)} label="Total Events" />
              <StatBadge value={String(stats.data.daddyxEvents ?? 0)} label="DaddyX Events" />
              <StatBadge value={String(stats.data.totalTokensSold ?? 0)} label="Tokens Sold" />
              <StatBadge value={String(stats.data.totalHolders ?? 0)} label="Unique Holders" />
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED EVENTS ───────────────────────── */}
      {featuredEvents.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-white uppercase tracking-tighter">
                  Featured Events
                </h2>
                <p className="text-sm text-white/35 mt-1">Live DaddyX campaigns open for backing</p>
              </div>
              <Link href="/events">
                <button className="text-primary/70 hover:text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-1 transition-colors" data-testid="button-all-events">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredEvents.map((event: any) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY DADDYX ────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white uppercase tracking-tighter mb-3">Why DaddyX?</h2>
            <p className="text-white/40 text-sm">Purpose-built for the live events industry on Solana</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Coins}
              title="Solana Native"
              body="Sub-second finality, near-zero fees. Every purchase and payout settles on-chain via Anchor smart programs."
              accent
            />
            <FeatureCard
              icon={TrendingUp}
              title="Bonding Curve Pricing"
              body="Step factor S ensures each buyer pays more than the last. Payout factor P guarantees previous holders profit on resale."
            />
            <FeatureCard
              icon={Shield}
              title="Exploit-Proof Math"
              body="The constraint S > P makes circular buying unprofitable. No flash-loan or sandwich attacks — price must genuinely rise."
            />
            <FeatureCard
              icon={Users}
              title="Revenue Sharing"
              body="Post-event oracle reports actual ticket revenue. DaddyX token holders claim a configurable share directly from escrow."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white uppercase tracking-tighter">
            Ready to Back<br />Your First Event?
          </h2>
          <p className="text-white/45 text-sm leading-relaxed">
            Browse active DaddyX campaigns and start earning from the night.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/events">
              <button
                className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all duration-200 glow-white-hover flex items-center justify-center gap-2"
                data-testid="button-cta-events"
              >
                Browse Events <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/creator/apply">
              <button
                className="border border-white/20 text-white/80 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-all duration-200 hover:scale-105"
                data-testid="button-cta-creator"
              >
                Become a Creator
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
