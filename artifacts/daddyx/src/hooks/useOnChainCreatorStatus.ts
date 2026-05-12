import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import { findCreatorProfilePda } from "@/lib/anchor";

export type OnChainCreatorStatus =
  | "loading"
  | "not-found"
  | "pending"
  | "approved"
  | "suspended";

/**
 * Fetch the on-chain CreatorProfile for the given wallet.
 * Returns one of: "loading" | "not-found" | "pending" | "approved" | "suspended".
 */
export function useOnChainCreatorStatus(wallet: PublicKey | null): OnChainCreatorStatus {
  const { program } = useAnchorProgram();
  const [status, setStatus] = useState<OnChainCreatorStatus>("loading");

  useEffect(() => {
    if (!wallet || !program) {
      setStatus("not-found");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const [pda] = await findCreatorProfilePda(wallet);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile = await (program.account as any).creatorProfile.fetchNullable(pda);
        if (cancelled) return;
        if (!profile) {
          setStatus("not-found");
          return;
        }
        // Anchor enum values come through as { pending: {} } / { approved: {} } etc.
        if (profile.status?.approved !== undefined) {
          setStatus("approved");
        } else if (profile.status?.suspended !== undefined) {
          setStatus("suspended");
        } else {
          setStatus("pending");
        }
      } catch {
        if (!cancelled) setStatus("not-found");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wallet, program]);

  return status;
}
