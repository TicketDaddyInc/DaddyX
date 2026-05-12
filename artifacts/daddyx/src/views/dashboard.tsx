"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Zap, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWalletPortfolio, getGetWalletPortfolioQueryKey, useClaimRevenue } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

function formatSol(sol: number): string {
  if (!sol) return "0 ◎";
  return `${sol.toFixed(4)} ◎`;
}

const DEMO_WALLETS = [
  "fan1111111111111111111111111111",
  "fan2222222222222222222222222222",
  "fan7777777777777777777777777777",
];

export default function DashboardPage() {
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const connectedWallet = publicKey?.toBase58() ?? "";
  const [wallet, setWallet] = useState("");
  const [inputValue, setInputValue] = useState("");
  const claim = useClaimRevenue();

  // Sync wallet input with connected wallet when it changes
  useEffect(() => {
    if (connectedWallet) {
      setWallet(connectedWallet);
      setInputValue(connectedWallet);
    }
  }, [connectedWallet]);

  const portfolio = useGetWalletPortfolio(wallet, {
    query: {
      enabled: !!wallet,
      queryKey: getGetWalletPortfolioQueryKey(wallet),
    },
  });

  const items = portfolio.data ?? [];
  const totalInvested = items.reduce((sum: number, item: any) => sum + (item.entryPrice ?? 0), 0);
  const totalCurrentValue = items.reduce((sum: number, item: any) => sum + (item.currentPrice ?? 0), 0);
  const totalROI = totalInvested > 0
    ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
    : 0;

  function handleClaim(eventId: string) {
    claim.mutate(
      { wallet, eventId },
      {
        onSuccess: () => toast({ title: "Revenue claimed", description: "Your claim was recorded." }),
        onError: () => toast({ title: "Claim failed", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fan Dashboard</h1>
          <p className="text-white/50 text-sm">View your DaddyX token portfolio and revenue claims.</p>
        </div>

        {/* Wallet connect prompt or active wallet */}
        {!connectedWallet ? (
          <div className="bg-card border border-card-border rounded-xl p-6 mb-6 flex flex-col items-center gap-4 text-center">
            <p className="text-white/50 text-sm">Connect your wallet to view your portfolio automatically.</p>
            <WalletMultiButton
              style={{
                background: "linear-gradient(135deg,#E63946,#c1121f)",
                border: "0",
                borderRadius: "9999px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "10px 24px",
                height: "auto",
              }}
              data-testid="button-wallet-connect-dashboard"
            />
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <p className="text-xs text-white/60 font-mono flex-1 truncate">
              {connectedWallet}
            </p>
            <WalletMultiButton
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "9999px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "6px 14px",
                height: "auto",
              }}
            />
          </div>
        )}

        {/* Manual wallet lookup */}
        <div className="bg-card border border-card-border rounded-xl p-5 mb-6">
          <p className="text-[10px] text-white/30 mb-3 uppercase tracking-wider">Look up any wallet</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter wallet address..."
                className="pl-9 bg-white/4 border-white/12 text-white placeholder:text-white/30"
                data-testid="input-wallet-lookup"
              />
            </div>
            <Button
              onClick={() => setWallet(inputValue.trim())}
              className="gradient-red border-0 font-semibold"
              data-testid="button-load-portfolio"
            >
              Load
            </Button>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-[10px] text-white/30">Demo wallets:</span>
            {DEMO_WALLETS.map(w => (
              <button
                key={w}
                onClick={() => { setInputValue(w); setWallet(w); }}
                className="text-[10px] font-mono text-[#E63946]/70 hover:text-[#E63946] transition-colors"
                data-testid={`button-demo-wallet-${w.slice(-4)}`}
              >
                {w.slice(0, 8)}…
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {!portfolio.isLoading && items.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Tokens Held", value: String(items.length) },
              {
                label: "Total Invested",
                value: formatSol(totalInvested),
              },
              {
                label: "Portfolio ROI",
                value: `${totalROI > 0 ? "+" : ""}${totalROI.toFixed(1)}%`,
                accent: totalROI >= 0,
              },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-card border border-card-border rounded-xl p-4 text-center" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-xs text-white/40 mb-1">{label}</div>
                <div className={`text-xl font-bold ${accent !== undefined ? (accent ? "text-green-400" : "text-red-400") : "text-white"}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio table */}
        {portfolio.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-xl">
            <Zap className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm mb-4">No tokens found for this wallet</p>
            <Link href="/events">
              <Button className="gradient-red border-0" data-testid="button-browse-from-dash">Back an Event</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any, i: number) => {
              const roi = item.unrealisedRoiPct ?? 0;
              return (
                <div
                  key={i}
                  className="bg-card border border-card-border rounded-xl p-4 hover:border-white/20 transition-all"
                  data-testid={`card-portfolio-${i}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30 text-[10px]">
                          Token #{item.tokenId}
                        </Badge>
                        {item.settled && (
                          <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 text-[10px]">
                            Settled
                          </Badge>
                        )}
                        {item.revenueClaimed && (
                          <Badge className="bg-white/8 text-white/40 border border-white/15 text-[10px]">
                            Claimed
                          </Badge>
                        )}
                      </div>
                      <Link href={`/events/${item.eventId}`}>
                        <h3 className="text-sm font-semibold text-white hover:text-[#E63946] transition-colors truncate">
                          {item.eventName}
                        </h3>
                      </Link>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(item.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        {roi >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-sm font-bold ${roi >= 0 ? "text-green-400" : "text-red-400"}`} data-testid={`text-roi-${i}`}>
                          {roi > 0 ? "+" : ""}{roi.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-white/40">
                        Entry: <span className="text-white">{formatSol(item.entryPrice)}</span>
                      </div>
                      {item.settled && !item.revenueClaimed && (
                        <Button
                          size="sm"
                          className="mt-2 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 text-xs h-7"
                          onClick={() => handleClaim(item.eventId)}
                          disabled={claim.isPending}
                          data-testid={`button-claim-${i}`}
                        >
                          Claim Revenue
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
