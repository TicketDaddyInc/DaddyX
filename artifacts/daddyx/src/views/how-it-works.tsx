"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap, TrendingUp, Shield, Users, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PriceChart from "@/components/PriceChart";

const DEMO_SIMULATION = Array.from({ length: 20 }, (_, i) => {
  const S = 1.5;
  const P = 1.2;
  const P0 = 0.05;
  const price = P0 * Math.pow(S, i + 1);
  const sellerGets = P0 * Math.pow(S, i) * P;
  const orgGets = price - sellerGets - price * 0.03;
  return {
    n: i + 1,
    price,
    organizerCumulative: Array.from({ length: i + 1 }, (_, j) => {
      const p = P0 * Math.pow(S, j + 1);
      return p - p / S * P - p * 0.03;
    }).reduce((a, b) => a + b, 0),
    investorROI: (P - 1) * 100,
  };
});

function Step({ num, title, body, icon: Icon }: { num: string; title: string; body: string; icon: any }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#E63946]/15 border border-[#E63946]/30 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#E63946]" />
        </div>
      </div>
      <div>
        <div className="text-xs text-[#E63946] font-semibold uppercase tracking-wider mb-1">Step {num}</div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white/40 hover:text-white mb-6 pl-0">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>

        <div className="mb-12">
          <div className="text-[#E63946] text-xs uppercase tracking-wider font-semibold mb-3">DaddyX Protocol</div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">How DaddyX Works</h1>
          <p className="text-white/50 text-base max-w-2xl">
            A complete walkthrough of the bonding-curve token model, from event creation through revenue settlement.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-10 mb-16">
          <Step
            num="01"
            icon={Users}
            title="Creator Approval"
            body="Event organisers apply on-chain. The DaddyX admin (or a DAO in future) reviews and approves. Approved creators receive a CreatorProfile PDA on Solana. This gating prevents spam and ensures quality events."
          />
          <Step
            num="02"
            icon={Zap}
            title="Event Initialisation"
            body="Approved creators call initialize_event with: token supply, initial price P₀, step factor S (e.g. 1.5×), payout factor P (e.g. 1.2×), revenue share BPS, event end date, and oracle public key. The program validates S > P before accepting."
          />
          <Step
            num="03"
            icon={TrendingUp}
            title="Token Purchases"
            body="Fans call purchase_token. They pay current_price × S. The previous holder receives current_price × P. The difference (minus platform fee) accrues to the organiser in the escrow PDA. Price rises geometrically with each purchase."
          />
          <Step
            num="04"
            icon={Shield}
            title="Price Raising"
            body="Token owners can voluntarily raise their token's price above the automatic step-up. They pre-pay the discount cost calculated as (new_price - current_price) × (S-P)/(S-1). This increases their sale proceeds when the next buyer comes in."
          />
          <Step
            num="05"
            icon={DollarSign}
            title="Revenue Settlement"
            body="After the event, the designated oracle submits report_revenue signed with the oracle key. The program stores gross revenue. Token holders then call claim_revenue to receive their pro-rata share from the escrow."
          />
        </div>

        {/* Price chart example */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2">Price Simulation</h2>
          <p className="text-sm text-white/40 mb-5">
            Sample event: P₀ = 0.05 ◎ · S = 1.5× · P = 1.2× · Platform fee = 3%
          </p>
          <PriceChart
            data={DEMO_SIMULATION}
            currentRound={6}
            title="Token Price & Organiser Revenue (20 purchases)"
          />
        </div>

        {/* Key numbers */}
        <div className="bg-card border border-card-border rounded-xl p-6 mb-12">
          <h2 className="text-lg font-bold text-white mb-5">Key Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Round 6 price", value: `${(0.05 * Math.pow(1.5, 6)).toFixed(3)} ◎` },
              { label: "Round 20 price", value: `${(0.05 * Math.pow(1.5, 20)).toFixed(1)} ◎` },
              { label: "Investor ROI/resale", value: "+20%" },
              { label: "Organiser cut/trade", value: "27%" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-black text-[#E63946] mb-1">{value}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Link href="/whitepaper">
            <Button variant="outline" className="border-white/20 text-white/60 bg-transparent hover:text-white">
              Read Whitepaper <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/events">
            <Button className="gradient-red border-0 glow-red">
              Back an Event <Zap className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
