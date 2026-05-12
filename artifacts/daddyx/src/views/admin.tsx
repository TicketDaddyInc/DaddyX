"use client";

import { ShieldCheck, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListPendingCreators, useApproveCreator, useRejectCreator, useGetOraclePending,
  getListPendingCreatorsQueryKey, getGetOraclePendingQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAdminApproveOnChain } from "@/hooks/useAdminApproveOnChain";
import Link from "next/link";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const adminWallet = publicKey?.toBase58() ?? "";

  const pending = useListPendingCreators();
  const oracle = useGetOraclePending();
  const approve = useApproveCreator();
  const reject = useRejectCreator();
  const { approveOnChain } = useAdminApproveOnChain();

  async function handleApprove(wallet: string) {
    // Step 1: On-chain approve (if admin wallet connected)
    if (adminWallet) {
      try {
        await approveOnChain(wallet);
      } catch (chainErr: any) {
        // If creator not found on-chain (e.g. applied via DB only), skip on-chain step
        const msg: string = chainErr?.message ?? "";
        if (!msg.includes("Account does not exist") && !msg.includes("does not exist")) {
          toast({ title: "On-chain approval failed", description: msg, variant: "destructive" });
          return;
        }
      }
    }
    // Step 2: DB update
    approve.mutate(
      { data: { wallet, adminWallet } },
      {
        onSuccess: () => {
          toast({ title: "Creator approved!", description: `${wallet.slice(0, 8)}… approved successfully.` });
          queryClient.invalidateQueries({ queryKey: getListPendingCreatorsQueryKey() });
        },
        onError: () => toast({ title: "Approval failed", variant: "destructive" }),
      }
    );
  }

  function handleReject(wallet: string) {
    reject.mutate(
      { data: { wallet, adminWallet } },
      {
        onSuccess: () => {
          toast({ title: "Creator rejected", description: `${wallet.slice(0, 8)}… rejected.` });
          queryClient.invalidateQueries({ queryKey: getListPendingCreatorsQueryKey() });
        },
        onError: () => toast({ title: "Rejection failed", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E63946]/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#E63946]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/40 text-sm">Manage creator applications and oracle settlements.</p>
            </div>
          </div>
          <WalletMultiButton
            style={{
              background: adminWallet ? "transparent" : "linear-gradient(135deg,#E63946,#c1121f)",
              border: adminWallet ? "1px solid rgba(255,255,255,0.15)" : "0",
              borderRadius: "9999px",
              color: adminWallet ? "rgba(255,255,255,0.6)" : "#fff",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "8px 18px",
              height: "auto",
            }}
            data-testid="button-wallet-connect-admin"
          />
        </div>

        {!adminWallet && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-yellow-400/80 text-sm">Connect your admin wallet above to approve or reject creator applications.</p>
          </div>
        )}

        <Tabs defaultValue="creators">
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="creators" className="data-[state=active]:bg-[#E63946] data-[state=active]:text-white text-white/60">
              <Users className="w-4 h-4 mr-1.5" /> Pending Creators
              {(pending.data?.length ?? 0) > 0 && (
                <Badge className="ml-2 bg-[#E63946] text-white border-0 text-[10px] px-1.5 py-0.5 rounded-full">
                  {pending.data!.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="oracle" className="data-[state=active]:bg-[#E63946] data-[state=active]:text-white text-white/60">
              <Clock className="w-4 h-4 mr-1.5" /> Oracle Queue
              {(oracle.data?.length ?? 0) > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-black border-0 text-[10px] px-1.5 py-0.5 rounded-full">
                  {oracle.data!.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creators">
            {pending.isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl" />)}
              </div>
            ) : (pending.data ?? []).length === 0 ? (
              <div className="text-center py-16 bg-card border border-card-border rounded-xl">
                <CheckCircle className="w-10 h-10 text-green-400/30 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No pending creator applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.data!.map((creator: any, i: number) => (
                  <div key={i} className="bg-card border border-card-border rounded-xl p-5 hover:border-white/20 transition-all" data-testid={`card-pending-creator-${i}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white">{creator.name}</h3>
                          <Badge className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-[10px]">Pending</Badge>
                        </div>
                        <p className="text-xs text-white/50">{creator.organization} · {creator.city}, {creator.country}</p>
                        <p className="text-xs text-white/30 font-mono mt-1">{creator.wallet.slice(0, 12)}…{creator.wallet.slice(-6)}</p>
                        {creator.expectedUse && (
                          <p className="text-xs text-white/40 mt-2 line-clamp-2">{creator.expectedUse}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="gradient-red border-0 text-xs h-8"
                          onClick={() => handleApprove(creator.wallet)}
                          disabled={approve.isPending}
                          data-testid={`button-approve-${i}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 text-white/50 bg-transparent text-xs h-8"
                          onClick={() => handleReject(creator.wallet)}
                          disabled={reject.isPending}
                          data-testid={`button-reject-${i}`}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="oracle">
            {oracle.isLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl" />)}
              </div>
            ) : (oracle.data ?? []).length === 0 ? (
              <div className="text-center py-16 bg-card border border-card-border rounded-xl">
                <Clock className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No events pending oracle settlement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {oracle.data!.map((evt: any, i: number) => (
                  <div key={i} className="bg-card border border-yellow-500/20 rounded-xl p-5" data-testid={`card-oracle-${i}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-400" />
                          <h3 className="text-sm font-semibold text-white">{evt.name}</h3>
                        </div>
                        <p className="text-xs text-white/50">{evt.venueName}</p>
                        <p className="text-xs text-white/30 mt-1">
                          Event date: {new Date(evt.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/events/${evt.id}`}>
                        <Button size="sm" className="gradient-red border-0 text-xs h-8" data-testid={`button-settle-${i}`}>
                          Report Revenue
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
