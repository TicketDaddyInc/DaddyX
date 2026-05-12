"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap, TrendingUp, Shield, Globe, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SLIDES = [
  {
    id: 1,
    label: "The Problem",
    headline: "Billions in live events.\nZero for fans.",
    subline: "Event organisers in emerging markets have no access to pre-financing. Fans have no way to share in event success — even when they're the ones who make it happen.",
    visual: "problem",
  },
  {
    id: 2,
    label: "The Solution",
    headline: "DaddyX: Fan-Powered\nEvent Finance.",
    subline: "A bonding-curve token protocol on Solana. Fans back events on-chain, prices rise with each purchase, and everyone earns from the night's actual revenue.",
    visual: "solution",
  },
  {
    id: 3,
    label: "How It Works",
    headline: "Buy early.\nGet paid when the crowd arrives.",
    subline: "Every DaddyX token purchase raises the price. The previous holder is paid out automatically. After the event, token holders split a configurable share of gross revenue.",
    visual: "mechanism",
  },
  {
    id: 4,
    label: "The Math",
    headline: "S > P.\nExploit-proof by design.",
    subline: "Step factor S sets the price multiplier per purchase. Payout factor P ensures previous holders profit. The constraint S > P makes circular buying mathematically unprofitable.",
    visual: "math",
  },
  {
    id: 5,
    label: "Market",
    headline: "$1.8T global\nlive events industry.",
    subline: "Africa's live events market alone is projected at $15B by 2028. DaddyX targets the pre-financing gap — where traditional credit fails and fans have untapped purchasing power.",
    visual: "market",
  },
  {
    id: 6,
    label: "Demo Events",
    headline: "3 live DaddyX\ncampaigns on devnet.",
    subline: "Kigali Jazz Festival · Uganda Netball League Finals · Doha Electronic Night. Real prices, real bonding curves, real revenue simulation — running on Solana devnet today.",
    visual: "demo",
  },
  {
    id: 7,
    label: "Tech Stack",
    headline: "Anchor + React.\nProduction-ready.",
    subline: "Rust Anchor program (13 instructions), Solana devnet, TypeScript tests, Next.js API routes, PostgreSQL, Next.js frontend, Orval-generated API client.",
    visual: "tech",
  },
  {
    id: 8,
    label: "Ask",
    headline: "Back the protocol.\nEarn from the ecosystem.",
    subline: "We are raising to fund mainnet deployment, oracle infrastructure, and our first 10 real-world event partnerships across East Africa and the Gulf.",
    visual: "ask",
  },
];

const ICONS: Record<string, any> = {
  problem: Globe,
  solution: Zap,
  mechanism: TrendingUp,
  math: Shield,
  market: DollarSign,
  demo: Users,
  tech: Zap,
  ask: TrendingUp,
};

const METRICS = [
  { value: "0.05 SOL", label: "Starting price" },
  { value: "1.5×", label: "Step factor" },
  { value: "1.2×", label: "Payout factor" },
  { value: "20%", label: "Revenue share" },
];

export default function PitchPage() {
  const [slide, setSlide] = useState(0);

  const current = SLIDES[slide];
  const Icon = ICONS[current.visual] ?? Zap;

  function prev() { setSlide(s => Math.max(0, s - 1)); }
  function next() { setSlide(s => Math.min(SLIDES.length - 1, s + 1)); }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white pl-0" data-testid="button-back-pitch">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="text-xs text-white/30">
            Slide {slide + 1} of {SLIDES.length}
          </div>
        </div>

        {/* Slide */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden mb-6" data-testid="div-slide">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
            {/* Content */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="text-[#E63946] text-xs uppercase tracking-wider font-semibold mb-4">
                {String(slide + 1).padStart(2, "0")} / {current.label}
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5 whitespace-pre-line">
                {current.headline}
              </h2>
              <p className="text-white/55 text-sm leading-relaxed">
                {current.subline}
              </p>

              {slide === 3 && (
                <div className="mt-6 space-y-2 font-mono text-xs">
                  {[
                    ["buyer pays:", "price × S / 10000"],
                    ["seller gets:", "price × P / 10000"],
                    ["constraint:", "S > P (enforced on-chain)"],
                    ["exploit cost:", "always positive"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-white/30 w-28 shrink-0">{k}</span>
                      <span className="text-[#E63946]">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide === 7 && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {METRICS.map(({ value, label }) => (
                    <div key={label} className="bg-white/4 rounded-lg p-3 text-center">
                      <div className="text-lg font-black text-[#E63946]">{value}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visual */}
            <div className="bg-[#E63946]/5 border-l border-white/6 flex items-center justify-center p-10">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-[#E63946]/15 flex items-center justify-center mx-auto mb-6 glow-red-sm">
                  <Icon className="w-12 h-12 text-[#E63946]" />
                </div>
                {slide === 2 && (
                  <div className="space-y-3 text-left max-w-52">
                    {[
                      { n: 1, price: "0.05◎", buyer: "Fan #1" },
                      { n: 2, price: "0.075◎", buyer: "Fan #2" },
                      { n: 3, price: "0.113◎", buyer: "Fan #3" },
                      { n: 4, price: "0.169◎", buyer: "Fan #4" },
                    ].map(({ n, price, buyer }) => (
                      <div key={n} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#E63946]/20 flex items-center justify-center text-[10px] text-[#E63946] font-bold">{n}</div>
                        <div>
                          <div className="text-xs text-white font-medium">{buyer}</div>
                          <div className="text-[10px] text-white/40">{price}</div>
                        </div>
                        {n < 4 && <ArrowRight className="w-3 h-3 text-white/20 ml-auto" />}
                      </div>
                    ))}
                  </div>
                )}
                {slide === 4 && (
                  <div className="text-2xl font-black text-white/10 mt-2">$1.8T TAM</div>
                )}
                {slide === 5 && (
                  <div className="space-y-2 text-left text-xs">
                    {[
                      { name: "Kigali Jazz Festival", status: "6 tokens sold" },
                      { name: "Uganda Netball Finals", status: "4 tokens sold" },
                      { name: "Doha Electronic Night", status: "3 tokens sold" },
                    ].map(({ name, status }) => (
                      <div key={name} className="bg-white/4 rounded-lg px-3 py-2">
                        <div className="text-white/70 font-medium">{name}</div>
                        <div className="text-white/30">{status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prev}
            disabled={slide === 0}
            className="border-white/20 text-white/60 bg-transparent hover:text-white disabled:opacity-30"
            data-testid="button-prev-slide"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-[#E63946]" : "w-1.5 bg-white/20"}`}
                data-testid={`button-dot-${i}`}
              />
            ))}
          </div>

          {slide === SLIDES.length - 1 ? (
            <Link href="/events">
              <Button className="gradient-red border-0" data-testid="button-pitch-cta">
                Browse Events <Zap className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={next}
              className="gradient-red border-0"
              data-testid="button-next-slide"
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
