"use client";

import { useState } from "react";
import { Search, Plus, TrendingUp, Users, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrganizerEvents, getGetOrganizerEventsQueryKey } from "@workspace/api-client-react";
import Link from "next/link";

function formatSol(sol: number): string {
  if (!sol) return "0 ◎";
  return `${sol.toFixed(3)} ◎`;
}

const DEMO_ORGANIZERS = [
  "org1111111111111111111111111111",
  "org2222222222222222222222222222",
  "org3333333333333333333333333333",
];

export default function OrganizerPage() {
  const [wallet, setWallet] = useState("org1111111111111111111111111111");
  const [inputValue, setInputValue] = useState("org1111111111111111111111111111");

  const orgEvents = useGetOrganizerEvents(wallet, {
    query: {
      enabled: !!wallet,
      queryKey: getGetOrganizerEventsQueryKey(wallet),
    },
  });

  const events = orgEvents.data ?? [];
  const totalRaised = events.reduce((s: number, e: any) => s + (e.capitalRaisedSol ?? 0), 0);
  const totalSold = events.reduce((s: number, e: any) => s + (e.tokensSold ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Organizer Portal</h1>
            <p className="text-white/50 text-sm">Manage your DaddyX events and track capital raised.</p>
          </div>
          <Link href="/creator/apply">
            <Button className="gradient-red border-0 glow-red-sm" data-testid="button-apply-organizer">
              <Plus className="w-4 h-4 mr-1.5" /> New Creator Application
            </Button>
          </Link>
        </div>

        {/* Wallet selector */}
        <div className="bg-card border border-card-border rounded-xl p-5 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter organizer wallet address..."
                className="pl-9 bg-white/4 border-white/12 text-white placeholder:text-white/30"
                data-testid="input-organizer-wallet"
              />
            </div>
            <Button
              onClick={() => setWallet(inputValue.trim())}
              className="gradient-red border-0"
              data-testid="button-load-organizer"
            >
              Load
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-[10px] text-white/30">Demo:</span>
            {DEMO_ORGANIZERS.map(w => (
              <button
                key={w}
                onClick={() => { setInputValue(w); setWallet(w); }}
                className="text-[10px] font-mono text-[#E63946]/70 hover:text-[#E63946] transition-colors"
                data-testid={`button-org-demo-${w.slice(-4)}`}
              >
                {w.slice(0, 10)}…
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        {!orgEvents.isLoading && events.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Events", value: String(events.length) },
              { label: "Tokens Sold", value: String(totalSold) },
              { label: "Capital Raised", value: formatSol(totalRaised) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border border-card-border rounded-xl p-4 text-center">
                <div className="text-xs text-white/40 mb-1">{label}</div>
                <div className="text-xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Event list */}
        {orgEvents.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-xl">
            <Zap className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm mb-4">No events found for this organizer</p>
            <Link href="/creator/apply">
              <Button className="gradient-red border-0" data-testid="button-become-creator">Become a Creator</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt: any, i: number) => {
              const fillPct = Math.round((evt.tokensSold / evt.tokenCount) * 100);
              return (
                <div
                  key={i}
                  className="bg-card border border-card-border rounded-xl p-5 hover:border-white/20 transition-all"
                  data-testid={`card-org-event-${i}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {evt.daddyxEnabled && (
                          <Badge className="bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30 text-[10px]">DaddyX</Badge>
                        )}
                        {evt.cancelled && (
                          <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>
                        )}
                        {evt.revenueReported && (
                          <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 text-[10px]">Settled</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-white">{evt.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{evt.venueName}</p>
                    </div>

                    <Link href={`/events/${evt.id}`}>
                      <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Tokens Sold", value: `${evt.tokensSold} / ${evt.tokenCount}` },
                      { label: "Capital Raised", value: formatSol(evt.capitalRaisedSol) },
                      { label: "Next Price", value: formatSol(evt.nextTokenPriceSol) },
                      { label: "Fill Rate", value: `${fillPct}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/4 rounded-lg p-2.5 text-center">
                        <div className="text-[10px] text-white/40 mb-0.5">{label}</div>
                        <div className="text-xs font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fill bar */}
                  {evt.daddyxEnabled && (
                    <div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-red rounded-full"
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                          data-testid={`bar-org-fill-${i}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
