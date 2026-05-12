"use client";

import Link from "next/link";
import { Calendar, MapPin, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id: string;
  name: string;
  venueName: string;
  eventDate: string;
  tokenCount: number;
  tokensRemaining: number;
  initialPriceSol: number;
  nextTokenPriceSol: number;
  stepFactorBps: number;
  payoutFactorBps: number;
  revenueShareBps: number;
  daddyxEnabled: boolean;
  description?: string | null;
  cancelled?: boolean;
}

function formatSol(sol: number): string {
  if (sol < 0.01) return `${(sol * 1000).toFixed(1)}m◎`;
  return `${sol.toFixed(3)} ◎`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventCard({
  id, name, venueName, eventDate, tokenCount, tokensRemaining,
  initialPriceSol, nextTokenPriceSol, stepFactorBps, payoutFactorBps,
  revenueShareBps, daddyxEnabled, description, cancelled,
}: EventCardProps) {
  const soldCount = tokenCount - tokensRemaining;
  const fillPct = (soldCount / tokenCount) * 100;
  const stepFactor = (stepFactorBps / 10000).toFixed(1) + "x";
  const revenueShare = (revenueShareBps / 100).toFixed(0) + "%";

  return (
    <div
      className="group relative bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300"
      data-testid={`card-event-${id}`}
    >
      {/* Image placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-[#201f1f] to-[#131313] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Coins className="w-24 h-24 text-primary" />
        </div>
        {!daddyxEnabled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Standard Event</span>
          </div>
        )}
        {cancelled && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm px-3">Cancelled</Badge>
          </div>
        )}
        <div className="absolute top-3 left-3">
          {daddyxEnabled && (
            <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full">
              DaddyX
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3
          className="font-semibold text-white text-base leading-snug mb-1.5 group-hover:text-primary transition-colors"
          data-testid={`text-event-name-${id}`}
        >
          {name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-white/45 mb-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span data-testid={`text-event-venue-${id}`}>{venueName}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-white/45 mb-3">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span data-testid={`text-event-date-${id}`}>{formatDate(eventDate)}</span>
        </div>

        {description && (
          <p className="text-xs text-white/35 line-clamp-2 mb-3 leading-relaxed">{description}</p>
        )}

        {daddyxEnabled && (
          <>
            {/* Token fill bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-white/35 mb-1.5">
                <span>{soldCount} sold</span>
                <span>{tokensRemaining} left of {tokenCount}</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                  data-testid={`bar-token-fill-${id}`}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <div className="text-[10px] text-white/35 mb-1">Next Price</div>
                <div className="text-xs font-semibold text-white" data-testid={`text-price-${id}`}>
                  {formatSol(nextTokenPriceSol)}
                </div>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <div className="text-[10px] text-white/35 mb-1">Step Factor</div>
                <div className="text-xs font-semibold text-primary">{stepFactor}</div>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <div className="text-[10px] text-white/35 mb-1">Rev Share</div>
                <div className="text-xs font-semibold text-green-400">{revenueShare}</div>
              </div>
            </div>
          </>
        )}

        <Link href={`/events/${id}`}>
          <button
            className={`w-full py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
              daddyxEnabled
                ? "bg-white text-black hover:scale-[1.02] glow-white-hover"
                : "bg-white/[0.06] border border-white/10 text-white/60 hover:bg-white/10"
            }`}
            data-testid={`button-view-event-${id}`}
          >
            {daddyxEnabled ? "Back This Event" : "View Event"}
          </button>
        </Link>
      </div>
    </div>
  );
}
