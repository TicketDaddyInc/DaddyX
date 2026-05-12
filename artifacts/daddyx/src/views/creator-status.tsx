"use client";

import { useState } from "react";
import { Search, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGetCreatorStatus, getGetCreatorStatusQueryKey } from "@workspace/api-client-react";

const STATUS_CONFIG = {
  pending: { label: "Under Review", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  suspended: { label: "Suspended", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

export default function CreatorStatusPage() {
  const [wallet, setWallet] = useState("");
  const [searchWallet, setSearchWallet] = useState("");

  const status = useGetCreatorStatus(
    { wallet: searchWallet },
    {
      query: {
        enabled: !!searchWallet,
        queryKey: getGetCreatorStatusQueryKey({ wallet: searchWallet }),
        retry: false,
      },
    }
  );

  function handleSearch() {
    setSearchWallet(wallet.trim());
  }

  const creator = status.data;
  const statusKey = creator?.status as keyof typeof STATUS_CONFIG | undefined;
  const statusInfo = statusKey ? STATUS_CONFIG[statusKey] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Creator Status</h1>
          <p className="text-white/50 text-sm">Check the status of your creator application.</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Enter your Solana wallet address..."
                className="pl-9 bg-white/4 border-white/12 text-white placeholder:text-white/25"
                data-testid="input-status-wallet"
              />
            </div>
            <Button onClick={handleSearch} className="gradient-red border-0" data-testid="button-check-status">
              Check
            </Button>
          </div>
        </div>

        {status.isLoading && (
          <div className="text-center py-8 text-white/40 text-sm">Checking status…</div>
        )}

        {status.isError && searchWallet && (
          <div className="bg-card border border-card-border rounded-xl p-6 text-center" data-testid="div-not-found">
            <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No application found for this wallet address.</p>
            <Button
              onClick={() => window.location.href = "/creator/apply"}
              className="mt-4 gradient-red border-0"
              data-testid="button-apply-now"
            >
              Apply Now
            </Button>
          </div>
        )}

        {creator && statusInfo && (
          <div className={`rounded-xl border p-6 ${statusInfo.bg}`} data-testid="div-creator-status">
            <div className="flex items-center gap-3 mb-5">
              <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
              <div>
                <div className="text-xs text-white/40">Application Status</div>
                <div className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Name", value: creator.name },
                { label: "Organization", value: creator.organization },
                { label: "Country", value: creator.country },
                { label: "City", value: creator.city },
                { label: "Applied", value: new Date(creator.appliedAt).toLocaleDateString() },
                ...(creator.approvedAt ? [{ label: "Approved", value: new Date(creator.approvedAt).toLocaleDateString() }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>

            {statusKey === "approved" && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 mb-3">
                  You are an approved DaddyX creator! You can now create events with fan-backed token financing.
                </p>
                <Button
                  onClick={() => window.location.href = "/organizer"}
                  className="w-full gradient-red border-0"
                  data-testid="button-go-organizer"
                >
                  Open Organizer Portal
                </Button>
              </div>
            )}

            {statusKey === "pending" && (
              <p className="mt-4 text-xs text-yellow-400/70">
                Applications are typically reviewed within 2–3 business days. You'll be notified by email.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
