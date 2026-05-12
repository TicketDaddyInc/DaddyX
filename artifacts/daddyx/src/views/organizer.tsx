"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Zap, ExternalLink, Loader2, ChevronUp, Droplets, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOrganizerEvents, getGetOrganizerEventsQueryKey, useCreateEvent } from "@workspace/api-client-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useInitializeEvent } from "@/hooks/useInitializeEvent";
import { useOnChainCreatorStatus } from "@/hooks/useOnChainCreatorStatus";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const connectedWallet = publicKey?.toBase58() ?? "";
  const [wallet, setWallet] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [airdropping, setAirdropping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initializeEvent, connected } = useInitializeEvent();
  const createEventApi = useCreateEvent();
  const creatorStatus = useOnChainCreatorStatus(publicKey ?? null);

  // Default values for new event form
  const [newEvent, setNewEvent] = useState({
    name: "",
    venueName: "",
    description: "",
    eventDate: "",
    endDate: "",
    tokenCount: 10,
    initialPriceSol: 0.05,
    revenueShareBps: 2000,
    stepFactorBps: 15000,
    payoutFactorBps: 12000,
    oracle: "",
    campaignDetailsUri: "",
    budgetUsdCents: 100000,
    remedyType: "CancelFullRefund" as const,
  });

  // Sync with connected wallet
  useEffect(() => {
    if (connectedWallet) {
      setWallet(connectedWallet);
      setInputValue(connectedWallet);
    }
  }, [connectedWallet]);

  // Fetch devnet SOL balance whenever wallet changes
  const refreshBalance = useCallback(async () => {
    if (!publicKey) { setSolBalance(null); return; }
    try {
      const bal = await connection.getBalance(publicKey);
      setSolBalance(bal / LAMPORTS_PER_SOL);
    } catch {
      setSolBalance(null);
    }
  }, [publicKey, connection]);

  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  const handleAirdrop = async () => {
    if (!publicKey) return;
    setAirdropping(true);
    try {
      const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      await refreshBalance();
      toast({ title: "Airdrop received!", description: "1 devnet SOL added to your wallet." });
    } catch (err: any) {
      toast({ title: "Airdrop failed", description: err?.message ?? "Try again in a few seconds.", variant: "destructive" });
    } finally {
      setAirdropping(false);
    }
  };

  const orgEvents = useGetOrganizerEvents(wallet, {
    query: {
      enabled: !!wallet,
      queryKey: getGetOrganizerEventsQueryKey(wallet),
    },
  });

  const events = orgEvents.data ?? [];
  const totalRaised = events.reduce((s: number, e: any) => s + (e.capitalRaisedSol ?? 0), 0);
  const totalSold = events.reduce((s: number, e: any) => s + (e.tokensSold ?? 0), 0);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!connected || !publicKey) {
      toast({ title: "Connect wallet", description: "You must connect your wallet to create an event.", variant: "destructive" });
      return;
    }

    const endDateTs = Math.floor(new Date(newEvent.endDate).getTime() / 1000);
    const oraclePubkey = newEvent.oracle || publicKey.toBase58(); // default oracle = organizer

    // Generate a unique event ID (timestamp-based, max 32 chars)
    const eventId = `event-${Date.now().toString(36)}`.slice(0, 32);

    setCreating(true);
    try {
      // Step 1: On-chain initialization (event config + all token slots)
      const { eventConfigPda, initEventSig, initTokenSigs } = await initializeEvent({
        eventId,
        revenueShareBps: newEvent.revenueShareBps,
        initialPriceSol: newEvent.initialPriceSol,
        stepFactorBps: newEvent.stepFactorBps,
        payoutFactorBps: newEvent.payoutFactorBps,
        tokenCount: newEvent.tokenCount,
        endDateTs,
        oracle: oraclePubkey,
        campaignDetailsUri: newEvent.campaignDetailsUri || `https://daddyx.io/events/${eventId}`,
        budgetUsdCents: newEvent.budgetUsdCents,
        remedyType: newEvent.remedyType,
      });

      toast({ title: `Event initialized on-chain! (${initTokenSigs.length} tokens)`, description: `Tx: ${initEventSig.slice(0, 16)}…` });

      // Step 2: Mirror to database
      createEventApi.mutate(
        {
          data: {
            eventConfigPda: eventConfigPda.toBase58(),
            name: newEvent.name,
            venueName: newEvent.venueName,
            description: newEvent.description,
            eventDate: new Date(newEvent.eventDate).toISOString(),
            endDate: new Date(newEvent.endDate).toISOString(),
            organizerWallet: publicKey.toBase58(),
            revenueShareBps: newEvent.revenueShareBps,
            initialPriceSol: newEvent.initialPriceSol,
            stepFactorBps: newEvent.stepFactorBps,
            payoutFactorBps: newEvent.payoutFactorBps,
            tokenCount: newEvent.tokenCount,
            daddyxEnabled: true,
          } as any,
        },
        {
          onSuccess: () => {
            toast({ title: "Event created!", description: `${newEvent.name} is now live on DaddyX.` });
            queryClient.invalidateQueries({ queryKey: getGetOrganizerEventsQueryKey(connectedWallet) });
            setShowCreateForm(false);
            setNewEvent({
              name: "", venueName: "", description: "", eventDate: "", endDate: "",
              tokenCount: 10, initialPriceSol: 0.05, revenueShareBps: 2000,
              stepFactorBps: 15000, payoutFactorBps: 12000, oracle: "",
              campaignDetailsUri: "", budgetUsdCents: 100000, remedyType: "CancelFullRefund",
            });
          },
          onError: (err: any) => {
            toast({ title: "DB sync failed", description: err?.message ?? "Event created on-chain but DB update failed.", variant: "destructive" });
          },
        }
      );
    } catch (err: any) {
      console.error(err);
      const msg: string = err?.message ?? "Unknown error";
      const isNoBalance = msg.includes("debit") || msg.includes("no record of a prior credit") || msg.includes("insufficient");
      toast({
        title: "Event creation failed",
        description: isNoBalance
          ? "Your wallet has insufficient SOL. Click 'Get Devnet SOL' to fund it."
          : msg,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Organizer Portal</h1>
            <p className="text-white/50 text-sm">Manage your DaddyX events and track capital raised.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="gradient-red border-0 glow-red-sm"
              onClick={() => setShowCreateForm((v) => !v)}
              disabled={!connected || creatorStatus !== "approved"}
              data-testid="button-create-event"
            >
              {showCreateForm ? <ChevronUp className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
              {showCreateForm ? "Cancel" : "Create Event"}
            </Button>
            <Link href="/creator/apply">
              <Button variant="outline" className="border-white/20 text-white/70 bg-transparent text-xs" data-testid="button-apply-organizer">
                Apply as Creator
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Wallet connect status ─────────────────────────────── */}
        {!connectedWallet ? (
          <div className="bg-card border border-card-border rounded-xl p-6 mb-6 flex flex-col items-center gap-4 text-center">
            <p className="text-white/50 text-sm">Connect your wallet to automatically load your events.</p>
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
              data-testid="button-wallet-connect-organizer"
            />
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl p-4 mb-6 flex items-center gap-3 flex-wrap">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <p className="text-xs text-white/60 font-mono flex-1 truncate min-w-0">{connectedWallet}</p>
            {/* Devnet balance + airdrop */}
            {solBalance !== null && (
              <span className="text-xs text-white/40 font-mono shrink-0">{solBalance.toFixed(3)} SOL</span>
            )}
            {solBalance !== null && solBalance < 0.05 && (
              <Button
                size="sm"
                variant="outline"
                className="border-[#E63946]/40 text-[#E63946] bg-transparent text-xs gap-1.5 shrink-0"
                onClick={handleAirdrop}
                disabled={airdropping}
                data-testid="button-airdrop-organizer"
              >
                {airdropping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Droplets className="w-3 h-3" />}
                Get Devnet SOL
              </Button>
            )}
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

        {/* ── Creator status gate ───────────────────────────────── */}
        {connectedWallet && creatorStatus === "loading" && (
          <div className="bg-card border border-card-border rounded-xl p-5 mb-6 flex items-center gap-3 text-white/50 text-sm">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Checking creator status…
          </div>
        )}

        {connectedWallet && creatorStatus === "not-found" && (
          <div className="bg-yellow-500/8 border border-yellow-500/30 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4" data-testid="banner-not-creator">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-300 mb-0.5">Creator account required</p>
              <p className="text-xs text-white/50">
                You must be an approved DaddyX Creator before you can create events. Apply below — review takes 2–3 business days.
              </p>
            </div>
            <Link href="/creator/apply" className="shrink-0">
              <Button className="gradient-red border-0 text-xs" data-testid="button-gate-apply">Apply as Creator</Button>
            </Link>
          </div>
        )}

        {connectedWallet && creatorStatus === "pending" && (
          <div className="bg-blue-500/8 border border-blue-500/30 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4" data-testid="banner-pending-creator">
            <Loader2 className="w-5 h-5 text-blue-400 shrink-0 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-300 mb-0.5">Application under review</p>
              <p className="text-xs text-white/50">
                Your creator application is pending admin approval. You will be able to create events once approved.
              </p>
            </div>
            <Link href="/creator/status" className="shrink-0">
              <Button variant="outline" className="border-white/20 text-white/60 bg-transparent text-xs" data-testid="button-gate-status">Check Status</Button>
            </Link>
          </div>
        )}

        {connectedWallet && creatorStatus === "suspended" && (
          <div className="bg-red-500/8 border border-red-500/30 rounded-xl p-5 mb-6 flex items-start gap-4" data-testid="banner-suspended-creator">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300 mb-0.5">Account suspended</p>
              <p className="text-xs text-white/50">Your creator account has been suspended. Please contact support.</p>
            </div>
          </div>
        )}

        {/* Wallet selector */}
        <div className="bg-card border border-card-border rounded-xl p-5 mb-6">
          <p className="text-[10px] text-white/30 mb-3 uppercase tracking-wider">Look up any organizer wallet</p>
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

        {/* ── Create Event Form (only for approved creators) ──── */}
        {showCreateForm && connected && creatorStatus === "approved" && (
          <div className="bg-card border border-[#E63946]/30 rounded-xl p-6 mb-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#E63946]" /> Create New DaddyX Event
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Event Name *</label>
                  <Input value={newEvent.name} onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))} placeholder="e.g. AfroNation Lagos 2026" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" required data-testid="input-event-name" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Venue *</label>
                  <Input value={newEvent.venueName} onChange={e => setNewEvent(v => ({ ...v, venueName: e.target.value }))} placeholder="Venue name" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" required data-testid="input-venue-name" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Event Date *</label>
                  <Input type="datetime-local" value={newEvent.eventDate} onChange={e => setNewEvent(v => ({ ...v, eventDate: e.target.value }))} className="bg-white/4 border-white/12 text-white" required data-testid="input-event-date" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Sale End Date *</label>
                  <Input type="datetime-local" value={newEvent.endDate} onChange={e => setNewEvent(v => ({ ...v, endDate: e.target.value }))} className="bg-white/4 border-white/12 text-white" required data-testid="input-end-date" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Token Count (max 50)</label>
                  <Input type="number" min={1} max={50} value={newEvent.tokenCount} onChange={e => setNewEvent(v => ({ ...v, tokenCount: Number(e.target.value) }))} className="bg-white/4 border-white/12 text-white" data-testid="input-token-count" />
                  {newEvent.tokenCount > 20 && <p className="text-[10px] text-yellow-400/70 mt-1">Warning: {newEvent.tokenCount} wallet confirmations required (one per token).</p>}
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Initial Price (SOL)</label>
                  <Input type="number" step="0.001" min={0.001} value={newEvent.initialPriceSol} onChange={e => setNewEvent(v => ({ ...v, initialPriceSol: Number(e.target.value) }))} className="bg-white/4 border-white/12 text-white" data-testid="input-initial-price" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Revenue Share BPS (e.g. 2000 = 20%)</label>
                  <Input type="number" min={100} max={5000} value={newEvent.revenueShareBps} onChange={e => setNewEvent(v => ({ ...v, revenueShareBps: Number(e.target.value) }))} className="bg-white/4 border-white/12 text-white" data-testid="input-revenue-share" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Step Factor BPS (e.g. 15000 = 1.5×)</label>
                  <Input type="number" min={10100} value={newEvent.stepFactorBps} onChange={e => setNewEvent(v => ({ ...v, stepFactorBps: Number(e.target.value) }))} className="bg-white/4 border-white/12 text-white" data-testid="input-step-factor" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Payout Factor BPS (e.g. 12000 = 1.2×, must be &lt; Step)</label>
                  <Input type="number" min={10100} value={newEvent.payoutFactorBps} onChange={e => setNewEvent(v => ({ ...v, payoutFactorBps: Number(e.target.value) }))} className="bg-white/4 border-white/12 text-white" data-testid="input-payout-factor" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Oracle Wallet (default: your wallet)</label>
                  <Input value={newEvent.oracle} onChange={e => setNewEvent(v => ({ ...v, oracle: e.target.value }))} placeholder={publicKey?.toBase58() ?? ""} className="bg-white/4 border-white/12 text-white placeholder:text-white/20 font-mono text-xs" data-testid="input-oracle" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Budget (USD cents, e.g. 100000 = $1000)</label>
                  <Input type="number" min={1000} value={newEvent.budgetUsdCents} onChange={e => setNewEvent(v => ({ ...v, budgetUsdCents: Number(e.target.value) }))} className="bg-white/4 border-white/12 text-white" data-testid="input-budget" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Description</label>
                  <Input value={newEvent.description} onChange={e => setNewEvent(v => ({ ...v, description: e.target.value }))} placeholder="Short description of the event" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-description" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gradient-red border-0 glow-red font-semibold h-11"
                disabled={creating}
                data-testid="button-submit-create-event"
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating on-chain… ({newEvent.tokenCount} tokens)</>
                ) : (
                  `Create Event (${newEvent.tokenCount} token${newEvent.tokenCount !== 1 ? "s" : ""} on-chain)`
                )}
              </Button>
            </form>
          </div>
        )}

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
