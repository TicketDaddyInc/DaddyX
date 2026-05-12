"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar, MapPin, ArrowLeft,
  ExternalLink, RefreshCw, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetEvent, useGetSimulation, useGetTokenHolders,
  useRecordPurchase, getGetEventQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import PriceChart from "@/components/PriceChart";
import { useToast } from "@/hooks/use-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePurchaseToken } from "@/hooks/usePurchaseToken";
import { useClaimRevenue } from "@/hooks/useClaimRevenueOnChain";
import { useClaimRevenue as useClaimRevenueApi } from "@workspace/api-client-react";
import { findEventConfigPda } from "@/lib/anchor";
import { explorerUrl } from "@/lib/constants";

function formatSol(sol: number): string {
  if (!sol) return "0 ◎";
  if (sol < 0.01) return `${(sol * 1000).toFixed(2)}m◎`;
  return `${sol.toFixed(4)} ◎`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [purchasing, setPurchasing] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimTxSig, setClaimTxSig] = useState<string | null>(null);

  const event = useGetEvent(id!, { query: { queryKey: getGetEventQueryKey(id!) } });
  const simulation = useGetSimulation(id!, { query: { queryKey: ["sim", id!] } });
  const holders = useGetTokenHolders(id!, { query: { queryKey: ["holders", id!] } });
  const purchase = useRecordPurchase();

  const { purchaseToken, connected, publicKey } = usePurchaseToken();
  const { claimRevenue } = useClaimRevenue();
  const claimApi = useClaimRevenueApi();

  const eventData = event.data?.event;
  const tokens = event.data?.tokens ?? [];
  const soldCount = tokens.length;
  const tokensRemaining = eventData ? eventData.tokenCount - soldCount : 0;
  const nextTokenPrice = eventData
    ? soldCount === 0
      ? eventData.initialPriceSol
      : Math.max(...tokens.map((t: any) => t.currentPrice)) * eventData.stepFactorBps / 10000
    : 0;

  // Derive the on-chain EventConfig PDA from the event's string ID
  const eventConfigPda = useMemo(() => {
    if (!id) return null;
    try {
      const [pda] = findEventConfigPda(id);
      return pda;
    } catch {
      return null;
    }
  }, [id]);

  // On-chain purchase via Anchor program
  async function handleOnChainPurchase() {
    if (!eventConfigPda) return;
    setPurchasing(true);
    setTxSig(null);
    try {
      const sig = await purchaseToken(eventConfigPda, soldCount);
      setTxSig(sig);

      // Mirror the purchase into the DB so the holders table updates
      purchase.mutate({
        id: id!,
        data: {
          tokenId: soldCount,
          buyerWallet: publicKey!.toBase58(),
          priceSol: nextTokenPrice,
          txSignature: sig,
        },
      });

      toast({
        title: "Token purchased on-chain!",
        description: `Tx: ${sig.slice(0, 16)}…`,
      });
      queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(id!) });
      queryClient.invalidateQueries({ queryKey: ["holders", id!] });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Transaction failed", description: err.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  }

  // Claim revenue share for all owned tokens
  async function handleClaimRevenue() {
    if (!eventConfigPda || !publicKey) return;
    setClaiming(true);
    setClaimTxSig(null);
    try {
      // Find tokens owned by the connected wallet
      const ownedTokens = tokens.filter((t: any) => t.currentOwner === publicKey.toBase58());
      if (ownedTokens.length === 0) {
        toast({ title: "No tokens to claim", description: "You don't own any tokens for this event.", variant: "destructive" });
        return;
      }

      let lastSig = "";
      for (const token of ownedTokens) {
        if (token.revenueClaimed) continue;
        lastSig = await claimRevenue(eventConfigPda, token.tokenId);
      }

      if (lastSig) {
        setClaimTxSig(lastSig);
        toast({ title: "Revenue claimed!", description: `Tx: ${lastSig.slice(0, 16)}…` });
      }

      // Mirror claim to DB
      if (id && publicKey) {
        claimApi.mutate(
          { wallet: publicKey.toBase58(), eventId: id },
          {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(id!) }),
          }
        );
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Claim failed", description: err.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setClaiming(false);
    }
  }

  // Demo / simulate purchase (API-only, no wallet needed)
  function handleDemoPurchase() {
    if (!eventData) return;
    const demoWallet = `demo${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}xxxxxxxxxxxxxxxxxxxxxx`;
    purchase.mutate(
      {
        id: id!,
        data: {
          tokenId: soldCount,
          buyerWallet: demoWallet,
          priceSol: nextTokenPrice,
          txSignature: "demo-sig-" + Date.now(),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Simulated!", description: `Demo purchase for ${formatSol(nextTokenPrice)}` });
          queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(id!) });
          queryClient.invalidateQueries({ queryKey: ["holders", id!] });
        },
        onError: () => {
          toast({ title: "Purchase failed", variant: "destructive" });
        },
      }
    );
  }

  if (event.isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Skeleton className="h-8 w-48 bg-white/5 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
              <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
            </div>
            <Skeleton className="h-80 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Event not found</p>
          <Link href="/events">
            <button className="border border-white/20 text-white/80 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const stepFactor = (eventData.stepFactorBps / 10000).toFixed(1) + "x";
  const payoutFactor = (eventData.payoutFactorBps / 10000).toFixed(1) + "x";
  const revenueShare = (eventData.revenueShareBps / 100).toFixed(0) + "%";
  const fillPct = (soldCount / eventData.tokenCount) * 100;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Link href="/events">
          <button className="flex items-center gap-1 text-sm text-white/40 hover:text-white mb-6 transition-colors" data-testid="button-back-events">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Event header card */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {eventData.daddyxEnabled && (
                      <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full">
                        DaddyX
                      </span>
                    )}
                    {eventData.cancelled && (
                      <Badge variant="destructive" className="text-[10px]">Cancelled</Badge>
                    )}
                    {eventData.revenueReported && (
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">Settled</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-white" data-testid="text-event-title">{eventData.name}</h1>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-white/55">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span data-testid="text-detail-venue">{eventData.venueName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/55">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{formatDate(String(eventData.eventDate))} at {formatTime(String(eventData.eventDate))}</span>
                </div>
              </div>

              {eventData.description && (
                <p className="text-sm text-white/50 leading-relaxed mb-5">{eventData.description}</p>
              )}

              {/* Params grid */}
              {eventData.daddyxEnabled && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Token Supply", value: String(eventData.tokenCount) },
                    { label: "Step Factor (S)", value: stepFactor, accent: true },
                    { label: "Payout Factor (P)", value: payoutFactor },
                    { label: "Revenue Share", value: revenueShare, green: true },
                  ].map(({ label, value, accent, green }) => (
                    <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                      <div className="text-[10px] text-white/40 mb-1">{label}</div>
                      <div className={`text-sm font-bold ${accent ? "text-primary" : green ? "text-green-400" : "text-white"}`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="chart">
              <TabsList className="bg-white/[0.04] border border-white/10 w-full rounded-full p-1">
                <TabsTrigger value="chart" className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white/55 text-xs font-bold uppercase tracking-wider">Price Chart</TabsTrigger>
                <TabsTrigger value="holders" className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white/55 text-xs font-bold uppercase tracking-wider">Holders</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white/55 text-xs font-bold uppercase tracking-wider">History</TabsTrigger>
              </TabsList>

              <TabsContent value="chart">
                {simulation.data && simulation.data.length > 0 ? (
                  <PriceChart
                    data={simulation.data}
                    currentRound={soldCount}
                    title="Price Simulation (20 purchases)"
                  />
                ) : (
                  <div className="bg-card border border-card-border rounded-2xl p-8 text-center text-white/30 text-sm">
                    No simulation data available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="holders">
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  {holders.isLoading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full bg-white/5" />)}
                    </div>
                  ) : (holders.data ?? []).length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-sm">No token holders yet</div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-white/40">
                          <th className="text-left px-4 py-3 font-medium">#</th>
                          <th className="text-left px-4 py-3 font-medium">Wallet</th>
                          <th className="text-right px-4 py-3 font-medium">Entry Price</th>
                          <th className="text-right px-4 py-3 font-medium">Unrealised ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holders.data!.map((h: any, i: number) => (
                          <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors" data-testid={`row-holder-${i}`}>
                            <td className="px-4 py-3 text-white/30">{h.tokenId}</td>
                            <td className="px-4 py-3 text-white/60 font-mono">{h.wallet.slice(0, 8)}…{h.wallet.slice(-4)}</td>
                            <td className="px-4 py-3 text-right text-white">{formatSol(h.entryPrice)}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={h.unrealisedRoiPct > 0 ? "text-green-400" : "text-red-400"}>
                                {h.unrealisedRoiPct > 0 ? "+" : ""}{h.unrealisedRoiPct.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  {(event.data?.priceHistory ?? []).length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-sm">No purchase history yet</div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-white/40">
                          <th className="text-left px-4 py-3 font-medium">Round</th>
                          <th className="text-left px-4 py-3 font-medium">Wallet</th>
                          <th className="text-right px-4 py-3 font-medium">Price</th>
                          <th className="text-right px-4 py-3 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.data!.priceHistory.map((h: any, i: number) => (
                          <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors" data-testid={`row-history-${i}`}>
                            <td className="px-4 py-3 text-white/30">#{h.round}</td>
                            <td className="px-4 py-3 text-white/60 font-mono">{h.wallet.slice(0, 8)}…{h.wallet.slice(-4)}</td>
                            <td className="px-4 py-3 text-right text-primary font-medium">{formatSol(h.priceSol)}</td>
                            <td className="px-4 py-3 text-right text-white/30">{new Date(h.timestamp).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right — purchase panel */}
          <div className="space-y-4">
            {eventData.daddyxEnabled && !eventData.cancelled && (
              <div className="bg-card border border-primary/20 rounded-2xl p-5 sticky top-24">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Back This Event</h3>

                {/* Token progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                    <span>{soldCount} sold</span>
                    <span>{tokensRemaining} remaining</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                      data-testid="bar-detail-fill"
                    />
                  </div>
                </div>

                {/* Price display */}
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 text-center">
                  <div className="text-[10px] text-white/40 mb-1">Next Token Price</div>
                  <div className="text-2xl font-black text-white" data-testid="text-next-price">
                    {formatSol(nextTokenPrice)}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">
                    ≈ ${(nextTokenPrice * 150).toFixed(2)} USD
                  </div>
                </div>

                {/* Payout info */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="text-[10px] text-white/40 mb-1">You pay</div>
                    <div className="text-sm font-bold text-white">{formatSol(nextTokenPrice * eventData.stepFactorBps / 10000)}</div>
                    <div className="text-[9px] text-white/25 mt-0.5">price × {stepFactor}</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="text-[10px] text-white/40 mb-1">Next buyer pays you</div>
                    <div className="text-sm font-bold text-green-400">{formatSol(nextTokenPrice * eventData.stepFactorBps / 10000 * eventData.payoutFactorBps / 10000)}</div>
                    <div className="text-[9px] text-white/25 mt-0.5">your price × {payoutFactor}</div>
                  </div>
                </div>

                {/* Wallet connect / purchase button */}
                {tokensRemaining === 0 ? (
                  <button disabled className="w-full bg-white/10 text-white/40 py-3 rounded-full text-sm font-bold uppercase tracking-wider cursor-not-allowed">
                    Sold Out
                  </button>
                ) : !connected ? (
                  <WalletMultiButton className="!w-full !rounded-full !bg-primary !text-black !font-bold !text-sm !uppercase !tracking-wider !py-3 !justify-center" />
                ) : (
                  <>
                    <button
                      onClick={handleOnChainPurchase}
                      disabled={purchasing}
                      className="w-full bg-white text-black py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      data-testid="button-purchase-token"
                    >
                      {purchasing && <RefreshCw className="w-4 h-4 animate-spin" />}
                      {purchasing ? "Confirming on-chain…" : "Back This Event"}
                    </button>

                    {/* Tx confirmation link */}
                    {txSig && (
                      <p className="text-xs text-primary mt-2 text-center">
                        Confirmed:{" "}
                        <a
                          href={explorerUrl("tx", txSig)}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {txSig.slice(0, 12)}…
                        </a>
                        <ExternalLink className="inline w-3 h-3 ml-0.5 opacity-60" />
                      </p>
                    )}
                  </>
                )}

                {/* Demo simulate divider */}
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-white/25 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <button
                  className="w-full border border-white/10 text-white/40 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:border-white/20 hover:text-white/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleDemoPurchase}
                  disabled={purchase.isPending || tokensRemaining === 0}
                >
                  {purchase.isPending && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Simulate Purchase (no wallet)
                </button>

                <div className="flex items-start gap-2 mt-3 p-2.5 bg-white/[0.03] rounded-xl">
                  <Info className="w-3 h-3 text-white/30 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    Connect Phantom or Solflare to back this event on-chain via the Anchor program on Solana devnet.
                  </p>
                </div>
              </div>
            )}

            {eventData.revenueReported && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-green-400 mb-2">Revenue Settled</h3>
                <p className="text-xs text-white/50">
                  This event has been settled. Token holders can claim their share of{" "}
                  <span className="text-white font-medium">{formatSol(eventData.settledRevenue ?? 0)}</span> from the escrow.
                </p>
                {!connected ? (
                  <div className="mt-3">
                    <WalletMultiButton
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        background: "rgba(34,197,94,0.15)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "9999px",
                        color: "rgb(74,222,128)",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "10px 20px",
                        height: "auto",
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      className="w-full mt-3 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 text-xs font-bold uppercase tracking-wider py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleClaimRevenue}
                      disabled={claiming}
                      data-testid="button-claim-revenue"
                    >
                      {claiming && <RefreshCw className="w-3 h-3 animate-spin" />}
                      Claim Revenue Share
                    </button>
                    {claimTxSig && (
                      <a
                        href={explorerUrl("tx", claimTxSig)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-1 text-[10px] text-green-400/60 hover:text-green-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View claim on Explorer
                      </a>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Quick facts */}
            <div className="bg-card border border-card-border rounded-2xl p-4">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Event Details</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Organizer", value: eventData.organizerWallet.slice(0, 8) + "…" },
                  { label: "Revenue Share", value: revenueShare },
                  { label: "Step Factor", value: stepFactor },
                  { label: "Payout Factor", value: payoutFactor },
                  { label: "Initial Price", value: formatSol(eventData.initialPriceSol) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-white/40">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
