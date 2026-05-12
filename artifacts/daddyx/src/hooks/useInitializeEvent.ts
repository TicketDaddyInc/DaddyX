import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useAnchorProgram } from "./useAnchorProgram";
import {
  findEventConfigPda,
  findEventEscrowPda,
  findCreatorProfilePda,
  findTokenStatePda,
  solToLamports,
} from "@/lib/anchor";
import { PLATFORM_FEE_BPS } from "@/lib/constants";

export type InitializeEventParams = {
  /** Unique string ID for this event (max 32 bytes) */
  eventId: string;
  revenueShareBps: number;
  initialPriceSol: number;
  stepFactorBps: number;
  payoutFactorBps: number;
  tokenCount: number;
  /** Unix timestamp (seconds) for event end date */
  endDateTs: number;
  oracle: string;
  campaignDetailsUri: string;
  budgetUsdCents: number;
  /** "CancelFullRefund" | "PostponeTransfer" | "PartialRefund" */
  remedyType: "CancelFullRefund" | "PostponeTransfer" | "PartialRefund";
};

export type InitializeEventResult = {
  eventConfigPda: PublicKey;
  initEventSig: string;
  initTokenSigs: string[];
};

/**
 * Calls `initialize_event` then loops `initialize_token` for each slot.
 * Returns the event config PDA and all transaction signatures.
 *
 * NOTE: token init loop can be slow for large tokenCount. Warn users if > 20.
 */
export function useInitializeEvent() {
  const { program } = useAnchorProgram();
  const wallet = useWallet();

  const initializeEvent = async (
    params: InitializeEventParams
  ): Promise<InitializeEventResult> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Connect your wallet first");
    }
    if (!program) {
      throw new Error("Program not initialised — wallet may not be connected");
    }

    const {
      eventId,
      revenueShareBps,
      initialPriceSol,
      stepFactorBps,
      payoutFactorBps,
      tokenCount,
      endDateTs,
      oracle,
      campaignDetailsUri,
      budgetUsdCents,
      remedyType,
    } = params;

    // Encode event_id as a fixed 32-byte array (zero-padded)
    const eventIdBytes = new Uint8Array(32);
    const encoded = new TextEncoder().encode(eventId.slice(0, 32));
    eventIdBytes.set(encoded);

    const initialPriceLamports = solToLamports(initialPriceSol);

    // Derive PDAs — use the already-padded 32-byte array so the seed matches on-chain
    const [eventConfigPda] = findEventConfigPda(eventIdBytes);
    const [eventEscrowPda] = findEventEscrowPda(eventConfigPda);
    const [creatorProfilePda] = await findCreatorProfilePda(wallet.publicKey);

    // Map remedy type to Anchor-compatible enum object
    const remedyArg =
      remedyType === "CancelFullRefund"
        ? { cancelFullRefund: {} }
        : remedyType === "PostponeTransfer"
        ? { postponeTransfer: {} }
        : { partialRefund: {} };

    // Step 1: Initialize event config + escrow
    const initEventSig = await program.methods
      .initializeEvent(
        Array.from(eventIdBytes),
        new BN(revenueShareBps),
        new BN(initialPriceLamports.toString()),
        new BN(stepFactorBps),
        new BN(payoutFactorBps),
        new BN(tokenCount),
        new BN(endDateTs),
        new PublicKey(oracle),
        new BN(PLATFORM_FEE_BPS),
        campaignDetailsUri,
        new BN(budgetUsdCents),
        remedyArg
      )
      .accounts({
        eventConfig: eventConfigPda,
        eventEscrow: eventEscrowPda,
        creatorProfile: creatorProfilePda,
        organizer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Step 2: Initialize each token slot
    const initTokenSigs: string[] = [];
    for (let i = 0; i < tokenCount; i++) {
      const [tokenStatePda] = findTokenStatePda(eventConfigPda, i);
      const sig = await program.methods
        .initializeToken(new BN(i))
        .accounts({
          tokenState: tokenStatePda,
          eventConfig: eventConfigPda,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      initTokenSigs.push(sig);
    }

    return { eventConfigPda, initEventSig, initTokenSigs };
  };

  return {
    initializeEvent,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
  };
}
